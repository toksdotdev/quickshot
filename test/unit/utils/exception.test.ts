import { Exception } from "../../../src/utils/exception";

describe("Exception", () => {
  test("Should initialise custom exception class correctly", async (done) => {
    class SampleException extends Exception {
      name = "SAMPLE_EXCEPTION";
    }

    const exception = new SampleException("Very basic execption");
    expect(exception.name).toEqual("SAMPLE_EXCEPTION");
    expect(exception.stack).not.toEqual("");
    expect(exception.message).toEqual("Very basic execption");
    expect(exception instanceof Error);
    done();
  });
});
