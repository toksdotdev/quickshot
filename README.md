# Quickshot

[![Build Status](https://travis-ci.com/TNkemdilim/quickshot.svg?token=iPj2zpjbHethzECCzCa7&branch=main)](https://travis-ci.com/TNkemdilim/quickshot)
[![Coverage Status](https://coveralls.io/repos/github/TNkemdilim/quickshot/badge.svg?t=XZJcUa)](https://coveralls.io/github/TNkemdilim/quickshot)

A dead-simple service that screenshots webpages, and sends the links to your email.

> Build using [Express](https://expressjs.com), [Bull](https://optimalbits.github.io/bull) and [NodeMailer](https://nodemailer.com).

## Design Goals

- **Security:** All webpages are opened both in _sandboxed chromium_ and _icognito mode_.
- **Scalability:** Easily handles ~2086 reqs/s on a single node. For load performance, see [load-testing](#load-testing).
- **Resilience:** Chromium instance automatically restarts on sudden crash without interrupting the job queue. Jobs that get affected are auto-retried.
- **Reduced memory footprints:** Puppeteer is used under the hood to capture screeshots. To reduce memory footprint, **only one** Chromium instance exists throughout the service lifetime irrespective of the number of screenshot workers that are running.
- **Portability:** Docker build (with `docker-compose`) supported and can easily be scaled in any containerized environment.
- **Monitoring:** Screenshot performance metric is currently scrapped with Prometheus. See [metrics](#get-metric-prometheus).

## Setup

### Prerequisite

You'll need to ensure you have the following installed:

- [NodeJS >= 10.0.0](https://nodejs.org)
- [Docker Compose](https://docs.docker.com/compose/)

### Environment Variables

- Clone the repo
- Create a `.env` from [`.env.example`](./.env.example)
- Get your [Cloudinary](https://cloudinary.com) API keys, and update env variables with prefix `CLOUDINARY_` respectively.
- Get a sample SMTP credentials at [Ethereal](https://ethereal.email), and update env variables with prefix `MAIL_SMTP_` respectively.
- Set `MAIL_DEFAULT` to `smtp`.
- Set `REDIS_URL` to `redis` (only if you'll be running the app via `docker-compose` for simplicity sake).

### Starting Up

#### Production

Ensure you have `docker-compose` installed on your machine.

To serve the application on the default port `3000`, simply run:

```bash
docker-compose  up --build
```

This should serve application on the following URL: `https://localhost:3000`

#### Development

To run a development server:
- Run `npm i` (if you have chrome installed, run `npm i --no-optional`).
- Update your environment variables.
- Run `npm run start:concurrenct` (watches and restarts the server with nodemon) 

> Don't forget to update your `REDIS_URL` to your local instance.

## API

### Take Screenshot

Captures screenshot of a webpage and sends to your mail

**POST /screenshot**

**Body**

```json
{
  "url": "https://google.com",
  "email": "betsy81@ethereal.email"
}
```

### Get Metric (Prometheus)

Get scraped prometheus metrics. Currently supported metrics incudes:

- `url_screenshots`: Captures status of URL screenshots (`success`, `failure`, `invalid`).

**GET /metrics**

# Architecture

This service heavily relies on dependency injection, and all IOC declarations can be found [here](./src/ioc). To register:

- **Services:** see [`services.ioc.ts`](./src/ioc/services.ioc.ts)
- **Controllers:** see [`controller.ioc.ts`](./src/ioc/controller.ioc.ts)

## Screenshot Workers

How fast screenshots will be attended to, is heavily dependent on the no. of concurrent workers processing the screenshot jobs.

Currently, the screenshot queue runs by default with `5 workers`. If you'll need to increase it, update the env flag `QUEUE_WORKER_SCREENSHOT_AND_MAIL` to your desired no. of workers.

> NOTE: No. of workers equals the **maximum** no. of chromium tabs that can be opened at any point in time, t.

# Tests

All tests are ran using Jest.

- Coverage report can be found on [Coverall](https://coveralls.io/github/TNkemdilim/quickshot).

- Track build test status on [Travis](https://travis-ci.com/github/TNkemdilim/quickshot).

## Load Testing

Load tests are currently carried out with [k6](https://k6.io/). To run a basic HTTP load test:

- Ensure you have [k6](https://k6.io/) installed.
- On terminal 1: Run the application (see [starting up](#starting-up)).
- On terminal 2: Run `npm run load-test`.

The default load test uses the folllowing parameters:

- **Virtual users:** 1000
- **Test iterations:** 10000 (10000 request shared amongst 1000 users)

> NOTE: In the future, there'll also exist plan to load test the overall queue performance.

### Configuring Parameters

To configure load testing paramaters, see [supported CLI parameters for k6](https://k6.io/docs/getting-started/running-k6), and run as follows:

```bash
k6 run --vu 1000 <add more parameters here> ./test/load-testing/index.ts
```

### Specification

Here are the machine specs for the sample load testing shown below:

- MacBook Pro (13-inch, 2019, Four Thunderbolt 3 ports)
- 2.8 GHz Intel Core i7
- 16 GB 2133 MHz LPDDR3

## Contributing

If you see any way to improve this service, please kindly open a PR.
