# FIaaS MVP Setup

## Start The Platform

From `fiass-mvp`:

```powershell
npm start
```

Open:

```text
http://localhost:4173
```

The same server provides both the dashboard and API endpoints.

## Run Checks

```powershell
npm test
```

The tests verify:

- the flood intelligence timeline
- peak critical forecast timing
- human-in-the-loop recommendation confirmation
- Digital Twin scenario expansion

## Important Constraints

The MVP is synthetic and demo-focused. Data resets when the server restarts.

No external services are required.
