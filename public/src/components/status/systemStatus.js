export function renderSystemStatus(status) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">System & Data Status</p>
        <h2>Platform health</h2>
      </div>
    </div>
    <div class="system-panel">
      <div>
        <h3>Data sources</h3>
        ${status.sources.slice(0, 4).map((source) => `
          <p><span>${source.name}</span><b>${source.status}</b></p>
        `).join("")}
      </div>
      <div>
        <h3>Platform intelligence</h3>
        ${status.sources.slice(4).map((source) => `
          <p><span>${source.name}</span><b>${source.status}</b></p>
        `).join("")}
        <p><span>Accuracy (7-day)</span><b>${status.model.accuracy7Day}%</b></p>
        <p><span>Precision</span><b>${status.model.precision}%</b></p>
        <p><span>Recall</span><b>${status.model.recall}%</b></p>
      </div>
    </div>
  `;
}
