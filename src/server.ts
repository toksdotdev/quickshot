import dotenv from "dotenv";
dotenv.config();

// Configucre IOC
import ioc from "./ioc";
import config from "./config";
import { Container } from "typescript-ioc";
Container.configure(...ioc(config));

// App Setup
import app from "./app";
import errorHandler from "errorhandler";
import { shutdownGracefully } from "./utils/process";

// Error handling
if (config.app.env === "development") {
  app.use(errorHandler());
}

// Serve
app.listen(config.app.port, () =>
  console.log(
    `🚀 App started at [http://localhost:${config.app.port}] in [${config.app.env}] mode`
  )
);

// Cleanup
shutdownGracefully();
