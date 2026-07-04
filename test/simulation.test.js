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
  assert.ok(dayAhead.floodOverlays[0].intensity > now.floodOverlays[0].intensity);
});

test("digital twin overlays are irregular flood polygons, not circles", () => {
  const state = createInitialState();
  const layers = getDigitalTwinLayers(state, "12H");

  assert.ok(layers.floodOverlays.length >= 4);
  assert.ok(layers.floodOverlays.every((overlay) => overlay.geometry.type === "Polygon"));
  assert.ok(layers.floodOverlays.every((overlay) => overlay.geometry.coordinates[0].length >= 6));
  assert.ok(layers.floodOverlays.every((overlay) => !("radiusM" in overlay)));
});

test("forecast exposes compact chart stops for the command dashboard line chart", () => {
  const forecast = generateForecast48h(createInitialState());

  assert.deepEqual(
    forecast.chartTimeline.map((point) => point.label),
    ["NOW", "+3h", "+6h", "+12h", "+24h", "+48h"],
  );
});

test("system status is data-platform focused and does not expose API endpoint rows", async () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");
  const { getSystemStatus } = await import("../src/services/mockApi.js");
  const status = getSystemStatus();
  const names = status.sources.map((source) => source.name);

  assert.ok(layers.mapEngines.includes("leaflet-2d"));
  assert.ok(layers.mapEngines.includes("maplibre-3d"));
  assert.ok(names.includes("IoT Sensor Feed"));
  assert.ok(names.includes("Simulation Engine"));
  assert.ok(names.includes("Prediction Model"));
  assert.ok(!names.some((name) => name.startsWith("GET ")));
});
