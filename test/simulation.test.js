import test from "node:test";
import assert from "node:assert/strict";

import { createInitialState } from "../src/data/initialState.js";
import { advanceSimulation } from "../src/simulation/floodModel.js";
import { buildRecommendations } from "../src/simulation/recommendationEngine.js";
import { generateForecast48h } from "../src/simulation/weatherScenario.js";
import {
  getDashboardState,
  confirmRecommendedAction,
  getDigitalTwinLayers,
  getRecommendedActions,
  resetSimulation,
  undoRecommendedAction,
} from "../src/services/mockApi.js";
import { mapLibre3dConfig } from "../src/data/mapConfig.js";

test("heavy rain increases water level, tank capacity, risk, and affected area", () => {
  const state = createInitialState();
  state.weather.rainIntensity = 32;
  state.infrastructure.pumps.outflow.active = false;

  const next = advanceSimulation(state, 4);

  assert.ok(next.hydrology.waterLevelM > state.hydrology.waterLevelM);
  assert.ok(next.hydrology.tankCapacityPercent > state.hydrology.tankCapacityPercent);
  assert.ok(next.risk.score > state.risk.score);
  assert.ok(next.impact.affectedAreaHa > state.impact.affectedAreaHa);
});

test("confirmed pump activation reduces water pressure and records timeline entry", () => {
  const state = createInitialState();
  const confirmed = advanceSimulation(state, 2, { confirmedActionId: "act-pump-outflow" });
  const later = advanceSimulation(confirmed, 8);

  assert.equal(confirmed.infrastructure.pumps.outflow.active, true);
  assert.ok(later.hydrology.waterLevelM < confirmed.hydrology.waterLevelM + 0.05);
  assert.equal(confirmed.recommendations.find((item) => item.id === "act-pump-outflow").status, "confirmed");
  assert.match(confirmed.alerts[0].title, /Outflow Pump Station/);
});

test("issuing a flood alert appears in recommendations and adds an alert timeline entry when confirmed", () => {
  const state = createInitialState();
  state.risk.score = 89;
  state.risk.level = "CRITICAL";
  state.hydrology.predictedDepthM = 1.18;
  state.weather.rainIntensity = 34;
  state.recommendations = buildRecommendations(state);

  const alertAction = state.recommendations.find((item) => item.id === "issue-flood-alert");
  const confirmed = advanceSimulation(state, 2, { confirmedActionId: "issue-flood-alert" });

  assert.ok(alertAction);
  assert.equal(alertAction.status, "pending");
  assert.equal(alertAction.requiresConfirmation, true);
  assert.equal(
    confirmed.recommendations.find((item) => item.id === "issue-flood-alert").status,
    "confirmed",
  );
  assert.ok(confirmed.alerts.some((alert) => /Flood alert/i.test(alert.title)));
  assert.ok(
    confirmed.alerts.some((alert) => /Jalan Teladan|Jalan Nyaman|field/i.test(alert.detail)),
  );
});

test("dashboard warmup advances simulation state only when explicitly requested", () => {
  resetSimulation();

  const initial = getDashboardState();
  const warmed = getDashboardState("NOW", { warmupSeconds: 3 });

  assert.equal(initial.generatedAt === warmed.generatedAt, false);
  assert.ok(warmed.current.rainfallMmPerHour !== initial.current.rainfallMmPerHour);
  assert.ok(warmed.current.averageWaterLevelM !== initial.current.averageWaterLevelM);
});

test("48-hour forecast responds to current risk and pump state", () => {
  const state = createInitialState();
  state.weather.rainIntensity = 36;
  const highForecast = generateForecast48h(state);

  state.infrastructure.pumps.outflow.active = true;
  state.hydrology.waterLevelM -= 0.35;
  const mitigatedForecast = generateForecast48h(state);

  assert.equal(highForecast.timeline.length, 8);
  assert.equal(highForecast.peak.riskLevel, "CRITICAL");
  assert.ok(mitigatedForecast.peak.score < highForecast.peak.score);
});

