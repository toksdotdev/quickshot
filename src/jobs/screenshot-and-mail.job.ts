/* eslint-disable @typescript-eslint/no-explicit-any */
import { Job } from "bull";
import { AppConfig } from "config";
import logger from "../utils/logger";
import { Container } from "typescript-ioc";
import MailService from "../services/mail.service";
import { InvalidUrlException } from "../services/screenshot/exceptions";
import ScreenshotService from "../services/screenshot/screenshot.service";


type Data = {
  url: string;
  email: string;
};

class ScreenshotAndMailJob {
  /**
   * Job ID.
   */
  public static get key(): string {
    return "screenshot-and-mail";
  }

  /**
   * How many workers job should run in parallel.
   */
  public static get concurrency() {
    const config: AppConfig = Container.getValue("config");
    return config.jobs.screenshotAndMail.workers;
  }

  /**
   * Handle processing of the job.
   * @param job Job
   */
  async handle(job: Job<Data>): Promise<{ msg?: string }> {
    const screenshotService = Container.get(ScreenshotService);

    try {
      const data = job.data;
      const imageUrl = await screenshotService.getOrScreenshot(data.url);
      logger.info(`Screenshot URL for [${data.url}] is [${imageUrl}]`);

      const result = await this.mailScreenshotResult(
        "success",
        data.email,
        data.url,
        imageUrl
      );

      logger.info(
        `Sending screenshot for [${data.url}] to [${data.email}] returned [${result}]`
      );

      return { msg: "Screenshot sent successfully." };
    } catch (err) {
      return this.handleError(job, err);
    }
  }

  /**
   * Send result of screenshot to user via mail.
   * @param type Mail Type
   * @param email To
   * @param url URL to screenshot
   * @param imageUrl Screenshot URL
   */
  mailScreenshotResult(
    messageType: "success" | "invalidUrl",
    to: string,
    url: string,
    imageUrl?: string
  ): Promise<boolean> {
    const mailService = Container.get(MailService);
    const payload =
      messageType === "invalidUrl"
        ? this.invalidUrlMessage(url)
        : this.successMessage(url, imageUrl);

    return mailService.send({ to, ...payload });
  }

  successMessage(url: string, imageUrl: string) {
    return {
      subject: "Screenshot Successfull",
      html: `
        You requested us to screenshot <a href="${url}">${url}</a>.
        <br><br>
        Here is the screenshot URL: <a href="${imageUrl}">${imageUrl}</a>
      `,
    };
  }

  invalidUrlMessage(url: string) {
    return {
      subject: "Screenshot Failed",
      html: `
        Failed to capture screenshot for <a href="${url}">${url}</a>.
        <br><br>
        Reason: URL is Invalid.
      `,
    };
  }

  /**
   * Handle error that occurs while processing job.
   * @param job Job
   * @param err Error that occurred.
   */
  async handleError(job: Job<Data>, err: any): Promise<{ msg: string }> {
    if (err instanceof InvalidUrlException) {
      logger.info(`Sending invalid url mail to [${job.data.email}]`);

      await this.mailScreenshotResult(
        "invalidUrl",
        job.data.email,
        job.data.url
      );

      return { msg: "Invalid URL Email sent" };
    }

    throw err;
  }
}

export default ScreenshotAndMailJob;
