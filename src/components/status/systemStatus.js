export function renderSystemStatus(status) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">System & API status</p>
        <h2>Platform health</h2>
      </div>
    </div>
    <div class="system-panel">
      <div>
        <h3>Data sources</h3>
        ${status.sources.slice(4).map((source) => `
          <p><span>${source.name}</span><b>${source.status}</b></p>
        `).join("")}
      </div>
      <div>
        <h3>Model performance</h3>
        <p><span>Accuracy (7-day)</span><b>${status.model.accuracy7Day}%</b></p>
        <p><span>Precision</span><b>${status.model.precision}%</b></p>
        <p><span>Recall</span><b>${status.model.recall}%</b></p>
        <p><span>Last trained</span><b>${status.model.lastTrained}</b></p>
      </div>
    </div>
    <div class="api-list">
      <code>GET /api/flood/current</code>
      <code>GET /api/flood/forecast</code>
      <code>GET /api/flood/digital-twin</code>
      <code>GET /api/flood/recommendations</code>
    </div>
  `;
}
