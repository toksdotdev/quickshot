import { ContainerConfiguration } from "typescript-ioc";
import RedisQueueService from "../services/queue/redis-queue.service";
import ScreenshotController from "../controllers/screenshot/screenshot.controller";

const mapping: Array<ContainerConfiguration> = [
  {
    bind: ScreenshotController,
    factory: (ctx) => new ScreenshotController(ctx.resolve(RedisQueueService)),
  },
];

export default mapping;
