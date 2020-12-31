/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from "fs";
import * as path from "path";
import loadtest from "loadtest";

/**
 * Configuration
 */
const URL = "http://localhost:3000";
const CONCURRENCY = 1000;
const REQUESTS_PER_SECOND = 1000;

console.log("Starting load testing now");

const domains = fs
  .readFileSync(path.resolve(__dirname, "data", "domains.txt"))
  .toString()
  .split("\n");

function reportLoadTestResult(error: any, result: any, latency: any) {
  console.log(
    "Current latency %j, result %j, error %j",
    latency,
    result,
    error
  );
  console.log("----");
  console.log("Request elapsed milliseconds: ", result.requestElapsed);
  console.log("Request index: ", result.requestIndex);
  console.log("Request loadtest() instance index: ", result.instanceIndex);
}

const options: loadtest.LoadTestOptions = {
  method: "POST",
  url: `${URL}/screenshot`,
  contentType: "application/json",
  body: {},
  concurrency: CONCURRENCY,
  requestsPerSecond: REQUESTS_PER_SECOND,
  statusCallback: reportLoadTestResult,
  requestGenerator: (params, options, client, callback) => {
    const url = `https://${
      domains[Math.trunc(Math.random() * domains.length)]
    }`;
    const email = "toks@toks.com";
    options.headers["Content-Type"] = "application/json";
    options.body = { email, url };
    const s = JSON.stringify(options.body);
    options.headers["Content-Length"] = s.length;
    const a = client(options, callback);
    a.write(s);
    return a;
  },
};

loadtest.loadTest(options, function (error: any) {
  if (error) return console.error("Got an error: %s", error);
  console.log("Tests run successfully");
});
