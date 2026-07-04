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
    qs("#map-panel").innerHTML = renderMapPanel(state, selectedScenarioKey);
    map = new LeafletDigitalTwin("leaflet-map");
    map.mount(state.digitalTwin);
  } else {
    qs("#timeline-buttons").innerHTML = renderTimelineButtons(state.forecast.timeline, selectedScenarioKey);
    qs(".scenario-chip").textContent = scenarioChipText(state);
    map.update(state.digitalTwin);
  }
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

document.addEventListener("click", (event) => {
  const scenarioButton = event.target.closest("[data-scenario]");
  if (scenarioButton) {
    simulation.setScenario(scenarioButton.dataset.scenario);
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
