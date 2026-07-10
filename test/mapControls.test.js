import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { renderMapPanel } from "../src/components/map/mapPanel.js";
import {
  getMapFitBounds,
  getMapRenderState,
  floodLayerVisibility,
  leafletFloodStyle,
  mapLibreFloodPaint,
} from "../src/components/map/leafletDigitalTwin.js";
import { createInitialState } from "../src/data/initialState.js";
import { getDigitalTwinLayers } from "../src/services/mockApi.js";

const mapSource = readFileSync(new URL("../src/components/map/leafletDigitalTwin.js", import.meta.url), "utf8");
const dashboardCss = readFileSync(new URL("../src/styles/dashboard.css", import.meta.url), "utf8");

test("map panel renders a flood area toggle button with active state", async () => {
  const state = {
    forecast: { timeline: [{ key: "NOW", label: "NOW" }] },
    digitalTwin: { selectedScenario: { label: "NOW", riskLevel: "HIGH" } },
  };

  const visibleHtml = renderMapPanel(state, "NOW", "2d", { showFloodAreas: true });
  const hiddenHtml = renderMapPanel(state, "NOW", "2d", { showFloodAreas: false });

  assert.match(visibleHtml, /data-map-layer="flood-areas"/);
  assert.match(visibleHtml, />Flood area<\/button>/);
  assert.match(visibleHtml, /class="active"[^>]*data-map-layer="flood-areas"/);
  assert.doesNotMatch(hiddenHtml, /class="active"[^>]*data-map-layer="flood-areas"/);
});

test("map render state removes flood overlays when flood areas are hidden", () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");

  const visibleState = getMapRenderState(layers, { showFloodAreas: true });
  const hiddenState = getMapRenderState(layers, { showFloodAreas: false });

  assert.equal(visibleState.floodOverlays.length, layers.floodOverlays.length);
  assert.deepEqual(hiddenState.floodOverlays, []);
  assert.equal(floodLayerVisibility(true), "visible");
  assert.equal(floodLayerVisibility(false), "none");
});

test("flood overlays use soft water styling instead of hard polygon outlines", () => {
  const softLeafletStyle = leafletFloodStyle({ depthM: 0.9, opacity: 0.42 });
  const mapLibrePaint = mapLibreFloodPaint();

  assert.equal(softLeafletStyle.stroke, false);
  assert.equal(softLeafletStyle.fillRule, "evenodd");
  assert.ok(softLeafletStyle.fillOpacity < 0.45);
  assert.deepEqual(mapLibrePaint.fillOutlineColor, "rgba(0,0,0,0)");
  assert.ok(mapLibrePaint.extrusionOpacity < 0.3);
  assert.ok(mapLibrePaint.extrusionHeightMultiplier < 10);
});

test("map fit bounds cover markers and flood overlays for the pilot area", () => {
  const layers = getDigitalTwinLayers(createInitialState(), "NOW");
  const bounds = getMapFitBounds(layers);

  assert.equal(bounds.length, 2);
  assert.ok(bounds[0][0] < layers.mapCenter.lat);
  assert.ok(bounds[1][0] > layers.mapCenter.lat);
  assert.ok(bounds[0][1] < layers.mapCenter.lng);
  assert.ok(bounds[1][1] > layers.mapCenter.lng);
});

test("map updates do not auto-fit on every simulation tick", () => {
  assert.doesNotMatch(mapSource, /updateLeaflet\(layers\)[\s\S]*fitLeafletToLayers\(this\.leafletMap,\s*layers\)/);
  assert.doesNotMatch(mapSource, /updateMapLibre\(layers,\s*mapLayerVisibility[\s\S]*this\.maplibreMap\.fitBounds\(/);
});

test("map containers fill the card height and leaflets resize after layout changes", () => {
  assert.match(dashboardCss, /\.digital-twin-map,[\s\S]*\.leaflet-container\s*{[^}]*width:\s*100%[^}]*height:\s*100%/s);
  assert.match(mapSource, /this\.leafletMap\.invalidateSize\(/);
});
