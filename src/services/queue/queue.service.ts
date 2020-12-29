interface QueueService {
  /**
   * Register a job to the queue.
   * @param name jobName
   * @param jobPath File path of job to execute
   * @param concurrency How many parralel workers should be used to handle job.
   */
  register(jobPath: string): Promise<void>;

  /**
   * Creates a new job and adds it to the queue.
   * If the queue is empty the job will be executed directly,
   * otherwise it will be placed in the queue and executed as soon as possible.
   */
  add(name: string, data?: object, opts?: object): Promise<object>;

  /**
   * Shutdown the queue service.
   */
  shutdown?(): void;
}

export default QueueService;
