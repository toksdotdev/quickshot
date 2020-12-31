import { AppConfig, MailDriver } from "config";

const appConfig: AppConfig = {
  app: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV || "production",
  },
  redis: {
    connectionString: process.env.REDIS_URL,
  },
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
  mail: {
    default: process.env.MAIL_DEFAULT as MailDriver,
    from: process.env.MAIL_FROM,
    smtp: {
      host: process.env.MAIL_SMTP_HOST,
      secure: JSON.parse(process.env.MAIL_SMTP_SECURE),
      port: Number(process.env.MAIL_SMTP_PORT),
      auth: {
        user: process.env.MAIL_SMTP_AUTH_USER,
        pass: process.env.MAIL_SMTP_AUTH_PASS,
      },
    },
  },
  jobs: {
    screenshotAndMail: {
      workers: Number(process.env.QUEUE_WORKER_SCREENSHOT_AND_MAIL) || 5,
    },
  },
};

export default appConfig;
