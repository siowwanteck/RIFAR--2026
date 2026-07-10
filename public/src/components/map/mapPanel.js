export function renderMapPanel(state, selectedScenarioKey, mapMode, mapLayerVisibility = { showFloodAreas: true }) {
  return `
    <div class="panel-header map-header">
      <div>
        <p class="eyebrow">Digital Twin - Taman Sri Muda Pilot</p>
        <h2>Live map intelligence</h2>
      </div>
      <div class="map-mode-group">
        <button type="button" class="${mapMode === "2d" ? "active" : ""}" data-map-mode="2d">2D</button>
        <button type="button" class="${mapMode === "3d" ? "active" : ""}" data-map-mode="3d">3D</button>
        <button type="button" class="${mapLayerVisibility.showFloodAreas ? "active" : ""}" data-map-layer="flood-areas">Flood area</button>
      </div>
    </div>
    <div class="timeline" id="timeline-buttons">
      ${renderTimelineButtons(state.forecast.timeline, selectedScenarioKey)}
    </div>
    <div class="map-shell">
      <div id="digital-twin-map" class="digital-twin-map"></div>
      <div class="legend map-legend">
        <strong>Water depth (m)</strong>
        <span><i class="depth-5"></i>&gt; 1.0</span>
        <span><i class="depth-4"></i>0.5 - 1.0</span>
        <span><i class="depth-3"></i>0.3 - 0.5</span>
        <span><i class="depth-2"></i>0.1 - 0.3</span>
        <span><i class="depth-1"></i>0 - 0.1</span>
      </div>
      <div class="scenario-chip">${scenarioChipText(state)}</div>
      <div class="mode-chip" id="mode-chip">${modeChipText(mapMode)}</div>
    </div>
  `;
}

export function renderTimelineButtons(timeline, selectedScenarioKey) {
  return timeline.map((point) => `
    <button class="${point.key === selectedScenarioKey ? "active" : ""}" type="button" data-scenario="${point.key}">
      ${point.label}
    </button>
  `).join("");
}

export function scenarioChipText(state) {
  return `${state.digitalTwin.selectedScenario.label} - ${state.digitalTwin.selectedScenario.riskLevel}`;
}

export function modeChipText(mapMode) {
  return mapMode === "3d" ? "3D Digital Twin Mode" : "2D Live Map Mode";
}
