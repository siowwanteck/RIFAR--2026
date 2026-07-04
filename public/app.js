let dashboardState;
let selectedScenario = "NOW";

const riskClass = (risk) => `risk-${String(risk).toLowerCase()}`;
const qs = (selector) => document.querySelector(selector);

function setClock() {
  qs("#clock").textContent = new Intl.DateTimeFormat("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());
}

function renderKpis(current) {
  const cards = [
    ["Current flood risk", current.riskLevel, current.riskTrend, riskClass(current.riskLevel)],
    ["Rain intensity", `${current.rainfallMmPerHour} mm/hr`, `+${current.rainfallChangePercent}% vs last hour`, "risk-high"],
    ["Water level (avg)", `${current.averageWaterLevelM} m`, `+${current.waterLevelChangeM} m vs last hour`, "risk-high"],
    ["Attenuation tank", `${current.tankCapacityPercent}%`, "Capacity used", "risk-medium"],
    ["Pump station", `${current.pumpsActive} / ${current.pumpsTotal}`, "Pumps active", "risk-low"],
    ["Affected area", `${current.affectedAreaHa} ha`, "Estimated", "risk-medium"],
  ];

  qs("#kpi-row").innerHTML = cards
    .map(([label, value, detail, tone]) => `
      <article class="kpi-card ${tone}">
        <span>${label}</span>
        <strong>${value}</strong>
        <small>${detail}</small>
      </article>
    `)
    .join("");
}

function renderTimeline() {
  qs("#timeline-buttons").innerHTML = dashboardState.forecast.timeline
    .map((point) => `
      <button class="${point.key === selectedScenario ? "active" : ""}" type="button" data-scenario="${point.key}">
        ${point.label}
      </button>
    `)
    .join("");

  qs("#timeline-buttons").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-scenario]");
    if (!button) return;
    selectedScenario = button.dataset.scenario;
    renderTimeline();
    renderMap();
  }, { once: true });
}

function depthClass(depth) {
  if (depth > 1) return "depth-zone depth-5";
  if (depth >= 0.5) return "depth-zone depth-4";
  if (depth >= 0.3) return "depth-zone depth-3";
  if (depth >= 0.1) return "depth-zone depth-2";
  return "depth-zone depth-1";
}

function renderMap() {
  const scenario = dashboardState.digitalTwin.scenarios.find((item) => item.key === selectedScenario);

  qs("#overlay-layer").innerHTML = scenario.floodOverlay
    .map((zone) => `
      <div class="${depthClass(zone.depth)}" style="left:${zone.x}%;top:${zone.y}%;width:${zone.width}%;height:${zone.height}%">
        <span>${zone.name}</span>
      </div>
    `)
    .join("");

  qs("#asset-layer").innerHTML = dashboardState.digitalTwin.assets
    .map((asset) => `
      <button class="asset-pin ${asset.type} ${asset.status.toLowerCase()}" style="left:${asset.x}%;top:${asset.y}%" type="button">
        <span>${asset.name}</span>
        <small>${asset.value}</small>
      </button>
    `)
    .join("");
}

function renderForecast() {
  qs("#risk-chart").innerHTML = dashboardState.forecast.timeline
    .map((point) => `
      <button class="risk-bar ${riskClass(point.riskLevel)}" style="height:${point.riskScore}%" type="button" data-scenario="${point.key}">
        <span>${point.label}</span>
      </button>
    `)
    .join("");

  qs("#risk-chart").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-scenario]");
    if (!button) return;
    selectedScenario = button.dataset.scenario;
    renderTimeline();
    renderMap();
  });

  const peak = dashboardState.forecast.peak;
  qs("#forecast-summary").innerHTML = `
    <div>
      <span>Peak flood risk</span>
      <strong class="${riskClass(peak.riskLevel)}">${peak.riskLevel}</strong>
      <small>in ${peak.hoursFromNow} hours (${peak.expectedAt})</small>
    </div>
    <div>
      <span>Confidence level</span>
      <strong>${peak.confidencePercent}%</strong>
      <meter value="${peak.confidencePercent}" min="0" max="100">${peak.confidencePercent}%</meter>
    </div>
  `;
}

