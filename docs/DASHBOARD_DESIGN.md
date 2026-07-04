# FIaaS Dashboard Design

The dashboard follows `DASHBOARD.png` as the visual source of truth.

## Layout

- Left sidebar for primary navigation and system health.
- Top title area for Taman Sri Muda Command View, live status, weather, alerts, time, and admin identity.
- Six KPI cards across the top.
- Large central Digital Twin map.
- Right stack for 48-hour forecast, AI recommended actions, and active alerts.
- Bottom grid for sensors, affected areas, and system/data status.

## Visual Direction

- Dark navy command-center background.
- Cyan and blue outlines for map/data infrastructure.
- Red for high risk.
- Orange for warning.
- Green for operational or reducing risk.
- Purple for critical flood risk.
- Compact panels with 8px radius, close spacing, and dense operational data.

## Digital Twin

The Digital Twin has two map modes centered on Taman Sri Muda, Shah Alam:

- 2D mode uses Leaflet with OpenStreetMap tiles.
- 3D mode uses MapLibre GL JS with the OpenFreeMap Liberty vector style, tilted camera, flood GeoJSON layers, raised flood-depth extrusion, roads, water, landuse, and labels. It does not require a Mapbox token or paid API.
- 3D building extrusion is added when the loaded OpenMapTiles/OpenStreetMap vector data exposes building geometry for the area. If building data is sparse around Taman Sri Muda, the 3D view still shows the real city basemap with roads, rivers, labels, flood polygons, and infrastructure markers.

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

Flood overlays use multiple irregular polygons so affected areas look like scattered road and drainage flooding instead of perfect circles. Polygon opacity, depth, and extrusion height scale by selected timeline scenario and current simulated risk.

The 48-hour forecast uses a line chart with NOW, +3h, +6h, +12h, +24h, and +48h points, plus LOW, MEDIUM, HIGH, and CRITICAL risk zones.
