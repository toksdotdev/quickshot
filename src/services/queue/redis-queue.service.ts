import Redis from "ioredis";
import { AppConfig } from "config";
import Queue, { QueueOptions } from "bull";
import { InvalidJobPath, UnknownJob } from "./exceptions";

class RedisQueueService implements RedisQueueService {
  private readonly queues: Map<string, Queue.Queue> = new Map();

  private readonly connection: QueueOptions;

  /**
   * Create an instance of Queue Service.
   */
  constructor(config: AppConfig) {
    const subscriber = new Redis(config.redis.connectionString);
    const publisher = new Redis(config.redis.connectionString);

    this.connection = {
      createClient: (type) => (type === "subscriber" ? subscriber : publisher),
    };
  }

  public getQueues() {
    return this.queues;
  }

  async register(name: string, jobPath: string, concurrency: number = 3) {
    try {
      jobPath = require.resolve(jobPath);
    } catch (err) {
      throw new InvalidJobPath(jobPath);
    }

    const queue = new Queue(name, this.connection);
    queue.process(concurrency, jobPath); // Process without waiting
    this.queues.set(name, queue);
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
  async add(name: string, data?: object): Promise<object> {
    const queue = this.queues.get(name);

    if (!queue) throw new UnknownJob(name);

    return queue.add(data);
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
