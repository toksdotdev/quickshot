import QueueService from "../services/queue/queue.service";

/**
 * Alias for resolving job file path
 * @param name Job name
 */
const resolveJob = (base: string) => (name: string) => `${base}/${name}`;

/**
 * Register jobs into the queue service provided.
 * @param queueService Queue service instance
 */
export const registerJobs = async (
  basePath: string,
  jobsPath: string[],
  queueService: QueueService
) => {
  const job = resolveJob(basePath);

  for (const jobPath of Object.values(jobsPath)) {
    await queueService.register(job(jobPath));
  }
};
