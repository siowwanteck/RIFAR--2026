# FIaaS MVP Setup

## Start The Platform

From `fiass-mvp`:

```powershell
npm install
npm run dev
```

or:

```powershell
npm start
```

Open:

```text
http://localhost:4173
```

The same server provides both the dashboard and API endpoints.

The dashboard serves Leaflet, MapLibre GL JS, and Lucide icons locally from installed npm packages. Leaflet still requests OpenStreetMap tiles in the browser, and the 3D MapLibre mode requests its open map style and tiles without any paid API key.

## Run Checks

```powershell
npm test
```

The tests verify:

- the flood intelligence timeline
- peak critical forecast timing
- human-in-the-loop recommendation confirmation
- Digital Twin scenario expansion
- irregular flood polygon overlays for 2D and 3D map modes
- dynamic simulation links between rain, pumps, water level, forecast, and map overlays

## Important Constraints

The MVP is synthetic and demo-focused. Data resets when the server restarts or the page reloads.

No paid services are required.
