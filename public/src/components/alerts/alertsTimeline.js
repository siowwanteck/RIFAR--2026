import { riskClass } from "../../utils/formatters.js";

export function renderAlertsTimeline(alerts) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">Active alerts</p>
        <h2>Operational timeline</h2>
      </div>
    </div>
    <div class="alert-list">
      ${alerts.map((alert) => `
        <article class="alert-item ${riskClass(alert.severity)}">
          <time>${alert.time}</time>
          <div>
            <strong>${alert.title}</strong>
            <span>${alert.detail}</span>
          </div>
        </article>
      `).join("")}
    </div>
  `;
}
