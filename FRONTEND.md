# DASHBOARD_REQUIREMENTS.md

# FIaaS Dashboard Requirements

Version: MVP 1.0  
Target Area: Taman Sri Muda, Selangor

---
# Dashboard reference 
![alt text](image.png)


# Dashboard Purpose

This dashboard is not only a flood monitoring screen.

It is an AI-powered flood decision intelligence dashboard.

The dashboard helps operators:

- understand current flood risk
- monitor real-time sensor conditions
- predict flood conditions up to 48 hours ahead
- visualise affected areas using a Digital Twin
- receive AI-recommended mitigation actions
- support pump operation decisions
- share flood intelligence through API integrations

The dashboard must answer three questions:

1. What is happening now?
2. What will happen next?
3. What should we do now?

---

# Overall Design Direction

The dashboard should look like a professional control-room interface.

Visual style:

- Dark theme
- High contrast
- Clean layout
- Modern SaaS style
- Professional emergency operation feel
- Suitable for government, developer and infrastructure operator users

The dashboard should look similar to a flood command centre, not a normal student project dashboard.

---

# Main Layout

The dashboard layout should include:

1. Top header bar
2. Left navigation sidebar
3. KPI summary row
4. Central Digital Twin map
5. Forecast and recommendation panels
6. Sensor and affected area panels
7. System and data status panel

---

# Top Header Bar

The top bar should include:

- FIaaS logo
- Platform name
- Subtitle: Flood Intelligence as a Service
- Location selector
- Live status indicator
- Current weather
- Active alerts count
- Current time
- Admin/user profile

Example location:

```text
Taman Sri Muda, Selangor
```

Example status:

```text
Live
```

Example weather:

```text
27°C
Light Rain
```

---

# Left Sidebar Navigation

The sidebar should include these pages:

- Overview
- Real-time Monitoring
- Forecast & Prediction
- Digital Twin Map
- Mitigation & Control
- Alerts & Notifications
- Reports
- API & Integrations
- Settings

The current active page should be clearly highlighted.

At the bottom of the sidebar, show system status:

- IoT Network
- Data Ingestion
- AI Model
- Cloud Connection

Each status should show Online / Offline / Warning.

---

# KPI Summary Row

The top KPI cards should provide a quick 30-second overview.

Required KPI cards:

## Current Flood Risk

Display:

- risk level
- direction trend
- colour-coded status

Example:

```text
HIGH
Risk Level
Increasing
```

Risk levels:

- Low
- Medium
- High
- Critical

---

## Rain Intensity

Display:

- current rainfall intensity
- unit: mm/hr
- percentage change compared with previous hour

Example:

```text
18.6 mm/hr
↑ 24% vs last hour
```

---

## Water Level

Display:

- average water level
- unit: metres
- change compared with last hour

Example:

```text
2.35 m
↑ 0.28 m vs last hour
```

---

## Attenuation Tank

Display:

- current tank capacity used
- percentage used
- warning if above threshold

Example:

```text
62%
Capacity Used
```

---

## Pump Station

Display:

- active pumps
- total pumps
- operational status

Example:

```text
2 / 3
Pumps Active
```

---

## Affected Area

Display:

- estimated affected area
- unit: hectares

Example:

```text
12.4 ha
Estimated
```

---

# Digital Twin Panel

The Digital Twin should be the main visual centre of the dashboard.

Title:

```text
DIGITAL TWIN — TAMAN SRI MUDA
```

The Digital Twin should show:

- real map / satellite-like terrain
- real roads
- real buildings
- drainage network
- attenuation tank location
- pump stations
- tidal gates
- sensor points
- predicted flood overlay
- water depth colours
- warning markers

---

# Digital Twin Modes

The Digital Twin must support two modes.

## Live Mode

Live Mode shows the current real-time situation.

It should visualise:

- current water level
- current rainfall
- current pump status
- current tank capacity
- current sensor readings
- current flood risk

---

## Prediction Mode

Prediction Mode shows predicted future conditions.

The dashboard should include a timeline selector:

```text
NOW | +30m | +1h | +3h | +6h | +12h | +24h | +48h
```

When the user selects a future time, the map should update to show:

- predicted water depth
- predicted affected areas
- predicted road impact
- predicted tank capacity
- predicted pump recommendation
- predicted risk level

This is one of the most important features of the dashboard.

The Digital Twin is not just a map.

It is a live and predictive simulation interface.

---

# Map Controls

The Digital Twin map should include:

- 2D / 3D toggle
- Layer button
- zoom in / zoom out
- reset view
- water depth legend
- clickable markers

Required layer options:

- Water depth
- Sensor locations
- Pump stations
- Attenuation tanks
- Tidal gates
- Affected roads
- Safe routes
- Critical infrastructure

---

# Water Depth Legend

Use a clear legend for predicted flood depth.

Example:

```text
Water Depth (m)

> 1.0
0.5 - 1.0
0.3 - 0.5
0.1 - 0.3
0 - 0.1
No Data
```

Depth should be visually represented using different blue/purple intensity.

---

# Map Markers

The map should include labelled markers such as:

- Pump Station PS2
- Attenuation Tank A
- Tidal Gate TG1
- Main Drain
- Sri Muda Lake
- High-risk road points

Each marker should show:

- asset name
- status
- current value
- warning level

Example:

```text
Pump Station PS2
Open
```

