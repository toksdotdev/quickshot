import { resolve } from "path";
import { JOBS, registerJobs } from "../../src/jobs";
import RedisQueueService from "../../src/services/queue/redis-queue.service";

describe("Job", () => {
  let queueService: RedisQueueService;
  let jobDirectory: string;

  beforeEach(() => {
    queueService = new RedisQueueService({ redis: { connectionString: "" } });

    // Mock jobs
    jobDirectory = resolve(__dirname, "../../src/jobs");

    for (const job of Object.values(JOBS)) {
      console.log(resolve(jobDirectory, job.path));
      jest.mock(resolve(jobDirectory, job.path), () => ({ default: () => {} }));
    }
  });

  afterEach(async (done) => {
    await queueService.shutdown();
    done();
  });

  test("Should register jobs into queue", async (done) => {
    queueService.register = jest.fn();
    await registerJobs(jobDirectory, queueService);
    expect(queueService.register).toHaveBeenCalled();

    for (const job of Object.values(JOBS)) {
      expect(queueService.getQueues().get(job.name)).not.toEqual(null);
    }

    done();
  });
});
