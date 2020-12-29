import { Job } from "bull";
import { Container } from "typescript-ioc";
import { CacheService } from "../../src/services/cache/cache.service";
import ScreenshotAndMailJob from "../../src/jobs/screenshot-and-mail.job";
import { StorageService } from "../../src/services/storage/storage.service";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";
import {
  mockCacheService,
  mockScreenshotService,
  mockStorageService,
} from "../common/services";
import { mockFn } from "../common/mocking";
import { initializeIocAndApp } from "../common/ioc";
import { InvalidUrlException } from "../../src/services/screenshot/exceptions";

describe("Job: Screenshot and Mail", () => {
  const url = "http://x.com";
  const email = "toks@gmail.com";
  let cacheService: CacheService;
  let storageService: StorageService;
  let screenshotService: ScreenshotService;
  const cachedUrlKey = "valiu.screenshot-service.v1.x.com";
  const cachedUrlImageUrl = "https://cloudinary.com/d/x.com.png";
  const storedImageUrl = "https://cloudinary.com/d/uploaded-image.png";

  beforeEach(() => {
    cacheService = mockCacheService({
      getImpl: (key: string) =>
        key === cachedUrlKey ? cachedUrlImageUrl : null,
    });

    storageService = mockStorageService({
      uploadResponse: { url: storedImageUrl },
    });

    screenshotService = mockScreenshotService({ cacheService, storageService });

    initializeIocAndApp([
      {
        bind: ScreenshotService,
        factory: () => screenshotService,
      },
    ]);
  });

  afterAll(async (done) => {
    await Container.get(ScreenshotService).shutdown();
    done();
  });

  test("Should check job concurrency is greater than 0", async (done) => {
    expect(ScreenshotAndMailJob.concurrency >= 0).toEqual(true);
    done();
  });

  test("Should trigger job", async (done) => {
    const job = new ScreenshotAndMailJob();
    screenshotService.getOrScreenshot = jest.fn();

    await job.handle({ data: { email, url } } as Job<{
      email: string;
      url: string;
    }>);

    expect(screenshotService.getOrScreenshot).toHaveBeenCalled();
    done();
  });

  test("Should send mail when URL is InvalidUrlException", async (done) => {
    const invalidUrls = [
      "http://google.com.ng/lofin",
      "https://thislinkdoesntwork.people",
    ];

    for (const invalidUrl of invalidUrls) {
      const job = new ScreenshotAndMailJob();

      const response = await job.handle({
        data: { email, url: invalidUrl },
      } as Job<{ email: string; url: string }>);

      expect(response).toEqual({
        msg: "Invalid URL Email sent",
      });
    }

    done();
  });
});