test("initial demo forecast starts below critical risk", () => {
  const forecast = generateForecast48h(createInitialState());

  assert.notEqual(forecast.peak.riskLevel, "CRITICAL");
  assert.ok(["MEDIUM", "HIGH"].includes(forecast.peak.riskLevel));
});

test("digital twin layers use real Taman Sri Muda coordinates and scale overlays by scenario", () => {
  const state = createInitialState();
  const now = getDigitalTwinLayers(state, "NOW");
  const dayAhead = getDigitalTwinLayers(state, "24H");

  assert.deepEqual(now.mapCenter, { lat: 3.032111111111111, lng: 101.52705555555555 });
  assert.ok(now.markers.some((marker) => marker.name === "Pump Station"));
  assert.ok(now.markers.some((marker) => marker.name === "IoT Sensor"));
  assert.ok(dayAhead.floodOverlays[0].intensity > now.floodOverlays[0].intensity);
});

test("digital twin assets move together to the requested target center", () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");
  const pondSensor = layers.markers.find((marker) => marker.id === "IoT sensor");
  const tankMarker = layers.markers.find((marker) => marker.id === "tank-4000");
  const pumpMarker = layers.markers.find((marker) => marker.id === "outflow-pump");
  const gateMarker = layers.markers.find((marker) => marker.id === "tidal-gate");
  const bioswaleMarker = layers.markers.find((marker) => marker.id === "bioswale-field");
  const tankZone = layers.floodOverlays.find((overlay) => overlay.id === "field-tank-zone");

  assert.deepEqual(layers.mapCenter, { lat: 3.032111111111111, lng: 101.52705555555555 });
  assert.deepEqual({ lat: pondSensor.lat, lng: pondSensor.lng }, { lat: 3.035728, lng: 101.528741 });
  assert.deepEqual({ lat: tankMarker.lat, lng: tankMarker.lng }, { lat: 3.03081, lng: 101.5275 });
  assert.deepEqual({ lat: pumpMarker.lat, lng: pumpMarker.lng }, { lat: 3.030253, lng: 101.527528 });
  assert.deepEqual({ lat: gateMarker.lat, lng: gateMarker.lng }, { lat: 3.029803, lng: 101.525822 });
  assert.deepEqual({ lat: bioswaleMarker.lat, lng: bioswaleMarker.lng }, { lat: 3.029857, lng: 101.527443 });
  assert.deepEqual({ lat: tankZone.lat, lng: tankZone.lng }, { lat: 3.03081, lng: 101.5275 });
});

test("flood overlays shrink and lighten after the visual tuning pass", () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");
  const jalanTeladan = layers.floodOverlays.find((overlay) => overlay.id === "jalan-teladan");
  const width = Math.max(...jalanTeladan.geometry.coordinates[0].map(([lng]) => lng))
    - Math.min(...jalanTeladan.geometry.coordinates[0].map(([lng]) => lng));

  assert.ok(width < 0.0035);
  assert.ok(jalanTeladan.opacity < 0.35);
});

test("digital twin focuses on the Jalan Teladan pilot assets even without hydraulic path overlays", () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");
  const markerNames = layers.markers.map((marker) => marker.name);
  const overlayNames = layers.floodOverlays.map((overlay) => overlay.name);

  assert.ok(markerNames.includes("Underground Attenuation Tank"));
  assert.ok(markerNames.includes("Pump Station"));
  assert.ok(markerNames.includes("Tidal Gate"));
  assert.ok(markerNames.includes("Bioswale / Green Drainage Strip"));
  assert.ok(overlayNames.includes("Jalan Teladan 25/22"));
  assert.ok(overlayNames.includes("Jalan Nyaman 25/20"));
  assert.ok(overlayNames.includes("Jalan Bakti 25/15"));
  assert.ok(overlayNames.includes("Existing attenuation tank zone"));
  assert.deepEqual(layers.corridors, []);
  assert.deepEqual(layers.flowPaths, []);
  assert.ok(!markerNames.some((name) => /Seksyen|PS2|PS3|TG2/.test(name)));
});

