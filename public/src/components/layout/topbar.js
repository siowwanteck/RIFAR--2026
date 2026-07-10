export function renderTopbar(current, alertCount) {
  return `
    <div class="title-block">
      <p class="eyebrow">Flood Intelligence as a Service</p>
      <h1>Taman Sri Muda Pilot Command View</h1>
    </div>
    <div class="topbar-actions">
      <label class="location-select">
        <span>Location</span>
        <select aria-label="Location">
          <option>${current.location}</option>
        </select>
      </label>
      <span class="live-pill"><i></i>Live</span>
      <span class="weather-pill">${current.weather.temperatureC} C<br><small>${current.weather.condition}</small></span>
      <span class="alert-pill"><b>${alertCount}</b> Active Alerts</span>
      <span class="clock-pill" id="clock">--:--</span>
      <span class="admin-pill">AD&nbsp;&nbsp;Admin</span>
    </div>
  `;
}
