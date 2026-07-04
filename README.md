# FIaaS MVP Platform

Flood Intelligence as a Service is an MVP flood decision intelligence demo for Taman Sri Muda, Selangor.

The platform demonstrates:

- synthetic IoT and environmental data
- 48-hour flood risk prediction
- Digital Twin scenario data
- 2D Leaflet and 3D MapLibre digital twin modes
- human-in-the-loop pump recommendations
- REST APIs for dashboard and integration use
- a dark control-room dashboard

## Run Locally

Requirements:

- Node.js 22 or newer

Start the MVP:

```powershell
npm install
npm run dev
```

or:

```powershell
npm start
```

Then open:

```text
http://localhost:4173
```

Run tests:

```powershell
npm test
```

## Runtime Note

The project documentation names Spring Boot and React as the target production stack. This MVP implementation uses a small Node.js server and static frontend so the demo remains easy to run locally. The REST API paths and payloads are shaped so a later Spring Boot and React build can replace the runtime without changing the product story.

The Digital Twin uses Leaflet for 2D mode and MapLibre GL JS with OpenFreeMap vector tiles for 3D mode. No paid map API or Mapbox token is required, but real map tiles need browser internet access. Building extrusion appears where open building data is available.

## MVP Boundaries

This MVP does not perform hydraulic simulation, CFD, HEC-RAS integration, SCADA control, real MQTT ingestion, SMS, email, or autonomous pump operation. Pump actions are recommendations that require operator confirmation.
