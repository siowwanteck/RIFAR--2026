import { riskClass } from "../../utils/formatters.js";

const CHART_VIEWBOX_WIDTH = 360;
const CHART_VIEWBOX_HEIGHT = 150;
const CHART_BASELINE_Y = 138;
const CHART_SCORE_BOTTOM_Y = 132;

export function renderForecastPanel(forecast, selectedScenarioKey) {
  const points = forecast.chartTimeline;
  const chartPoints = buildChartPoints(points);
  const linePath = buildSmoothLine(chartPoints);
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
      <div class="risk-chart-canvas">
        <svg viewBox="0 0 360 150" preserveAspectRatio="none" role="img" aria-label="Flood risk line chart">
          <defs>
            <linearGradient id="riskLineFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#ff5a50" stop-opacity="0.32" />
              <stop offset="55%" stop-color="#f2a93b" stop-opacity="0.16" />
              <stop offset="100%" stop-color="#28d17c" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <path class="risk-area" d="${buildArea(chartPoints, linePath)}"></path>
          <path class="risk-line" d="${linePath}"></path>
        </svg>
        <div class="risk-dots" aria-hidden="true">
          ${points.map((point, index) => chartDot(point, index, points.length, selectedScenarioKey)).join("")}
        </div>
      </div>
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

function buildChartPoints(points) {
  return points.map((point, index) => ({
    x: chartX(index, points.length),
    y: chartY(point.score),
  }));
}

function buildSmoothLine(points) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  const commands = [`M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`];

  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const controlPointOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlPointTwo = {
      x: next.x - (afterNext.x - current.x) / 6,
      y: next.y - (afterNext.y - current.y) / 6,
    };

    commands.push(
      `C ${controlPointOne.x.toFixed(1)},${controlPointOne.y.toFixed(1)} ${controlPointTwo.x.toFixed(1)},${controlPointTwo.y.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`,
    );
  }

  return commands.join(" ");
}

function buildArea(points, linePath) {
  if (points.length === 0) return "";
  const first = points[0];
  const last = points.at(-1);
  return `${linePath} L ${last.x.toFixed(1)},${CHART_BASELINE_Y} L ${first.x.toFixed(1)},${CHART_BASELINE_Y} Z`;
}

function chartDot(point, index, pointCount, selectedScenarioKey) {
  const x = (chartX(index, pointCount) / CHART_VIEWBOX_WIDTH) * 100;
  const y = (chartY(point.score) / CHART_VIEWBOX_HEIGHT) * 100;
  return `<span class="risk-dot ${riskClass(point.riskLevel)} ${point.key === selectedScenarioKey ? "active" : ""}" style="left:${x.toFixed(2)}%;top:${y.toFixed(2)}%" data-scenario="${point.key}"></span>`;
}

function chartX(index, pointCount) {
  return ((index + 0.5) * CHART_VIEWBOX_WIDTH) / pointCount;
}

function chartY(score) {
  return CHART_SCORE_BOTTOM_Y - score * 1.08;
}
