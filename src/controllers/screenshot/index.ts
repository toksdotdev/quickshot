import express from "express";
import { Container } from "typescript-ioc";
import ScreenshotController from "./screenshot.controller";

const screenshot = express.Router();
const controller = Container.get(ScreenshotController);

screenshot.get("/screenshot", controller.screenshot.bind(controller));

export default screenshot;
