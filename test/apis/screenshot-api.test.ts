import request from "supertest";
import { Express } from "express";
import { JOBS } from "../../src/jobs";
import { Container } from "typescript-ioc";
import QueueService from "../../src/services/queue/queue.service";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";
import ScreenshotController from "../../src/controllers/screenshot/screenshot.controller";

describe("Screenshot APIs", () => {
  let app: Express;
  let queueService: QueueService;

  const url = "http://x.com";
  const email = "toks@gmail.com";

  beforeAll(() => {
    queueService = {
      add: jest.fn(),
      register: jest.fn(),
    };

    // Initialize IOC before loading app instance
    Container.configure(
      ...[
        {
          bind: ScreenshotController,
          factory: () => new ScreenshotController(queueService),
        },
      ]
    );

    app = require("../../src/app").default;
  });

  afterAll(async (done) => {
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

  test("Should reject missing/invalid email", async (done) => {
    const urls = [
      "/screenshot?url=https://google.com&email=sam",
      "/screenshot?url=https://google.com&email=",
      "/screenshot?url=https://google.com&email",
    ];

    for (const url of urls) {
      const response = await request(app).get(url).expect(400);
      expect(response.body.msg).toEqual("Invalid email specficied.");
    }

    done();
  });

  test("Should reject local file URI.", async (done) => {
    const localFileUri = "file:///users/valiu/documents/web/sample.html";
    const response = await request(app)
      .get(`/screenshot?url=${localFileUri}&email=${email}`)
      .expect(400);

    expect(response.body.msg).toEqual("Invalid/Missing URI.");
    done();
  });

  test("Should schedule screenshot job in queue", async (done) => {
    await request(app).get(`/screenshot?url=${url}&email=${email}`).expect(200);

    expect(queueService.add).toBeCalledWith(JOBS.SCREENSHOT_AND_MAIL.name, {
      url,
      email,
    });

    done();
  });

  test("Should throw exception if job fails to schedule", async (done) => {
    (queueService.add as jest.MockedFunction<
      typeof queueService.add
    >).mockImplementation(() => {
      throw new Error("Failed to schedule job");
    });

    const response = await request(app)
      .get(`/screenshot?url=${url}&email=tochukwu@gmail.com`)
      .expect(500);

    expect(response.body.msg).toEqual("Internal server error.");
    done();
  });
});
