import { Exception } from "../../utils/exception";

export class InvalidJobPath extends Exception {
  public name = "INVALID_QUEUE_JOB_PATH";
  public code = 500;

  constructor(public jobPath?: string) {
    super(`Invalid Queue Job Path: ${jobPath}`);
  }
}

export class UnknownJob extends Exception {
  public name = "INVALID_QUEUE_JOB";
  public code = 500;

  constructor(public jobName?: string) {
    super(`Invalid Queue Job: ${jobName}`);
  }
}
