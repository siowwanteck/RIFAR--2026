# FIaaS MVP Platform

Flood Intelligence as a Service is an MVP flood decision intelligence demo for Taman Sri Muda, Selangor.

The platform demonstrates:

- synthetic IoT and environmental data
- 48-hour flood risk prediction
- Digital Twin scenario data
- human-in-the-loop pump recommendations
- REST APIs for dashboard and integration use
- a dark control-room dashboard

## Run Locally

Requirements:

- Node.js 22 or newer

Start the MVP:

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

The project documentation names Spring Boot and React as the target production stack. This MVP implementation uses a dependency-free Node.js server and static frontend so the demo runs offline without Maven, npm installs, or network access. The REST API paths and payloads are shaped so a later Spring Boot and React build can replace the runtime without changing the product story.

## MVP Boundaries

This MVP does not perform hydraulic simulation, CFD, HEC-RAS integration, SCADA control, real MQTT ingestion, SMS, email, or autonomous pump operation. Pump actions are recommendations that require operator confirmation.
