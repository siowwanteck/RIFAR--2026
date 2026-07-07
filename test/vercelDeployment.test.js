import assert from "node:assert/strict";

const serverAppModule = await import("../src/app.js");
const clientAppModule = await import("../src/client.js");
const handlerModule = await import("../api/index.js");

assert.equal(typeof serverAppModule.default, "function");
assert.equal(typeof clientAppModule.bootstrapApp, "function");
assert.equal(typeof handlerModule.default, "function");

console.log("vercel deployment entrypoints are server-safe");
