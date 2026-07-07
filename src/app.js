import { renderAlertsTimeline } from "./components/alerts/alertsTimeline.js";
import { renderForecastPanel } from "./components/forecast/forecastPanel.js";
import { renderKpiCards } from "./components/kpi/kpiCards.js";
import { renderSidebar } from "./components/layout/sidebar.js";
import { renderTopbar } from "./components/layout/topbar.js";
import { LeafletDigitalTwin } from "./components/map/leafletDigitalTwin.js";
import { renderMapPanel, renderTimelineButtons, scenarioChipText } from "./components/map/mapPanel.js";
import { renderRecommendationCards } from "./components/recommendations/recommendationCards.js";
import { renderSystemStatus } from "./components/status/systemStatus.js";
import { renderAffectedAreasTable } from "./components/tables/affectedAreasTable.js";
import { renderSensorTable } from "./components/tables/sensorTable.js";
import { createLiveSimulation } from "./hooks/useLiveSimulation.js";

let map;
let simulation;
let mapMode = "2d";
let mapLayerVisibility = { showFloodAreas: true };

function qs(selector) {
  return document.querySelector(selector);
}

function render(state, selectedScenarioKey) {
  qs("#sidebar").innerHTML = renderSidebar(state.systemStatus.sources);
  qs("#topbar").innerHTML = renderTopbar(state.current, state.alerts.length);
  qs("#kpi-row").innerHTML = renderKpiCards(state.current);
  qs("#forecast-panel").innerHTML = renderForecastPanel(state.forecast, selectedScenarioKey);
  qs("#recommendations-panel").innerHTML = renderRecommendationCards(state.recommendations);
  qs("#alerts-panel").innerHTML = renderAlertsTimeline(state.alerts);
  qs("#sensor-panel").innerHTML = renderSensorTable(state.sensors);
  qs("#affected-panel").innerHTML = renderAffectedAreasTable(state.affectedAreas);
  qs("#status-panel").innerHTML = renderSystemStatus(state.systemStatus);
  setClock();

  if (!map) {
    qs("#map-panel").innerHTML = renderMapPanel(state, selectedScenarioKey, mapMode, mapLayerVisibility);
    map = new LeafletDigitalTwin("digital-twin-map");
    map.mount(state.digitalTwin, mapMode, mapLayerVisibility);
  } else {
    qs("#timeline-buttons").innerHTML = renderTimelineButtons(state.forecast.timeline, selectedScenarioKey);
    qs(".scenario-chip").textContent = scenarioChipText(state);
    qs("#mode-chip").textContent = mapMode === "3d" ? "3D Digital Twin Mode" : "2D Live Map Mode";
    document.querySelectorAll("[data-map-mode]").forEach((button) => {
      button.classList.toggle("active", button.dataset.mapMode === mapMode);
    });
    const floodAreaButton = qs('[data-map-layer="flood-areas"]');
    if (floodAreaButton) {
      floodAreaButton.classList.toggle("active", mapLayerVisibility.showFloodAreas);
    }
    map.switchMode(mapMode, state.digitalTwin, mapLayerVisibility);
    map.update(state.digitalTwin, mapLayerVisibility);
  }
  window.lucide?.createIcons?.();
}

function setClock() {
  const clock = qs("#clock");
  if (!clock) return;
  clock.textContent = new Intl.DateTimeFormat("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

export function bootstrapApp() {
  document.addEventListener("click", (event) => {
    const scenarioButton = event.target.closest("[data-scenario]");
    if (scenarioButton) {
      simulation.setScenario(scenarioButton.dataset.scenario);
      return;
    }

    const mapModeButton = event.target.closest("[data-map-mode]");
    if (mapModeButton) {
      mapMode = mapModeButton.dataset.mapMode;
      simulation.refresh();
      return;
    }

    const mapLayerButton = event.target.closest("[data-map-layer]");
    if (mapLayerButton?.dataset.mapLayer === "flood-areas") {
      mapLayerVisibility = {
        ...mapLayerVisibility,
        showFloodAreas: !mapLayerVisibility.showFloodAreas,
      };
      simulation.refresh();
      return;
    }

    const confirmButton = event.target.closest("[data-confirm]");
    if (confirmButton) {
      simulation.confirm(confirmButton.dataset.confirm);
    }
  });

  simulation = createLiveSimulation({
    intervalMs: 3000,
    onUpdate: render,
  });

  simulation.start();
  window.addEventListener("beforeunload", () => simulation.stop());
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  bootstrapApp();
}
