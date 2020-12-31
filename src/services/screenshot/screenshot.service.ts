import { Mutex } from "async-mutex";
import logger from "../../utils/logger";
import { CacheService } from "../cache";
import * as metrics from "../../metrics";
import { StorageService } from "../storage";
import { InvalidUrlException } from "./exceptions";
import puppeteer, { Browser, BrowserContext } from "puppeteer";

class ScreenshotService {
  private browser?: Browser;
  private icognitoBrowser?: BrowserContext;

  private browserLock: Mutex;

  public static readonly cacheScreenshotPrefix = "quickshot.screenshot-service.v1";

  constructor(
    private cacheService: CacheService,
    private storageService: StorageService
  ) {
    this.browserLock = new Mutex();
  }

  public getBrowser(): Browser {
    return this.browser;
  }

  public getBrowserLock(): Mutex {
    return this.browserLock;
  }

  /**
   * Startup chromium browser instance.
   */
  public async setup() {
    const releaseLock = await this.browserLock.acquire();

    try {
      if (this.browser == null) {
        console.log("Starting browser");

        // Launch Browser
        this.browser = await puppeteer.launch({
          defaultViewport: { width: 1024, height: 768 },
          args: [
            "--incognito",
            // "--disable-setuid-sandbox",
            // This will write shared memory files into /tmp instead of /dev/shm,
            // because Docker’s default for /dev/shm is 64MB
            "--disable-dev-shm-usage",
          ],
        });

        // Get Icognito context & delete initial browser instance
        console.log("Switching browser to icognito mode");
        this.icognitoBrowser = await this.browser.createIncognitoBrowserContext();
        const pages = await this.browser.pages();
        await pages[0].close();
      }
    } finally {
      releaseLock();
    }
  }

  /**
   * Shutdown chromium browser instance.
   */
  public async shutdown() {
    if (this.icognitoBrowser != null) {
      await this.icognitoBrowser.close();
      this.icognitoBrowser = null;
    }

    if (this.browser != null) {
      await this.browser.close();
      this.browser.process().kill();
      this.browser = null;
    }
  }

  private cleanUrl(url: string): string {
    return url
      .toLowerCase()
      .trim()
      .replace(/^(http|https):\/\//i, "");
  }

  /**
   * Get the Cache key for storing URL screenshot.
   * @param url URL
   */
  private cacheKey(url: string) {
    return `${ScreenshotService.cacheScreenshotPrefix}.${url.trim()}`;
  }

  /**
   * Screenshot the page of a URL. If screenshot already exists in cache,
   * return it.
   *
   * @param url URL to screenshot.
   */
  public async getOrScreenshot(url: string): Promise<string> {
    const basicUrl = this.cleanUrl(url);
    const cacheKey = this.cacheKey(basicUrl);

    // Fetch from cache if exist.
    const screenshotUrl = await this.cacheService.get(cacheKey);
    if (screenshotUrl) {
      metrics.urlScreenshots.inc({ cached: 1 });
      logger.info(`Screenshot URL [${url}] found in cache as ${screenshotUrl}`);
      return screenshotUrl;
    }

    // Capture Image.
    const image = await this.screenshot(url);
    logger.info(`Screenshot URL [${url}] captured; Now uploading to storage.`);

    // Upload Image to Store.
    const result = await this.storageService.upload(image);
    logger.info(
      `Screenshot URL [${url}] uploaded to storage successfully with meta ${JSON.stringify(
        result
      )}.`
    );

    // Cache Screenshot to URL.
    await this.cacheService.set(cacheKey, result.url);
    logger.info(
      `Screenshot URL [${url}] with [${result.url}] saved to cache successfully.`
    );

    return result.url;
  }

  /**
   * Get a full page screenshot of a url specified.
   * @param url Page to capture.
   */
  async screenshot(url: string): Promise<Buffer> {
    await this.setup();
    let page: puppeteer.Page;

    try {
      page = await this.browser.newPage();
      const response = await page.goto(url, { timeout: 30000 });

      if (!response.ok()) throw new InvalidUrlException(url);
      const image = await page.screenshot({ fullPage: true });

      metrics.urlScreenshots.inc({ success: 1 });
      return image;
    } catch (err) {
      logger.error(err);
      metrics.urlScreenshots.inc({ failed: 1 });

      if ((err as Error).message.includes("ERR_NAME_NOT_RESOLVED")) {
        throw new InvalidUrlException(url);
      }

      throw err;
    } finally {
      if (page != null && !page.isClosed()) await page.close();
    }
  }
}

export default ScreenshotService;
