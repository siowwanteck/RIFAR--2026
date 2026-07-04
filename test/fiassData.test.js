import test from "node:test";
import assert from "node:assert/strict";

import {
  buildDashboardState,
  confirmAction,
  getActionStatus,
} from "../src/fiassData.js";

test("dashboard state exposes the MVP flood intelligence timeline", () => {
  const state = buildDashboardState();

  assert.equal(state.current.location, "Taman Sri Muda, Selangor");
  assert.equal(state.current.riskLevel, "HIGH");
  assert.deepEqual(
    state.forecast.timeline.map((point) => point.label),
    ["NOW", "+30m", "+1h", "+3h", "+6h", "+12h", "+24h", "+48h"],
  );
  assert.equal(state.forecast.peak.riskLevel, "CRITICAL");
  assert.equal(state.forecast.peak.hoursFromNow, 22);
});

test("recommendations stay human-in-the-loop and can be confirmed", () => {
  const state = buildDashboardState();
  const pumpAction = state.recommendations.find((item) => item.asset === "Pump Station PS2");

  assert.equal(pumpAction.title, "Activate Pump PS2");
  assert.equal(pumpAction.requiresConfirmation, true);
  assert.equal(getActionStatus(pumpAction.id), "pending");

  const confirmed = confirmAction(pumpAction.id);

  assert.equal(confirmed.status, "confirmed");
  assert.match(confirmed.message, /Operator confirmed/);
  assert.equal(getActionStatus(pumpAction.id), "confirmed");
});

test("digital twin scenarios update risk and affected areas by timeline", () => {
  const state = buildDashboardState();
  const now = state.digitalTwin.scenarios.find((scenario) => scenario.key === "NOW");
  const dayAhead = state.digitalTwin.scenarios.find((scenario) => scenario.key === "24H");

  assert.equal(now.riskLevel, "HIGH");
  assert.equal(dayAhead.riskLevel, "CRITICAL");
  assert.ok(dayAhead.floodOverlay.length > now.floodOverlay.length);
  assert.ok(dayAhead.affectedRoads.includes("Persiaran Sri Muda"));
});
