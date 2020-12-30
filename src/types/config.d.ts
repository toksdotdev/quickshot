type MailDriver = "smtp";

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
  mail?: {
    from: string;
    default: MailDriver;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
  };
};
