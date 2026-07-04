import { riskClass } from "../../utils/formatters.js";

export function renderRecommendationCards(recommendations) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">AI recommended actions</p>
        <h2>Mitigation queue</h2>
      </div>
    </div>
    <div class="recommendation-list">
      ${recommendations.map((item) => `
        <article class="recommendation ${riskClass(item.priority)} ${item.status}">
          <div class="recommendation-icon">${iconFor(item.id)}</div>
          <div class="recommendation-copy">
            <strong>${item.title}</strong>
            <span>${item.reason}</span>
            <small>${item.expectedImpact}</small>
          </div>
          <div class="action-side">
            <b>${item.priority}</b>
            ${item.requiresConfirmation
              ? `<button type="button" data-confirm="${item.id}" ${item.status === "confirmed" ? "disabled" : ""}>${item.status === "confirmed" ? "Confirmed" : "Confirm"}</button>`
              : `<small>Watch</small>`}
          </div>
        </article>
      `).join("")}
    </div>
  `;
}

function iconFor(id) {
  if (id.includes("ps2")) return "P2";
  if (id.includes("ps3")) return "P3";
  if (id.includes("gate")) return "TG";
  return "AR";
}
