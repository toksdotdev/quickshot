// Initialize IOC for new job process.
import { configure as configureIoc } from "../ioc";
import config from "../config";
configureIoc(config);

import { Job } from "bull";
import logger from "../utils/logger";
import { Container } from "typescript-ioc";
import { InvalidUrlException } from "../services/screenshot/exceptions";
import ScreenshotService from "../services/screenshot/screenshot.service";

type Data = {
  url: string;
  email: string;
};

/**
 * Job to screenshot a URL, and send to the email specified.
 * @param data Job data
 */
const screenshotAndMail = async function (job: Job<Data>) {
  const screenshotService: ScreenshotService = Container.get(ScreenshotService);

  try {
    const data = job.data;
    const imageUrl = await screenshotService.getOrScreenshot(data.url);
    logger.info(`Screenshot for [${data.url}] is [${imageUrl}]`);
  } catch (err) {
    logger.error(`Job Error (${job.name}): `, err);

    // Handle Custom error.
    if (err instanceof InvalidUrlException) {
      // TODO: Send invalid URL email to user
      return true;
    }

    throw err;
  }
};

export default screenshotAndMail;
