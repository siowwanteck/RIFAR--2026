import { riskClass } from "../../utils/formatters.js";

export function renderForecastPanel(forecast, selectedScenarioKey) {
  const points = forecast.chartTimeline;
  const polyline = buildPolyline(points);
  const selected = points.find((point) => point.key === selectedScenarioKey) ?? points[0];

  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">48-hour flood risk forecast</p>
        <h2>Risk trajectory</h2>
      </div>
    </div>
    <div class="risk-line-chart" aria-label="48-hour flood risk forecast">
      <div class="risk-zones">
        <span>Critical</span>
        <span>High</span>
        <span>Medium</span>
        <span>Low</span>
      </div>
      <svg viewBox="0 0 360 150" role="img" aria-label="Flood risk line chart">
        <defs>
          <linearGradient id="riskLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#ff5a50" stop-opacity="0.45" />
            <stop offset="55%" stop-color="#f2a93b" stop-opacity="0.2" />
            <stop offset="100%" stop-color="#28d17c" stop-opacity="0.08" />
          </linearGradient>
        </defs>
        <path class="risk-area" d="${buildArea(polyline)}"></path>
        <polyline class="risk-line" points="${polyline}"></polyline>
        ${points.map((point, index) => chartDot(point, index, selectedScenarioKey)).join("")}
      </svg>
      <div class="risk-axis">
        ${points.map((point) => `
          <button type="button" class="${point.key === selectedScenarioKey ? "active" : ""}" data-scenario="${point.key}">
            ${point.label}
          </button>
        `).join("")}
      </div>
      <div class="selected-risk ${riskClass(selected.riskLevel)}">${selected.label}: ${selected.riskLevel} / ${selected.score}</div>
    </div>
    <div class="forecast-summary">
      <div>
        <span>Peak flood risk</span>
        <strong class="${riskClass(forecast.peak.riskLevel)}">${forecast.peak.riskLevel}</strong>
        <small>ETA ${forecast.peak.eta}</small>
      </div>
      <div>
        <span>Confidence level</span>
        <strong>${forecast.peak.confidencePercent}%</strong>
        <meter value="${forecast.peak.confidencePercent}" min="0" max="100">${forecast.peak.confidencePercent}%</meter>
      </div>
    </div>
  `;
}

function buildPolyline(points) {
  return points.map((point, index) => {
    const x = 24 + index * (312 / (points.length - 1));
    const y = 132 - point.score * 1.08;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
}

function buildArea(polyline) {
  const first = polyline.split(" ")[0].split(",")[0];
  const last = polyline.split(" ").at(-1).split(",")[0];
  return `M ${first},138 L ${polyline} L ${last},138 Z`;
}

function chartDot(point, index, selectedScenarioKey) {
  const x = 24 + index * (312 / 5);
  const y = 132 - point.score * 1.08;
  return `<circle class="risk-dot ${riskClass(point.riskLevel)} ${point.key === selectedScenarioKey ? "active" : ""}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" data-scenario="${point.key}"></circle>`;
}
