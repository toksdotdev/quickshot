import app from "../../../src/app";
import request from "supertest";

describe("Prometheus Metrics", () => {
  test("Should expose prometheus metrics endpoint on /metrics", async (done) => {
    await request(app).get("/metrics").expect(200);
    done();
  });
});
