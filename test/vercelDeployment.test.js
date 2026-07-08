import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const rootIndexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const publicIndexHtml = readFileSync(new URL("../public/index.html", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const vercelConfig = JSON.parse(readFileSync(new URL("../vercel.json", import.meta.url), "utf8"));
const appModule = await import("../src/app.js");

assert.match(rootIndexHtml, /<div id="app">/);
assert.match(rootIndexHtml, /<script type="module" src="\/src\/app\.js"><\/script>/);
assert.match(publicIndexHtml, /<script type="module" src="\/src\/app\.js"><\/script>/);
assert.equal(typeof appModule.initApp, "function");
assert.doesNotMatch(appSource, /from "\.\/server\.js"/);
assert.doesNotMatch(rootIndexHtml, /\/node_modules\//);
assert.equal(existsSync(new URL("../api/index.js", import.meta.url)), false);
assert.equal(existsSync(new URL("../src/server.js", import.meta.url)), false);
assert.deepEqual(vercelConfig, {
  buildCommand: "npm run build",
  outputDirectory: "public",
});
assert.equal(packageJson.scripts.build, "node scripts/build-static.js");
assert.equal(packageJson.scripts.dev, "npm run build && node scripts/dev-server.js");

console.log("vercel deployment is static and browser-safe");
