import { Job } from "bull";
import logger from "../utils/logger";
import { Container } from "typescript-ioc";
import { InvalidUrlException } from "../services/screenshot/exceptions";
import ScreenshotService from "../services/screenshot/screenshot.service";

type Data = {
  url: string;
  email: string;
};

class ScreenshotAndMailJob {
  public static get key(): string {
    return "screenshot-and-mail";
  }

  public static get concurrency() {
    return 5;
  }

  async handle(job: Job<Data>): Promise<object> {
    const screenshotService = Container.get(ScreenshotService);

    try {
      const data = job.data;
      const imageUrl = await screenshotService.getOrScreenshot(data.url);
      logger.info(`Screenshoter for [${data.url}] is [${imageUrl}]`);
    } catch (err) {
      logger.error(`Job Error (${job.name}): `, err);

      // Handle Custom error.
      if (err instanceof InvalidUrlException) {
        logger.info("sending mail");
        // TODO: Send invalid URL email to user
        return { msg: "Invalid URL Email sent" };
      }

      throw err;
    }
  }
}

export default ScreenshotAndMailJob;
