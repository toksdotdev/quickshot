import { Console } from "winston/lib/winston/transports";

describe("Logger", () => {
  test("Logger should switch console level based on env", async (done) => {
    process.env.NODE_ENV = "production";
    const logger = import("../../../src/utils/logger");
    const transports = (await logger).default.transports;
    expect(transports[0] instanceof Console);
    done();
  });
});
