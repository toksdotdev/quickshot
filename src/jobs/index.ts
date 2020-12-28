import QueueService from "../services/queue/queue.service";

type JobSpec = {
  name: string;
  path: string;
  concurrency?: number;
};
/**
 * Available jobs.
 */
export const JOBS: { [name: string]: JobSpec } = {
  SCREENSHOT_AND_MAIL: {
    name: "screenshot_and_mail",
    path: "screenshotAndMail",
    concurrency: 5
  },
};

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
  queueService: QueueService
) => {
  const job = resolveJob(basePath);

  for (const params of Object.values(JOBS)) {
    await queueService.register(params.name, job(params.path));
  }
};
