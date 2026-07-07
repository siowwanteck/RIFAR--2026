import assert from "node:assert/strict";

const appModule = await import("../src/app.js");
const handlerModule = await import("../api/index.js");

assert.equal(typeof appModule.bootstrapApp, "function");
assert.equal(typeof handlerModule.default, "function");

console.log("vercel deployment entrypoints are server-safe");
