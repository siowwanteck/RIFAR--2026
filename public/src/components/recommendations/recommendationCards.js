import { riskClass } from "../../utils/formatters.js";

export function renderRecommendationCards(recommendations) {
  const visibleRecommendations = recommendations.slice(0, 4);

  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">AI recommended actions</p>
        <h2>Mitigation queue</h2>
      </div>
    </div>
    <div class="recommendation-list">
      ${visibleRecommendations.map((item) => `
        <article class="recommendation ${riskClass(item.priority)} ${item.status}">
          <div class="recommendation-icon"><i data-lucide="${iconFor(item.id)}"></i></div>
          <div class="recommendation-copy">
            <strong>${item.title}</strong>
            <span>${item.reason}</span>
          </div>
          <div class="action-side">
            <b>${item.priority}</b>
            ${item.requiresConfirmation
              ? item.status === "confirmed"
                ? `<button type="button" class="is-confirmed" data-undo-confirm="${item.id}" title="Double-click to undo this action">Confirmed</button>`
                : `<button type="button" data-confirm="${item.id}">Confirm</button>`
              : `<small>Watch</small>`}
          </div>
        </article>
      `).join("")}
    </div>
    <button class="recommendation-footer" type="button">
      View all actions <i data-lucide="arrow-right"></i>
    </button>
  `;
}

function iconFor(id) {
  if (id.includes("pump")) return "power";
  if (id.includes("gate")) return "git-branch";
  if (id.includes("lowlands")) return "map";
  return "map-pinned";
}
