import ioredisMock from "ioredis-mock";

jest.mock("ioredis", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Redis = require("ioredis-mock");
  if (typeof Redis === "object") {
    return {
      Command: { _transformer: { argument: {}, reply: {} } },
    };
  }
  
  return Redis;
});

module.exports = ioredisMock;
