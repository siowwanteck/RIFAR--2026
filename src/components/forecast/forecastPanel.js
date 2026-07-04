import { cssPercent, riskClass } from "../../utils/formatters.js";

export function renderForecastPanel(forecast, selectedScenarioKey) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">48-hour flood risk forecast</p>
        <h2>Risk trajectory</h2>
      </div>
    </div>
    <div class="risk-chart" aria-label="48-hour flood risk forecast">
      ${forecast.timeline.map((point) => `
        <button class="risk-point ${riskClass(point.riskLevel)} ${point.key === selectedScenarioKey ? "active" : ""}"
          style="--risk-height:${cssPercent(point.score)}"
          type="button"
          data-scenario="${point.key}">
          <i></i><span>${point.label}</span>
        </button>
      `).join("")}
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
