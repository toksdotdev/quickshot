import request from "supertest";
import { Express } from "express";
import { Container } from "typescript-ioc";
import { mockFn } from "../common/mocking";
import QueueService from "../../src/services/queue";
import { initializeIocAndApp } from "../common/ioc";
import { mockQueueService } from "../common/services";
import ScreenshotAndMailJob from "../../src/jobs/screenshot-and-mail.job";
import ScreenshotService from "../../src/services/screenshot/screenshot.service";
import ScreenshotController from "../../src/controllers/screenshot/screenshot.controller";

describe("Screenshot APIs", () => {
  let app: Express;
  let queueService: QueueService;

  const url = "http://x.com";
  const email = "toks@gmail.com";

  beforeAll(() => {
    queueService = mockQueueService();
    app = initializeIocAndApp([
      {
        bind: ScreenshotController,
        factory: () => new ScreenshotController(queueService),
      },
    ]);
  });

  afterAll(async (done) => {
    await Container.get(ScreenshotService).shutdown();
    done();
  });

  test("Should reject missing/invalid URL", async (done) => {
    const payloads = [{ url: "x.notexists" }, { url: null }, {}];

    for (const payload of payloads) {
      const response = await request(app)
        .post("/screenshot")
        .send(payload)
        .expect(400);
      expect(response.body.msg).toEqual("Invalid/Missing URI.");
    }

    done();
  });

  test("Should reject missing/invalid email", async (done) => {
    const payloads = [
      {
        url: "https://google.com",
        email: "sam",
      },
      {
        url: "https://google.com",
        email: "",
      },
      {
        url: "https://google.com",
        email: null,
      },
    ];

    for (const payload of payloads) {
      const response = await request(app)
        .post("/screenshot")
        .send(payload)
        .expect(400);
      expect(response.body.msg).toEqual("Invalid email specficied.");
    }

    done();
  });

  test("Should reject local file URI.", async (done) => {
    const response = await request(app)
      .post("/screenshot")
      .send({ url: "file:///users/valiu/documents/web/sample.html", email })
      .expect(400);

    expect(response.body.msg).toEqual("Invalid/Missing URI.");
    done();
  });

  test("Should schedule screenshot job in queue", async (done) => {
    const payload = { url, email };
    await request(app).post("/screenshot").send(payload).expect(200);
    expect(queueService.add).toBeCalledWith(ScreenshotAndMailJob.key, payload);
    done();
  });

  test("Should throw exception if job fails to schedule", async (done) => {
    mockFn(queueService.add).mockImplementation(() => {
      throw new Error("Failed to schedule job");
    });

    const response = await request(app)
      .post("/screenshot")
      .send({ url, email })
      .expect(500);

    expect(response.body.msg).toEqual("Internal server error.");
    done();
  });
});
