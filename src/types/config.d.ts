export type AppConfig = {
  app?: {
    env: string;
    port: number;
  };
  redis?: {
    connectionString: string;
  };
  cloudinary?: {
    apiKey: string;
    apiSecret: string;
    cloudName: string;
  };
};
