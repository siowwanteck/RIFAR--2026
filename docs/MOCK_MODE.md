# FIaaS Mock Mode

The MVP uses a local mock simulation engine. It is structured so real MQTT, InfluxDB, weather APIs, or backend services can replace it later.

## Main Modules

- `src/data/locations.js` defines Taman Sri Muda map coordinates, markers, and affected zones.
- `src/data/initialState.js` defines the starting flood state.
- `src/simulation/sensorSimulator.js` advances rainfall, tide, and river readings.
- `src/simulation/floodModel.js` connects rainfall, pumps, water level, tank capacity, risk, and affected area.
- `src/simulation/weatherScenario.js` generates the 48-hour forecast.
- `src/simulation/recommendationEngine.js` creates AI-style mitigation recommendations.
- `src/services/mockApi.js` exposes dashboard/API functions used by the frontend and REST server.
- `src/hooks/useLiveSimulation.js` updates the UI every 3 seconds.

## Logic Rules

- Higher rainfall increases water level and tank capacity.
- Higher water level increases risk and affected area.
- Activating Pump PS2 reduces water pressure over later simulation ticks.
- Confirmed actions are added to the operational timeline.
- Forecast and map overlays update from the current simulation state.

## MVP Limits

This is not hydraulic simulation and does not control real infrastructure. Pump actions are operator-confirmed mock decisions only.
