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
