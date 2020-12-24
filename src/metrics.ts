import prometheus, { Counter } from "prom-client";
import { Express, Request, Response } from "express";

/**
 * Expose the prometheus API.
 * @param app Express App Instance
 */
export const exposeApi = (app: Express) => {
  app.get("/metrics", async (_: Request, res: Response) => {
    res.setHeader("Content-Type", prometheus.register.contentType);
    res.send(await prometheus.register.metrics());
  });
};

/**
 * URL Screenshot metrics.
 */
export const urlScreenshots = new Counter({
  name: "url_screenshots",
  labelNames: ["success", "failed", "cached"],
  help: "Performace of URL Screenshots",
});
