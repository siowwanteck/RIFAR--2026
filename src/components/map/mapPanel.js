export function renderMapPanel(state, selectedScenarioKey) {
  return `
    <div class="panel-header map-header">
      <div>
        <p class="eyebrow">Digital Twin - Taman Sri Muda</p>
        <h2>Live map intelligence</h2>
      </div>
      <div class="map-mode-group">
        <button type="button" class="active">2D</button>
        <button type="button">3D</button>
        <button type="button">Layer</button>
      </div>
    </div>
    <div class="timeline" id="timeline-buttons">
      ${renderTimelineButtons(state.forecast.timeline, selectedScenarioKey)}
    </div>
    <div class="map-shell">
      <div id="leaflet-map" class="leaflet-map"></div>
      <div class="legend map-legend">
        <strong>Water depth (m)</strong>
        <span><i class="depth-5"></i>&gt; 1.0</span>
        <span><i class="depth-4"></i>0.5 - 1.0</span>
        <span><i class="depth-3"></i>0.3 - 0.5</span>
        <span><i class="depth-2"></i>0.1 - 0.3</span>
        <span><i class="depth-1"></i>0 - 0.1</span>
      </div>
      <div class="scenario-chip">${scenarioChipText(state)}</div>
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
