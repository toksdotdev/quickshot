import logger from "../utils/logger";
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
  public async fetchOrCapture(url: string): Promise<string> {
    const formattedUrl = this.cleanUrl(url);

    // Fetch from cache if exist.
    const screenshotUrl = await this.redisService.getScreenshotUrl(
      formattedUrl
    );

    if (screenshotUrl) {
      logger.info(`Screenshot URL [${url}] found in cache as ${screenshotUrl}`);
      return screenshotUrl;
    }
    
    // Capture & Upload Image.
    const image = await this.screenshot(url);  
    logger.info(`Screenshot URL [${url}] captured; Now uploading to storage.`);

    const result = await this.storageService.upload(image);
    logger.info(
      `Screenshot URL [${url}] uploaded to storage successfully with meta ${JSON.stringify(
        result
      )}.`
    );

    // Cache image URL.
    await this.redisService.setScreenshotUrl(formattedUrl, result.url);
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

    const page = await this.browser.newPage();
    await page.goto(url);
    const image = await page.screenshot({ fullPage: true });
    page.close();

    return image;
  }
}

export default ScreenshotService;
