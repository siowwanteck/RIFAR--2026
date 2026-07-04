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

The dashboard loads Leaflet and OpenStreetMap tiles from public CDNs, so the real map needs internet access in the browser.

## Run Checks

```powershell
npm test
```

The tests verify:

- the flood intelligence timeline
- peak critical forecast timing
- human-in-the-loop recommendation confirmation
- Digital Twin scenario expansion
- dynamic simulation links between rain, pumps, water level, forecast, and map overlays

## Important Constraints

The MVP is synthetic and demo-focused. Data resets when the server restarts or the page reloads.

No paid services are required.
