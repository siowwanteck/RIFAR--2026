import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderRecommendationCards } from "../src/components/recommendations/recommendationCards.js";
import { buildRecommendations } from "../src/simulation/recommendationEngine.js";
import { createInitialState } from "../src/data/initialState.js";

const dashboardCss = readFileSync(new URL("../src/styles/dashboard.css", import.meta.url), "utf8");

test("forecast panel reserves enough room for summary values", () => {
  assert.match(dashboardCss, /grid-template-rows:\s*minmax\(320px,\s*auto\)/);
  assert.doesNotMatch(dashboardCss, /grid-template-rows:\s*284px/);
  assert.match(dashboardCss, /\.risk-line-chart\s*{[^}]*height:\s*144px/s);
  assert.match(dashboardCss, /\.forecast-summary\s*{[^}]*margin-top:\s*8px/s);
});

test("map panel stretches to remove unused space below the digital twin", () => {
  assert.match(dashboardCss, /\.operations-grid\s*{[^}]*align-items:\s*stretch/s);
  assert.match(dashboardCss, /\.map-panel\s*{[^}]*grid-template-rows:\s*auto auto minmax\(0,\s*1fr\)/s);
  assert.match(dashboardCss, /\.map-shell\s*{[^}]*height:\s*100%/s);
});

test("recommendations render as a compact queue with a view all action", () => {
  const html = renderRecommendationCards(buildRecommendations(createInitialState()));

  assert.match(html, /recommendation-footer/);
  assert.match(html, /View all actions/);
  assert.ok((html.match(/<article class="recommendation/g) ?? []).length <= 4);
});

test("flood overlay styling emphasizes readable water corridors", () => {
  assert.match(dashboardCss, /\.map-shell\s*{[^}]*background:\s*#06121c/s);
  assert.match(dashboardCss, /\.leaflet-overlay-pane svg path/s);
  assert.match(dashboardCss, /stroke-width:\s*2px/);
});
