import logger from "../../utils/logger";
import * as metrics from "../../metrics";
import puppeteer, { Browser } from "puppeteer";
import { InvalidUrlException } from "./exceptions";
import { CacheService } from "../cache/cache.service";
import { StorageService } from "../storage/storage.service";

class ScreenshotService {
  public static readonly cacheScreenshotPrefix = "valiu.screenshot-service.v1";

  constructor(
    private cacheService: CacheService,
    private storageService: StorageService
  ) {}

  private browser?: Browser;

  public getBrowser(): Browser {
    return this.browser;
  }

  /**
   * Startup chromium browser instance.
   */
  public async setup() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        defaultViewport: { width: 1024, height: 768 },
        args: [
          // Required for Docker version of Puppeteer
          "--no-sandbox",
          "--disable-setuid-sandbox",
          // This will write shared memory files into /tmp instead of /dev/shm,
          // because Docker’s default for /dev/shm is 64MB
          "--disable-dev-shm-usage",
        ],
      });
    }
  }

  /**
   * Shutdown chromium browser instance.
   */
  public async shutdown() {
    if (this.browser) {
      await this.browser.close();
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

    try {
      const page = await this.browser.newPage();
      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 10000,
      });

      if (!response.ok()) throw new InvalidUrlException(url);
      const image = await page.screenshot({ fullPage: true });
      await page.close();

      metrics.urlScreenshots.inc({ success: 1 });
      return image;
    } catch (err) {
      metrics.urlScreenshots.inc({ failed: 1 });

      if ((err as Error).message.includes("ERR_NAME_NOT_RESOLVED")) {
        throw new InvalidUrlException(url);
      }

      throw err;
    }
  }
}

export default ScreenshotService;
