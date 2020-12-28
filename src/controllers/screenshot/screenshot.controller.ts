import { JOBS } from "../../jobs";
import logger from "../../utils/logger";
import { Request, Response } from "express";
import QueueService from "../../services/queue/queue.service";
import { isEmailValid, isUriValid } from "../../utils/validator";

class ScreenshotController {
  constructor(private queueService: QueueService) {}

  /**
   * Screenshot URI specified.
   * @param req
   * @param res
   */
  public async screenshot(req: Request, res: Response) {
    const url = req.body.url || req.query.url;
    const email = req.body.email || req.query.email;

    if (url == null || !isUriValid(url)) {
      return res.status(400).json({ msg: "Invalid/Missing URI." });
    }

    if (email == null || !isEmailValid(email)) {
      return res.status(400).json({ msg: "Invalid email specficied." });
    }

    try {
      this.queueService.add(JOBS.SCREENSHOT_AND_MAIL.name, { url, email });
      logger.info(`${JOBS.SCREENSHOT_AND_MAIL.name} for [${url}] has been scheduled`);

      return res.json({
        msg: "We're cooking magic 🧙‍♀️. You'll get the link via mail shortly 😇.",
      });
    } catch (err) {
      logger.error("Error occured while scheduling screenshot: ", err);
      return res.status(500).json({ msg: "Internal server error." });
    }
  }
}

export default ScreenshotController;
