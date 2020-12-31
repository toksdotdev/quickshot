import http from "k6/http";

const domains = open("./data/domains.txt").toString().split("\n");

export default function () {
  const payload = JSON.stringify({
    email: "toks@toks.dev",
    url: `https://${domains[Math.trunc(Math.random() * domains.length)]}`,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  const res = http.post("http://localhost:3000/screenshot", payload, params);
  console.log(JSON.stringify(res.body));
}
