import { Container } from "typescript-ioc";
import errorHandler from "errorhandler";
import dotenv from "dotenv";
dotenv.config();

// Configure IOC
import ioc from "./ioc";
import config from "./config";
Container.configure(...ioc(config));

// Imports
import app from "./app";
import { shutdownGracefully } from "./utils/process";

// Error handling
if (config.app.env === "development") {
  app.use(errorHandler());
}

// App Serve
app.listen(config.app.port, () =>
  console.log(
    `🚀 App started at [http://localhost:${config.app.port}] in [${config.app.env}] mode`
  )
);

// Cleanup
shutdownGracefully();
