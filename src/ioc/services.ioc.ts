import MailService from "../services/mail.service";
import RedisService from "../services/cache/redis.service";
import StorageService from "../services/storage/cloudinary.service";
import RedisQueueService from "../services/queue/redis-queue.service";
import ScreenshotService from "../services/screenshot/screenshot.service";
import { Container, ContainerConfiguration, Scope } from "typescript-ioc";

const mapping: Array<ContainerConfiguration> = [
  {
    bind: RedisService,
    factory: () => new RedisService(Container.getValue("config")),
    scope: Scope.Singleton,
  },
  {
    bind: StorageService,
    factory: () => new StorageService(Container.getValue("config")),
    scope: Scope.Singleton,
  },
  {
    bind: ScreenshotService,
    factory: (ctx) =>
      new ScreenshotService(
        ctx.resolve(RedisService),
        ctx.resolve(StorageService)
      ),
    scope: Scope.Singleton,
  },
  {
    bind: RedisQueueService,
    factory: () => new RedisQueueService(Container.getValue("config")),
    scope: Scope.Singleton,
  },
  {
    bind: MailService,
    factory: () => new MailService(Container.getValue("config")),
    scope: Scope.Singleton,
  },
];

export default mapping;
