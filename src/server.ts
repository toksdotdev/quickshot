import { Container } from "typescript-ioc";
import errorHandler from "errorhandler";
import dotenv from "dotenv";
dotenv.config();

// Configure IOC
import config from "./config";
import { configure as configureIoc } from "./ioc";
configureIoc(config);

// Imports
import app from "./app";
import { registerJobs } from "./jobs";
import { shutdownGracefully } from "./utils/process";
import RedisQueueService from "./services/queue/redis-queue.service";
import { resolve } from "path";

// Error handling
if (config.app.env === "development") {
  app.use(errorHandler());
}

// Register Queue Job
registerJobs(resolve(__dirname, "jobs"), Container.get(RedisQueueService));

// App Serve
app.listen(config.app.port, () =>
  console.log(
    `🚀 App started at [http://localhost:${config.app.port}] in [${config.app.env}] mode`
  )
);

// Cleanup
shutdownGracefully();
