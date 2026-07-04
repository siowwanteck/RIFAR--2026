import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const dashboardCss = readFileSync(new URL("../src/styles/dashboard.css", import.meta.url), "utf8");

test("forecast panel reserves enough room for summary values", () => {
  assert.match(dashboardCss, /grid-template-rows:\s*minmax\(320px,\s*auto\)/);
  assert.doesNotMatch(dashboardCss, /grid-template-rows:\s*284px/);
  assert.match(dashboardCss, /\.risk-line-chart\s*{[^}]*height:\s*144px/s);
  assert.match(dashboardCss, /\.forecast-summary\s*{[^}]*margin-top:\s*8px/s);
});
