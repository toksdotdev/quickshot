import { Job } from "bull";

type Data = {
  url: string;
  email: string;
};

class DummyJob {
  public static get key(): string {
    return "dummy-job";
  }

  public static get concurrency() {
    return 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(job: Job<Data>): Promise<object> {
    return {};
  }
}

export default DummyJob;
