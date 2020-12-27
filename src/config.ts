import { AppConfig } from "config";

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
};

export default appConfig;
