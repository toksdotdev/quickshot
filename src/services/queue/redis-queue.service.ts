/* eslint-disable @typescript-eslint/no-explicit-any */
import Redis from "ioredis";
import QueueService from ".";
import { AppConfig } from "config";
import Queue, { QueueOptions } from "bull";
import { InvalidJobPath, UnknownJob } from "./exceptions";

class RedisQueueService implements QueueService {
  private readonly queues: Map<string, Queue.Queue> = new Map();

  private readonly connection: QueueOptions;

  /**
   * Create an instance of Queue Service.
   */
  constructor(config: AppConfig) {
    const subscriber = new Redis(config.redis.connectionString);
    const client = new Redis(config.redis.connectionString);

    this.connection = {
      createClient: (type) => (type === "subscriber" ? subscriber : client),
    };
  }

  public getQueues() {
    return this.queues;
  }

  async register(jobPath: string) {
    let Job: any;

    try {
      jobPath = require.resolve(jobPath);
      Job = await import(jobPath);
      Job = Job.default || Job;
    } catch (err) {
      throw new InvalidJobPath(jobPath);
    }

    const jobInstance = new Job();
    const queue = new Queue(Job.key, this.connection);

    queue.process(Job.concurrency, async (job, done) => {
      try {
        done(null, await jobInstance.handle(job));
      } catch (err) {
        done(err);
      }
    });

    this.queues.set(Job.key, queue);
  }

  /**
   * Creates a new job and adds it to the queue.
   * If the queue is empty the job will be executed directly,
   * otherwise it will be placed in the queue and executed as soon as possible.
   *
   * TODO: Improve add to support taking in job options (will require creating
   * a generic options interface which will be used in the main QueueService
   * implementation).
   */
  async add(name: string, data?: object, opts?: Queue.JobOptions): Promise<object> {
    const queue = this.queues.get(name);

    if (!queue) throw new UnknownJob(name);

    return queue.add(data, opts);
  }

  /**
   * Shutdown entire queue service.
   */
  async shutdown() {
    const qs = Object.values(this.queues);
    await Promise.all(qs.map((queue: Queue.Queue) => queue.close()));
    this.queues.clear();
  }
}

export default RedisQueueService;
