import logger from "../../utils/logger";
import { Request, Response } from "express";
import { isUriValid } from "../../utils/validator";
import ScreenshotService from "../../services/screenshot.service";

class ScreenshotController {
  constructor(private screenshotService: ScreenshotService) {}

  /**
   * Screenshot URI specified.
   * @param req
   * @param res
   */
  public async screenshot(req: Request, res: Response) {
    const uri = req.body.uri || req.query.uri;

    if (!uri || !isUriValid(uri)) {
      return res.status(400).json({ msg: "Invalid/Missing URI." });
    }

    try {
      const imageUrl = await this.screenshotService.getOrScreenshot(uri);
      logger.info(`Screenshot for [${uri}] is [${imageUrl}]`);

      return res
        .json({ url: imageUrl, msg: "Screenshot successful." })
        .status(201);
    } catch (err) {
      logger.error(`Screenshot for ${uri} failed with error: `, err);

      return res
        .json({ msg: "Error occured while uploading file." })
        .status(500);
    }
  }
}

export default ScreenshotController;
