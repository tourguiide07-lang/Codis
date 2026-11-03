import test, { before, after } from "node:test";
import assert from "node:assert/strict";
import { app } from "./server.js";

let server;
let baseUrl;

before(async () => {
  process.env.GROQ_API_KEY = "";
  await new Promise(resolve => {
    server = app.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
  });
});

test("health endpoint reports service status without exposing secrets", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.ok, true);
  assert.equal(data.providerConfigured, false);
  assert.equal(typeof data.model, "string");
  assert.equal("apiKey" in data, false);
});

test("capabilities endpoint lists supported built-in tools", async () => {
  const response = await fetch(`${baseUrl}/api/capabilities`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.name, "CODIS");
  assert.equal(data.webSearch, true);
  assert.equal(data.codeExecution, true);
  assert.equal(data.persistentServerMemory, false);
  assert.equal(data.autonomousActions, false);
});

test("chat endpoint gives a clear setup response when no provider key exists", async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Hello CODIS" })
  });
  const data = await response.json();
  assert.equal(response.status, 503);
  assert.match(data.error, /GROQ_API_KEY/);
});

test("security headers are present on API responses", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
  assert.equal(response.headers.get("x-frame-options"), "DENY");
  assert.match(response.headers.get("strict-transport-security") || "", /max-age=31536000/);
  assert.match(response.headers.get("content-security-policy") || "", /default-src 'none'/);
  assert.equal(response.headers.get("cache-control"), "no-store");
});

test("chat endpoint rejects an empty message", async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "   " })
  });
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.match(data.error, /Message is required/);
});

test("chat endpoint rejects oversized messages", async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "x".repeat(8001) })
  });
  const data = await response.json();
  assert.equal(response.status, 413);
  assert.match(data.error, /too long/i);
});
test("CORS allows the Android WebView null origin", async () => {
  const response = await fetch(`${baseUrl}/health`, { headers: { Origin: "null" } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), "null");
});

test("CORS does not reflect an untrusted website origin", async () => {
  const response = await fetch(`${baseUrl}/health`, { headers: { Origin: "https://untrusted.example" } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("malformed JSON receives a clean JSON error", async () => {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{ invalid json"
  });
  const data = await response.json();
  assert.equal(response.status, 400);
  assert.match(data.error, /valid JSON/i);
});


test("chat endpoint enforces its per-client request limit with a JSON error", async () => {
  const responses = [];
  for (let request = 0; request < 13; request += 1) {
    responses.push(await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Forwarded-For": "203.0.113.42"
      },
      body: JSON.stringify({ message: "rate-limit test" })
    }));
  }
  assert.ok(responses.slice(0, 12).every(response => response.status === 503));
  const lastResponse = responses[12];
  const data = await lastResponse.json();
  assert.equal(lastResponse.status, 429);
  assert.match(lastResponse.headers.get("content-type") || "", /application\/json/i);
  assert.match(data.error, /Too many requests/i);
});
