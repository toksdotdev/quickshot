import { AppConfig } from "config";

const appConfig: AppConfig = {
  app: {
    port: Number(process.env.PORT) || 3000,
    env: process.env.NODE_ENV,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT) || 6319,
  },
  cloudinary: {
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  },
};

export default appConfig;
