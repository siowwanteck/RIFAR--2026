# FIaaS Dashboard Design

The dashboard follows `DASHBOARD.png` as the visual source of truth.

## Layout

- Left sidebar for primary navigation and system health.
- Top title area for Taman Sri Muda Command View, live status, weather, alerts, time, and admin identity.
- Six KPI cards across the top.
- Large central Digital Twin map.
- Right stack for 48-hour forecast, AI recommended actions, and active alerts.
- Bottom grid for sensors, affected areas, and system/API status.

## Visual Direction

- Dark navy command-center background.
- Cyan and blue outlines for map/data infrastructure.
- Red for high risk.
- Orange for warning.
- Green for operational or reducing risk.
- Purple for critical flood risk.
- Compact panels with 8px radius, close spacing, and dense operational data.

## Digital Twin

The map uses Leaflet with OpenStreetMap tiles centered on Taman Sri Muda, Shah Alam.

Map layers include:

- Main Drain
- Seksyen 25
- Seksyen 26
- Seksyen 27
- Attenuation Tank A
- Pump Station PS2
- Pump Station PS3
- Tidal Gate TG1
- Water Level Sensor WL1
- Rain Gauge RG1

Flood overlays scale by selected timeline scenario and current simulated risk.
