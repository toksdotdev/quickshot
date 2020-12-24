import { ContainerConfiguration } from "typescript-ioc";
import ScreenshotService from "../services/screenshot.service";
import ScreenshotController from "../controllers/screenshot/screenshot.controller";

const mapping: Array<ContainerConfiguration> = [
  {
    bind: ScreenshotController,
    factory: (ctx) => new ScreenshotController(ctx.resolve(ScreenshotService)),
  },
];

export default mapping;
