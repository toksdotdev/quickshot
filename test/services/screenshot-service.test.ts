import { CacheService } from "../../src/services/cache/cache.service";
import { StorageService } from "../../src/services/storage/storage.service";
import { InvalidUrlException } from "../../src/services/screenshot/exceptions";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";

describe("Screenshot Service", () => {
  let cacheService: CacheService;
  let storageService: StorageService;
  let screenshotService: ScreenshotService;

  const cachedUrl = "http://x.com";
  const cachedUrlKey = "valiu.screenshot-service.v1.x.com";
  const cachedUrlImageUrl = "https://cloudinary.com/d/x.com.png";

  const uncachedUrl = "http://captive.apple.com";
  const uncachedUrlKey = "valiu.screenshot-service.v1.captive.apple.com";
  const storedImageUrl = "https://cloudinary.com/d/uploaded-image.png";

  beforeEach(() => {
    cacheService = {
      set: jest.fn(),
      get: jest
        .fn()
        .mockImplementation((key: string) =>
          key === cachedUrlKey ? cachedUrlImageUrl : null
        ),
    };

    storageService = {
      upload: jest.fn().mockReturnValue({
        url: storedImageUrl,
      }),
    };

    screenshotService = new ScreenshotService(cacheService, storageService);
  });

  afterEach(async (done) => {
    await screenshotService.shutdown();
    done();
  });

  test("Should initialize and destroy the browser instance in hazardous manner", async (done) => {
    await screenshotService.setup();
    expect(screenshotService.getBrowser()).not.toEqual(null);

    await screenshotService.shutdown();
    expect(screenshotService.getBrowser()).toBeNull();
    await screenshotService.shutdown();
    expect(screenshotService.getBrowser()).toBeNull();

    await screenshotService.setup();
    expect(screenshotService.getBrowser()).not.toEqual(null);
    await screenshotService.setup();
    expect(screenshotService.getBrowser()).not.toEqual(null);
    done();
  });

  test("Should initializes browser instance automatically when about to screenshot.", async (done) => {
    const image = await screenshotService.screenshot(cachedUrl);
    expect(image).not.toEqual(null);
    expect(image.length > 0).toBe(true);
    expect(screenshotService.getBrowser()).not.toEqual(null);
    done();
  }, 10000);

  test("Should fetch screenshot URL from cache.", async (done) => {
    const url = await screenshotService.getOrScreenshot(cachedUrl);
    expect(url).toEqual(cachedUrlImageUrl);
    expect(cacheService.get).toHaveBeenCalledTimes(1);
    expect(cacheService.get).toHaveBeenCalledWith(cachedUrlKey);
    expect(cacheService.get).toReturnWith(cachedUrlImageUrl);
    done();
  });

  test("Should upload screenshot to storage and cache when URL doesn't exist initially in cache.", async (done) => {
    const url = await screenshotService.getOrScreenshot(uncachedUrl);
    expect(url).toEqual(storedImageUrl);
    expect(storageService.upload).toHaveBeenCalledTimes(1);
    expect(storageService.upload).toReturnWith({ url: storedImageUrl });

    expect(cacheService.set).toHaveBeenCalledTimes(1);
    expect(cacheService.set).toHaveBeenCalledWith(
      uncachedUrlKey,
      storedImageUrl
    );
    done();
  }, 10000);

  test("Should throw InvalidUrlException for URLs that don't return 2XX response.", async (done) => {
    const invalidUrls = [
      "http://google.com.ng/lofin",
      "https://thislinkdoesntwork.people",
    ];

    for (const url of invalidUrls) {
      const request = () => screenshotService.getOrScreenshot(url);
      expect(request).rejects.toThrowError(InvalidUrlException).finally(done);
    }
  }, 10000);

  test("Should throw exception when browser closes abruptly.", async (done) => {
    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const action = () =>
      Promise.all([
        screenshotService.screenshot(uncachedUrl),

        // Sleep to simulate abrupt termination of browser
        sleep(100).then(
          async () => await screenshotService.getBrowser().close()
        ),
      ]);

    await screenshotService.setup();
    const expected = "Protocol error (Target.setAutoAttach): Target closed.";
    expect(action).rejects.toThrowError(expected).finally(done);
  }, 10000);

  test("Should have have consistence cache key.", async (done) => {
    expect(ScreenshotService.cacheScreenshotPrefix).toEqual(
      "valiu.screenshot-service.v1"
    );
    done();
  });
});
