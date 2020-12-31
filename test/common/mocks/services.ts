/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppConfig } from "../../../src/types/config";
import { CacheService } from "../../../src/services/cache";
import { StorageService } from "../../../src/services/storage";
import ScreenshotService from "../../../src/services/screenshot/screenshot.service";
import MailService from "../../../src/services/mail.service";

export const mockQueueService = () => ({
  add: jest.fn(),
  register: jest.fn(),
});

export const mockCacheService = (opts: { setImpl?: any; getImpl?: any }) => ({
  set: jest.fn().mockImplementation(opts.setImpl),
  get: jest.fn().mockImplementation(opts.getImpl),
});

export const mockStorageService = ({ uploadResponse = null }) =>
  ({
    upload: jest.fn().mockReturnValue(uploadResponse),
  } as StorageService);

export const mockScreenshotService = ({
  cacheService = mockCacheService({}) as CacheService,
  storageService = mockStorageService({}) as StorageService,
}) =>
  new ScreenshotService(cacheService, storageService, {
    puppeteer: { launchInSandbox: false },
  });

export const mockMailService = (opts: { sendImpl?: any }) => {
  const config: AppConfig = {
    mail: {
      default: "smtp",
      from: "from@toks.com",
      smtp: {
        auth: { pass: "", user: "" },
        host: "",
        port: 587,
        secure: false,
      },
    },
  };

  const mailService = new MailService(config);
  if (opts.sendImpl) {
    mailService.send = jest.fn().mockImplementation(opts.sendImpl);
  }

  return mailService;
};
