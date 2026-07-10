export function renderSensorTable(sensors) {
  return `
    <div class="panel-header compact">
      <div>
        <p class="eyebrow">Real-time sensor overview</p>
        <h2>Sensor network</h2>
      </div>
      <button class="ghost-button" type="button">View all</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Sensor type</th>
            <th>Status</th>
            <th>Location</th>
            <th>Value</th>
            <th>Trend</th>
          </tr>
        </thead>
        <tbody>
          ${sensors.map((sensor) => `
            <tr>
              <td>${sensor.type} ${sensor.id}</td>
              <td><span class="status ${sensor.status.toLowerCase()}">${sensor.status}</span></td>
              <td>${sensor.location}</td>
              <td>${sensor.value}</td>
              <td><span class="spark ${sensor.trend}"></span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
