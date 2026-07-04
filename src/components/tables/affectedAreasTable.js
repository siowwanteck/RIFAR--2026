import { riskClass } from "../../utils/formatters.js";

export function renderAffectedAreasTable(areas) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">Affected areas</p>
        <h2>Predicted impact</h2>
      </div>
      <button class="ghost-button" type="button">View map</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Est. depth</th>
            <th>Risk level</th>
            <th>ETA</th>
          </tr>
        </thead>
        <tbody>
          ${areas.map((area) => `
            <tr>
              <td>${area.area}</td>
              <td>${area.estimatedDepth.toFixed(2)} m</td>
              <td><span class="risk-badge ${riskClass(area.riskLevel)}">${area.riskLevel}</span></td>
              <td>${area.eta}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
