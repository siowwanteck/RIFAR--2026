const navItems = [
  "Overview",
  "Real-time Monitoring",
  "Forecast & Prediction",
  "Digital Twin Map",
  "Mitigation & Control",
  "Alerts & Notifications",
  "Reports",
  "API & Integrations",
  "Settings",
];

export function renderSidebar(sources) {
  return `
    <div class="brand">
      <div class="brand-mark" aria-hidden="true"></div>
      <div>
        <strong>FiaaS</strong>
        <span>Flood Intelligence as a Service</span>
      </div>
    </div>

    <nav class="nav-list" aria-label="Dashboard">
      ${navItems.map((item, index) => `
        <a class="${index === 0 ? "active" : ""}" href="#${item.toLowerCase().replaceAll(" ", "-")}">
          <span class="nav-icon">${navIcon(index)}</span>
          ${item}
        </a>
      `).join("")}
    </nav>

    <section class="rail-status">
      <h2>System Status</h2>
      ${sources.slice(0, 4).map((source) => `
        <p><span>${source.name}</span><b>${source.status}</b></p>
      `).join("")}
    </section>

    <div class="version"><span class="version-drop"></span>FiaaS v1.0.0</div>
  `;
}

function navIcon(index) {
  return ["OV", "RT", "FP", "DT", "MC", "AL", "RP", "API", "ST"][index] ?? "--";
}
