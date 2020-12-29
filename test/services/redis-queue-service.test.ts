import { resolve } from "path";
import {
  UnknownJob,
  InvalidJobPath,
} from "../../src/services/queue/exceptions";
import RedisQueueService from "../../src/services/queue/redis-queue.service";

describe("Redis Queue Service", () => {
  let queueService: RedisQueueService;
  const jobDirectory = resolve(__dirname, "../data/jobs");

  beforeEach(() => {
    queueService = new RedisQueueService({ redis: { connectionString: "" } });
  });

  afterEach(async (done) => {
    await queueService.shutdown();
    done();
  });

  test("Should schedule job in queue", async (done) => {
    await queueService.register(`${jobDirectory}/dummy-job`);
    await queueService.add("dummy-job", { uri: "https://google.com" });
    expect(queueService.getQueues().get("dummy-job")).not.toEqual(null);
    done();
  });

  test("Should schedule job ending with .js in queue", async (done) => {
    await queueService.register(`${jobDirectory}/dummy-job-js`);
    await queueService.add("dummy-job-js", { uri: "https://google.com" });
    expect(queueService.getQueues().get("dummy-job")).not.toEqual(null);
    done();
  });

  test("Should handle exception for error prone job", async (done) => {
    await queueService.register(`${jobDirectory}/dummy-error-job`);
    const action = () =>
      queueService.add("dummy-error-job", { uri: "https://google.com" });

    await expect(action).rejects.toThrowError("Something went wrong");
    done();
  });

  test("Should not schedule invalid job", async (done) => {
    await expect(
      queueService.register(`${jobDirectory}/invalid.ts`)
    ).rejects.toThrow(InvalidJobPath);
    done();
  });

  test("Should not schedule job for invalid queue", async (done) => {
    await expect(
      queueService.add("dummy-job-1", { uri: "https://google.com" })
    ).rejects.toThrow(UnknownJob);

    done();
  });

  test("Should shutdown & destory all queues", async (done) => {
    await queueService.register(`${jobDirectory}/dummy-job`);
    await queueService.add("dummy-job", { uri: "https://google.com" });

    await queueService.register(`${jobDirectory}/dummy-job`);
    await queueService.add("dummy-job", { uri: "https://google.com" });
    await queueService.shutdown();

    expect(queueService.getQueues().size).toEqual(0);
    done();
  });
});
