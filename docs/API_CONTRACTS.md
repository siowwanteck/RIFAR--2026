# FIaaS MVP API Contracts

Base URL:

```text
http://localhost:4173
```

## Dashboard

```text
GET /api/flood/dashboard
```

Returns the full dashboard state used by the UI:

- current flood condition
- 48-hour forecast
- Digital Twin scenarios
- recommendations
- affected areas
- sensors
- assets
- alerts
- system status

## Core Intelligence APIs

```text
GET /api/flood/current
GET /api/flood/forecast
GET /api/flood/risk
GET /api/flood/digital-twin
GET /api/flood/affected-areas
```

Risk levels use:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Timeline keys use:

```text
NOW
30M
1H
3H
6H
12H
24H
48H
```

## Operational APIs

```text
GET /api/flood/recommendations
GET /api/flood/sensors
GET /api/flood/assets
GET /api/flood/alerts
GET /api/flood/system-status
```

Confirm an operator decision:

```text
POST /api/flood/actions/{actionId}/confirm
```

Example:

```text
POST /api/flood/actions/act-ps2/confirm
```

The MVP records the confirmation in memory. It does not control real pumps.
