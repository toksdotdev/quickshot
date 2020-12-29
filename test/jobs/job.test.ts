import { resolve } from "path";
import jobs from "../../src/jobs";
import { registerJobs } from "../../src/utils/jobs";
import RedisQueueService from "../../src/services/queue/redis-queue.service";

describe("Job", () => {
  let queueService: RedisQueueService;
  let jobDirectory: string;

  beforeEach(() => {
    queueService = new RedisQueueService({ redis: { connectionString: "" } });

    // Mock jobs
    jobDirectory = resolve(__dirname, "../../src/jobs");
    for (const job of Object.values(jobs)) {
      jest.mock(resolve(jobDirectory, job), () => ({ default: () => {} }));
    }
  });

  afterEach(async (done) => {
    await queueService.shutdown();
    done();
  });

  test("Should register jobs into queue", async (done) => {
    queueService.register = jest.fn();
    await registerJobs(jobDirectory, jobs, queueService);
    expect(queueService.register).toHaveBeenCalled();

    for (const job of Object.values(jobs)) {
      expect(queueService.getQueues().get(job)).not.toEqual(null);
    }

    done();
  });
});
