import { AppConfig } from "config";
import nodemailer from "nodemailer";
import logger from "../utils/logger";
import Mail from "nodemailer/lib/mailer/index";

class MailService {
  client: Mail;

  config: AppConfig;

  /**
   * Mail Service
   */
  constructor(config: AppConfig) {
    this.config = config;
    this.client = nodemailer.createTransport(config.mail[config.mail.default]);
  }

  async send(payload: {
    to: string;
    subject: string;
    text?: string;
    html?: string;
  }): Promise<boolean> {
    try {
      const response = await this.client.sendMail({
        from: this.config.mail.from,
        ...payload,
      });

      logger.info(
        `Successfully sent mail to ${payload.to} ${payload.subject} with response ${JSON.stringify(
          response
        )}`
      );

      return true;
    } catch (err) {
      logger.info(`Eror sending mail to: [${payload.to}] with error: `, err);
      return false;
    }
  }
}

export default MailService;
