import * as fs from "fs";
import * as path from "path";
import loadtest from "loadtest";

const domains = fs
  .readFileSync(path.resolve(__dirname, "data", "domains.txt"))
  .toString()
  .split("\n");

console.log("Starting load testing now");

const options: loadtest.LoadTestOptions = {
  method: "POST",
  url: "http://localhost:3000/screenshot",
  contentType: "application/json",
  body: {},
  concurrency: 1000,
  requestsPerSecond: 1000,
  requestGenerator: (params, options, client, callback) => {
    const url = `https://${
      domains[Math.trunc(Math.random() * domains.length)]
    }`;
    const email = "toks@toks.com";

    options.headers["Content-Type"] = "application/json";

    // options.href = `${options.href}${param}`;
    // options.pathname = `${options.pathname}${param}`;
    // options.path = `${options.path}${param}`;
    options.body = { email, url };
    const s = JSON.stringify(options.body);
    options.headers["Content-Length"] = s.length;
    console.log(options);
    const a = client(options, callback);
    a.write(s);
    return a;
  },
};

loadtest.loadTest(options, function (error: any) {
  if (error) {
    return console.error("Got an error: %s", error);
  }
  console.log("Tests run successfully");
});