test("affected areas table uses pilot-site roads and drainage assets", async () => {
  const { getAffectedAreas } = await import("../src/services/mockApi.js");
  const areaNames = getAffectedAreas().map((area) => area.area);

  assert.deepEqual(areaNames, [
    "Jalan Teladan 25/22",
    "Jalan Nyaman 25/20",
    "Jalan Bakti 25/15",
    "Existing attenuation tank zone",
    "Tidal gate zone",
  ]);
});

test("pump release and tidal gate closure reduce tank pressure and backflow risk", () => {
  const state = createInitialState();
  state.weather.rainIntensity = 34;
  state.weather.riverLevelM = 2.1;
  state.weather.tideLevelM = 1.8;
  state.hydrology.tankCapacityPercent = 86;

  const before = advanceSimulation(state, 4);
  const pumpConfirmed = advanceSimulation(before, 2, { confirmedActionId: "act-pump-outflow" });
  const gateClosed = advanceSimulation(pumpConfirmed, 2, { confirmedActionId: "close-tidal-gate" });
  const later = advanceSimulation(gateClosed, 8);

  assert.equal(gateClosed.infrastructure.pumps.outflow.active, true);
  assert.equal(gateClosed.infrastructure.tidalGates.outlet.open, false);
  assert.ok(later.hydrology.tankCapacityPercent < before.hydrology.tankCapacityPercent);
  assert.ok(later.hydrology.tankPressurePercent < before.hydrology.tankPressurePercent);
  assert.ok(later.hydrology.predictedDepthM < before.hydrology.predictedDepthM);
  assert.ok(later.hydrology.backflowRiskPercent < before.hydrology.backflowRiskPercent);
  assert.ok(later.hydrology.waterLevelM < before.hydrology.waterLevelM + 0.1);
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

test("dashboard state models a single pump station without standby capacity", async () => {
  const { getDashboardState } = await import("../src/services/mockApi.js");
  const state = getDashboardState();
  const pumpActions = state.recommendations.filter((item) => item.asset === "Outflow Pump Station");

  assert.equal(state.current.pumpsTotal, 1);
  assert.equal(state.current.pumpsActive <= state.current.pumpsTotal, true);
  assert.equal(pumpActions.length, 1);
  assert.equal(
    state.recommendations.some((item) => item.id === "prep-standby-pump"),
    false,
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

test("3D digital twin uses an open vector city style and building extrusion config", () => {
  assert.equal(mapLibre3dConfig.styleUrl, "https://tiles.openfreemap.org/styles/liberty");
  assert.notEqual(mapLibre3dConfig.styleUrl, "https://demotiles.maplibre.org/style.json");
  assert.equal(mapLibre3dConfig.camera.pitch, 50);
  assert.equal(mapLibre3dConfig.camera.bearing, -15);
  assert.ok(mapLibre3dConfig.buildingLayers.length >= 1);
  assert.ok(mapLibre3dConfig.buildingLayers.every((layer) => layer.type === "fill-extrusion"));
});

test("undoing a confirmed action restores the prior recommendation state", () => {
  resetSimulation();
  const before = structuredClone(getRecommendedActions());

  confirmRecommendedAction("act-pump-outflow");
  const afterConfirm = getRecommendedActions();

  assert.equal(afterConfirm.find((item) => item.id === "act-pump-outflow").status, "confirmed");

  undoRecommendedAction("act-pump-outflow");
  const afterUndo = getRecommendedActions();

  assert.deepEqual(afterUndo, before);
  assert.equal(afterUndo.find((item) => item.id === "act-pump-outflow").status, "pending");
});

test("confirming an action does not change rain intensity", () => {
  resetSimulation();
  const before = getDashboardState();

  confirmRecommendedAction("act-pump-outflow");
  const afterConfirm = getDashboardState();

  assert.equal(afterConfirm.current.rainfallMmPerHour, before.current.rainfallMmPerHour);
  assert.equal(afterConfirm.current.rainfallChangePercent, before.current.rainfallChangePercent);
  assert.equal(afterConfirm.current.pumpsActive, 1);
});
