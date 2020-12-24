import logger from "../utils/logger";
import * as metrics from "../metrics";
import RedisService from "./redis.service";
import StorageService from "./storage.service";
import puppeteer, { Browser } from "puppeteer";

class ScreenshotService {
  constructor(
    private redisService: RedisService,
    private storageService: StorageService
  ) {}

  private browser?: Browser;

  /**
   * Startup chromium browser instance.
   */
  public async setup() {
    if (!this.browser) {
      this.browser = await puppeteer.launch();
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
      .replace(/^(https|https):\/\//i, "");
  }

  /**
   * Screenshot the page of a URL. If screenshot already exists in cache,
   * return it.
   *
   * @param url URL to screenshot.
   */
  public async getOrScreenshot(url: string): Promise<string> {
    const basicUrl = this.cleanUrl(url);

    // Fetch from cache if exist.
    const screenshotUrl = await this.redisService.getScreenshotUrl(basicUrl);
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
    await this.redisService.setScreenshotUrl(basicUrl, result.url);
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
      await page.goto(url);
      const image = await page.screenshot({ fullPage: true });
      page.close();

      metrics.urlScreenshots.inc({ success: 1 });
      return image;
    } catch (err) {
      metrics.urlScreenshots.inc({ failed: 1 });
      throw err;
    }
  }
}

export default ScreenshotService;
