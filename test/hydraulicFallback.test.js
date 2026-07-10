import test from "node:test";
import assert from "node:assert/strict";

test("digital twin layers still resolve when hydraulic overlays are removed from locations data", async () => {
  const { getDigitalTwinLayers } = await import("../src/services/mockApi.js");
  const { createInitialState } = await import("../src/data/initialState.js");

  const layers = getDigitalTwinLayers(createInitialState(), "NOW");

  assert.ok(Array.isArray(layers.corridors));
  assert.ok(Array.isArray(layers.flowPaths));
});
