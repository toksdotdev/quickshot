import * as fs from "fs";
import * as path from "path";
import loadtest from "loadtest";

const domains = fs
  .readFileSync(path.resolve(__dirname, "data", "domains.txt"))
  .toString()
  .split("\n");

console.log("Starting load testing now");

const options: loadtest.LoadTestOptions = {
  method: "GET",
  url: "http://localhost:3000/screenshot",
  maxSeconds: 120,
  concurrency: 1000,
  maxRequests: 10000,
  requestsPerSecond: 1000,
  requestGenerator: (params, options, client, callback) => {
    const param = `?uri=https://${
      domains[Math.trunc(Math.random() * domains.length)]
    }`;
    options.href = `${options.href}${param}`;
    options.pathname = `${options.pathname}${param}`;
    options.path = `${options.path}${param}`;
    return client(options, callback);
  },
};

loadtest.loadTest(options, function (error: any) {
  if (error) {
    return console.error("Got an error: %s", error);
  }
  console.log("Tests run successfully");
});
