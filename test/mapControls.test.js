import test from "node:test";
import assert from "node:assert/strict";

import { renderMapPanel } from "../src/components/map/mapPanel.js";
import {
  getMapRenderState,
  floodLayerVisibility,
  leafletFloodStyle,
  mapLibreFloodPaint,
} from "../src/components/map/leafletDigitalTwin.js";
import { createInitialState } from "../src/data/initialState.js";
import { getDigitalTwinLayers } from "../src/services/mockApi.js";

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
