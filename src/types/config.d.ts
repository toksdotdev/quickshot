import { RedisOptions } from "ioredis";

export type AppConfig = {
  app: {
    env: string;
    port: number;
  };
  redis: {
    port?: number;
    host?: string;
    options?: RedisOptions;
  };
  cloudinary: {
    apiKey: string;
    apiSecret: string;
    cloudName: string;
  };
};
