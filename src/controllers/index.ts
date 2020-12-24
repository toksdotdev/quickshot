import { Express } from "express";
import screenshotRouter from "./screenshot";

/**
 * Configure API
 *
 * @param app Express instance
 */
export const configure = (app: Express) => {
  app.use(screenshotRouter);
};