function renderRecommendations() {
  qs("#recommendation-list").innerHTML = dashboardState.recommendations
    .map((item) => `
      <article class="recommendation ${riskClass(item.priority)}">
        <div>
          <strong>${item.title}</strong>
          <span>${item.reason}</span>
          <small>${item.asset} - ${item.expectedImpact}</small>
        </div>
        <div class="action-side">
          <b>${item.priority}</b>
          ${
            item.requiresConfirmation
              ? `<button type="button" data-confirm="${item.id}" ${item.status === "confirmed" ? "disabled" : ""}>${item.status === "confirmed" ? "Confirmed" : "Confirm"}</button>`
              : `<span class="watch-only">Watch</span>`
          }
        </div>
      </article>
    `)
    .join("");
}

async function confirmRecommendation(actionId) {
  const response = await fetch(`/api/flood/actions/${actionId}/confirm`, { method: "POST" });
  if (!response.ok) throw new Error("Action confirmation failed");
  await loadDashboard();
}

function renderTables() {
  qs("#sensor-table").innerHTML = dashboardState.sensors
    .map((sensor) => `
      <tr>
        <td>${sensor.type} ${sensor.id}</td>
        <td><span class="status ${sensor.status.toLowerCase()}">${sensor.status}</span></td>
        <td>${sensor.location}</td>
        <td>${sensor.value}</td>
        <td>${sensor.trend}</td>
      </tr>
    `)
    .join("");

  qs("#affected-table").innerHTML = dashboardState.affectedAreas
    .map((area) => `
      <tr>
        <td>${area.area}</td>
        <td>${area.estimatedDepth.toFixed(2)} m</td>
        <td><span class="risk-badge ${riskClass(area.riskLevel)}">${area.riskLevel}</span></td>
        <td>${area.eta}</td>
      </tr>
    `)
    .join("");
}

function renderSystemStatus() {
  qs("#rail-status-list").innerHTML = dashboardState.systemStatus.sources
    .map((source) => `<p><span>${source.name}</span><b>${source.status}</b></p>`)
    .join("");

  const model = dashboardState.systemStatus.model;
  qs("#system-panel").innerHTML = `
    <div class="source-list">
      ${dashboardState.systemStatus.sources.map((source) => `<p><span>${source.name}</span><b>${source.status}</b></p>`).join("")}
    </div>
    <div class="model-list">
      <p><span>Accuracy (7-day)</span><b>${model.accuracy7Day}%</b></p>
      <p><span>Precision</span><b>${model.precision}%</b></p>
      <p><span>Recall</span><b>${model.recall}%</b></p>
      <p><span>Last trained</span><b>${model.lastTrained}</b></p>
    </div>
  `;
}

function renderAlerts() {
  qs("#alert-count").textContent = `${dashboardState.alerts.length} alerts`;
  qs("#alert-list").innerHTML = dashboardState.alerts
    .map((alert) => `
      <article class="alert-item ${riskClass(alert.severity)}">
        <strong>${alert.title}</strong>
        <span>${alert.detail}</span>
        <small>${alert.time}</small>
      </article>
    `)
    .join("");
}

function renderHeader() {
  const weather = dashboardState.current.weather;
  qs("#weather-summary").textContent = `${weather.temperatureC} C - ${weather.condition}`;
}

function renderAll() {
  renderHeader();
  renderKpis(dashboardState.current);
  renderTimeline();
  renderMap();
  renderForecast();
  renderRecommendations();
  renderTables();
  renderSystemStatus();
  renderAlerts();
}

async function loadDashboard() {
  const response = await fetch("/api/flood/dashboard");
  if (!response.ok) throw new Error("Could not load FIaaS dashboard data");
  dashboardState = await response.json();
  renderAll();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-confirm]");
  if (!button) return;
  confirmRecommendation(button.dataset.confirm).catch((error) => {
    button.textContent = error.message;
  });
});

setClock();
setInterval(setClock, 60_000);
loadDashboard().catch((error) => {
  document.body.innerHTML = `<main class="load-error"><h1>FIaaS data unavailable</h1><p>${error.message}</p></main>`;
});
