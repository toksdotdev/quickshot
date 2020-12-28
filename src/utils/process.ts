import { Container } from "typescript-ioc";
import RedisQueueService from "../services/queue/redis-queue.service";
import ScreenshotService from "../services/screenshot/screenshot.service";

const handleExit = async (
  exit: boolean = true,
  err: number | NodeJS.Signals | Error | object
) => {
  await Container.get(ScreenshotService).shutdown();
  await Container.get(RedisQueueService).shutdown();
  
  console.log(`Terminating with exit code: ${err}`);
  if (exit) process.exit();
};

/**
 * Shutdown application
 */

export const shutdownGracefully = () => {
  process.on("exit", (err) => handleExit(true, err));
  // Catch Ctrl+C event
  process.on("SIGINT", (err) => handleExit(true, err));
  process.on("SIGUSR1", (err) => handleExit(true, err));
  process.on("SIGUSR2", (err) => handleExit(true, err));
  process.on("uncaughtException", (err) => handleExit(true, err));
  process.on("unhandledRejection", (err) => handleExit(true, err));
};