```text
Attenuation Tank A
62%
```

```text
Main Drain
2.35 m
```

---

# 48-Hour Flood Risk Forecast

A forecast panel should be shown beside the Digital Twin.

It should include:

- risk curve
- time axis
- risk levels
- peak risk
- confidence level

Example labels:

```text
Low
Medium
High
Critical
```

Example output:

```text
Peak Flood Risk: CRITICAL
in 22 hours
Confidence Level: 87%
```

This chart should help operators understand when the flood situation will become dangerous.

---

# AI Recommended Actions Panel

This is one of the most important panels.

The system must not only show risk.

It must recommend what to do.

Example recommendations:

```text
Activate Pump PS2
Prepare Pump PS3
Close Tidal Gate TG2 if needed
Monitor Low-Lying Area
Send Community Alert
Notify Local Council
Prepare Maintenance Team
```

Each recommendation should include:

- action title
- short reason
- priority level
- affected asset
- optional confirm button

Priority levels:

- Low
- Medium
- High
- Critical

For MVP, the system should recommend actions.

It should not fully auto-control pumps unless explicitly confirmed by the operator.

---

# Pump Operation Panel

The dashboard should include pump operation support.

For MVP:

- show pump status
- show AI recommendation
- show confirm action button
- show manual override warning

Example:

```text
AI Recommendation:
Activate Pump PS2

Reason:
Predicted tank capacity exceeds 80% within 3 hours.

Action:
[Confirm Pump Activation]
```

Important:

The MVP should use human-in-the-loop control.

Do not claim full autonomous pump control.

Future version may integrate with SCADA for automatic execution.

---

# Real-Time Sensor Overview

The dashboard should show all key sensor readings.

Required columns:

- Sensor Type
- Status
- Location
- Value
- Trend

Example sensors:

```text
Rain Gauge RG1
Water Level WL1
Water Level WL2
Tank Level TL1
Pump Station PS2
Tidal Gate TG1
```

Example values:

```text
18.6 mm/hr
2.35 m
1.42 m
62%
Active (2/3)
Open
```

Each sensor should show:

- Online
- Offline
- Warning

---

# Affected Areas Panel

The dashboard should include a predicted affected areas table.

Required columns:

- Area
- Estimated Depth
- Risk Level
- ETA

Example:

```text
Seksyen 25 | 0.45 m | High | 6 - 12 h
Seksyen 26 | 0.35 m | High | 8 - 14 h
Seksyen 27 | 0.30 m | Medium | 12 - 18 h
Persiaran Sri Muda | 0.25 m | Medium | 12 - 18 h
Jalan Murni 25/123 | 0.20 m | Low | 18 - 24 h
```

This panel helps operators identify which areas require early action.

---

# System & Data Status Panel

The dashboard should show platform health.

Required data source statuses:

- IoT Sensors
- Weather API
- River Level API
- Tidal API

Required model performance metrics:

- Accuracy
- Precision
- Recall
- Last trained date

Example:

```text
Accuracy (7-day): 92.4%
Precision: 90.1%
Recall: 91.3%
Last Trained: 5 May 2025
```

For MVP, these values can be simulated.

---

# Alerts & Notifications

The dashboard should include alerts for:

- high water level
- tank capacity warning
- pump failure
- sensor offline
- rainfall intensity increasing
- predicted flood risk high
- affected road warning

Alerts should be colour-coded by severity.

---

# API & Integration Page

The dashboard should include an API section for future customers.

Potential API consumers:

- JPS
- Local councils
- Insurance companies
- Property developers
- TNB
- Transport operators
- Utilities

Example APIs:

```text
GET /api/flood/current
GET /api/flood/forecast
GET /api/flood/risk
GET /api/flood/affected-areas
GET /api/flood/recommendations
GET /api/flood/assets
GET /api/flood/alerts
```

API purpose:

- allow external systems to consume flood intelligence
- support insurance risk pricing
- support utility asset protection
- support government emergency response
- support developer building management systems

---

# Reports Page

The Reports page should support:

- flood event summary
- sensor history
- pump operation history
- model prediction history
- affected area summary
- downloadable PDF report

For MVP, report generation can be simulated.

---

# User Experience Principles

The dashboard must be:

- easy to understand
- visually professional
- not overcrowded
- suitable for non-technical judges
- suitable for infrastructure operators
- focused on decision making

Every page should support one of these goals:

```text
Monitor
Predict
Visualise
Recommend
Mitigate
Integrate
```

---

# Important MVP Constraints

Do not implement full hydraulic simulation yet.

Do not implement real SCADA control yet.

Do not claim the system can fully control pumps autonomously.

Do not use fake-looking maps.

Do not overcomplicate the UI.

Use simulated data where necessary, but present it professionally.

---

# Demo Storyline

The dashboard demo should follow this story:

1. Heavy rain is detected in Taman Sri Muda.
2. IoT sensors report rising water levels.
3. The AI model predicts flood risk will become critical in 22 hours.
4. The Digital Twin visualises likely affected areas.
5. The system recommends activating Pump PS2.
6. The operator confirms the mitigation action.
7. The dashboard updates system status and affected area forecast.

This story should be understandable within 3 minutes.

---

# Core Message

The dashboard should communicate this message:

```text
FIaaS helps operators understand what is happening now,
predict what will happen next,
and decide what action to take before flooding occurs.
```