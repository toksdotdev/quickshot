class DummyJob {
  static get key() {
    return "dummy-job-js";
  }

  static get concurrency() {
    return 1;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async handle(job) {
    return {};
  }
}

module.exports = DummyJob;
