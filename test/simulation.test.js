import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/data/initialState.js";
import { advanceSimulation } from "../src/simulation/floodModel.js";
import { generateForecast48h } from "../src/simulation/weatherScenario.js";
import { getDigitalTwinLayers } from "../src/services/mockApi.js";

test("heavy rain increases water level, tank capacity, risk, and affected area", () => {
  const state = createInitialState();
  state.weather.rainIntensity = 32;
  state.infrastructure.pumps.ps2.active = false;

  const next = advanceSimulation(state, 4);

  assert.ok(next.hydrology.waterLevelM > state.hydrology.waterLevelM);
  assert.ok(next.hydrology.tankCapacityPercent > state.hydrology.tankCapacityPercent);
  assert.ok(next.risk.score > state.risk.score);
  assert.ok(next.impact.affectedAreaHa > state.impact.affectedAreaHa);
});

test("confirmed pump activation reduces water pressure and records timeline entry", () => {
  const state = createInitialState();
  const confirmed = advanceSimulation(state, 2, { confirmedActionId: "act-ps2" });
  const later = advanceSimulation(confirmed, 8);

  assert.equal(confirmed.infrastructure.pumps.ps2.active, true);
  assert.ok(later.hydrology.waterLevelM < confirmed.hydrology.waterLevelM + 0.05);
  assert.equal(confirmed.recommendations.find((item) => item.id === "act-ps2").status, "confirmed");
  assert.match(confirmed.alerts[0].title, /Pump PS2/);
});

test("48-hour forecast responds to current risk and pump state", () => {
  const state = createInitialState();
  state.weather.rainIntensity = 36;
  const highForecast = generateForecast48h(state);

  state.infrastructure.pumps.ps2.active = true;
  state.hydrology.waterLevelM -= 0.35;
  const mitigatedForecast = generateForecast48h(state);

  assert.equal(highForecast.timeline.length, 8);
  assert.equal(highForecast.peak.riskLevel, "CRITICAL");
  assert.ok(mitigatedForecast.peak.score < highForecast.peak.score);
});

test("digital twin layers use real Taman Sri Muda coordinates and scale overlays by scenario", () => {
  const state = createInitialState();
  const now = getDigitalTwinLayers(state, "NOW");
  const dayAhead = getDigitalTwinLayers(state, "24H");

  assert.deepEqual(now.mapCenter, { lat: 3.0289, lng: 101.5417 });
  assert.ok(now.markers.some((marker) => marker.name === "Pump Station PS2"));
  assert.ok(now.markers.some((marker) => marker.name === "Rain Gauge RG1"));
  assert.ok(dayAhead.floodOverlays[0].radiusM > now.floodOverlays[0].radiusM);
});
