import { Express } from "express";
import request from "supertest";

import { Container, Scope, BuildContext } from "typescript-ioc";
import { CacheService } from "../../src/services/cache/cache.service";
import StorageService from "../../src/services/storage/cloudinary.service";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";
import ScreenshotController from "../../src/controllers/screenshot/screenshot.controller";

describe("Screenshot APIs", () => {
  let app: Express;
  let cacheService: CacheService;
  let storageService: StorageService;

  const cachedUrl = "http://x.com";
  const cachedUrlKey = "valiu.screenshot-service.v1.x.com";
  const notExistingUrl = "https://thislinkdoesntwork.people";
  const cachedUrlImageUrl = "https://cloudinary.com/images/x.com.png";
  const storedImageUrl = "https://cloudinary.com/images/storedimage.png";

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

    // Initialize IOC before loading app instance
    Container.configure(
      ...[
        {
          bind: ScreenshotService,
          factory: () => new ScreenshotService(cacheService, storageService),
          scope: Scope.Singleton,
        },
        {
          bind: ScreenshotController,
          factory: (ctx: BuildContext) =>
            new ScreenshotController(ctx.resolve(ScreenshotService)),
        },
      ]
    );

    app = require("../../src/app").default;
  });

  afterEach(async (done) => {
    await Container.get(ScreenshotService).shutdown();
    done();
  });

  test("Should reject missing/invalid URL", async (done) => {
    const urls = [
      "/screenshot?url=x.notexists",
      "/screenshot?url=",
      "/screenshot",
    ];

    for (const url of urls) {
      const response = await request(app).get(url).expect(400);
      expect(response.body.msg).toEqual("Invalid/Missing URI.");
    }

    done();
  });

  test("Should reject local file URI.", async (done) => {
    const localFileUri = "file:///users/valiu/documents/web/sample.html";
    const response = await request(app)
      .get(`/screenshot?uri=${localFileUri}`)
      .expect(400);

    expect(response.body.msg).toEqual("Invalid/Missing URI.");
    done();
  });

  test("Should capture screenshot (cached URL screenshot)", async (done) => {
    const response = await request(app)
      .get(`/screenshot?uri=${cachedUrl}`)
      .expect(200);

    expect(response.body.url).toEqual(cachedUrlImageUrl);
    done();
  });

  test("Should capture screenshot (uncached URL screenshot) ", async (done) => {
    const response = await request(app)
      .get(`/screenshot?uri=${notExistingUrl}`)
      .expect(400);

    expect(response.body.msg).toEqual(`Invalid URL: ${notExistingUrl}`);
    done();
  });
});
