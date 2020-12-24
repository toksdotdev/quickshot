import { AppConfig } from "config";
import RedisClient, { Redis } from "ioredis";

class RedisService {
  client: Redis;

  snapshotPrefix = "v1.browser.snapshot";

  constructor(config: AppConfig) {
    this.client = new RedisClient(
      config.redis.port,
      config.redis.host,
      config.redis.options
    );
  }

  /**
   * Get screenshot URL of a page URL.
   * @param url Page URL
   */
  async getScreenshotUrl(url: string): Promise<string | null> {
    return this.client.get(`${this.snapshotPrefix}.${url.trim()}`);
  }

  /**
   * Set a page's URL screenshot to the URL provided.
   * @param url Page URL
   * @param url Screenshot URL
   */
  async setScreenshotUrl(url: string, screenshotUrl: string) {
    await this.client.set(
      `${this.snapshotPrefix}.${url.trim()}`,
      screenshotUrl
    );
  }
}

export default RedisService;
