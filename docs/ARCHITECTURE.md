# ARCHITECTURE.md

# FIaaS System Architecture

Version: MVP 1.0

---

# System Overview

Flood Intelligence as a Service (FIaaS) is an AI-powered flood decision intelligence platform.

The platform integrates real-time operational data, predictive analytics, Digital Twin technology and decision support into a unified flood resilience platform.

Rather than simply monitoring flooding, FIaaS predicts future flood behaviour and recommends mitigation actions before flooding occurs.

---

# Overall System Workflow

```text
Physical Infrastructure

↓

IoT Sensors

↓

MQTT Gateway

↓

Cloud Backend

↓

Time-Series Database

↓

Prediction Engine

↓

Decision Engine

↓

Digital Twin

↓

Operational Dashboard

↓

REST API

↓

Government / Developers / Insurance / Utilities
```

---

# Layer 1 — Physical Infrastructure

The physical layer consists of flood mitigation assets designed by civil engineers.

Examples include:

- Underground attenuation tank
- Drainage network
- Pump stations
- Tidal gates
- Overflow channels

FIaaS does not replace these assets.

Instead, it makes them intelligent.

---

# Layer 2 — Hyperlocal IoT Sensors

Sensors continuously collect operational data from the flood mitigation system.

Examples:

- Water level sensor
- Drain level sensor
- Tank level sensor
- Pump status
- Pump flow rate
- Gate position
- Rain gauge
- Soil moisture (future)
- Flow velocity (future)

These sensors provide the hyperlocal operational data that differentiates FIaaS from conventional flood monitoring systems.

---

# Layer 3 — External Data Sources

The platform continuously collects external environmental information.

Examples include:

- Weather forecast
- Rainfall forecast
- River water level
- Tide level
- Historical rainfall
- Historical flood events

These datasets improve prediction accuracy.

---

# Layer 4 — Data Ingestion

Incoming data are transmitted through MQTT.

Responsibilities:

- Receive sensor data
- Validate data
- Remove invalid values
- Timestamp records
- Standardise formats

All cleaned data are stored inside the time-series database.

---

# Layer 5 — Time-Series Database

The database stores historical operational information.

Examples:

- Sensor history
- Rainfall history
- Pump operation history
- Flood history
- AI predictions

The database supports:

- historical analysis
- trend detection
- AI model training
- dashboard visualisation

---

# Layer 6 — AI Prediction Engine

The prediction engine continuously analyses incoming data.

Possible models:

- Random Forest

Input Features:

- Rainfall
- Water level
- Tank level
- Drain level
- Tide level
- Weather forecast
- Historical trends
- Terrain elevation

Predicted Outputs:

- Flood Risk
- Estimated Water Depth
- Time-to-Flood
- Likely Affected Areas

The AI engine predicts future conditions rather than reacting to current events.

---

# Layer 7 — Decision Engine

The Decision Engine converts AI predictions into operational recommendations.

Example outputs:

- Activate Pump
- Increase Pump Speed
- Open Flood Gate
- Send Flood Alert
- Prepare Maintenance Team
- Notify Local Council

For the MVP, recommendations require operator confirmation.

Future commercial deployments may integrate with SCADA for automated execution.

---

# Layer 8 — Digital Twin

The Digital Twin is the virtual representation of the physical flood mitigation system.

It integrates:

- Real terrain
- Buildings
- Roads
- Drainage network
- Sensor locations
- Predicted flood conditions

The Digital Twin continuously synchronises with incoming sensor data.

---

## Live Mode

Displays the current situation.

Visualises:

- Current water level
- Current rainfall
- Pump status
- Active alerts
- Current flood risk

---

## Prediction Mode

Allows operators to visualise future scenarios.

Supported timeline:

NOW

+30 min

+1 hr

+3 hr

+6 hr

+12 hr

+24 hr

+48 hr

The Digital Twin updates based on AI predictions.

Operators can understand how flooding is expected to evolve over time.

---

# Layer 9 — Operational Dashboard

The dashboard is the primary interface for operators.

The objective is not monitoring.

The objective is operational decision support.

Main components include:

- KPI Cards
- Flood Risk Indicator
- Digital Twin
- 48-Hour Forecast
- Sensor Status
- Pump Recommendation
- Alert Timeline
- System Health

Operators should understand the overall situation within 30 seconds.

---

# Layer 10 — API Layer

All processed information is exposed through REST APIs.

Potential API consumers include:

- JPS
- Insurance companies
- Property developers
- Utility providers
- Transport operators
- Smart city platforms

Example APIs:

GET /current

GET /forecast

GET /risk

GET /digital-twin

GET /recommendation

GET /alerts

---

# Deployment Workflow

```text
Sensors

↓

MQTT （AWS IoT Core）

↓

Cloud Backend (AWS EC2)

↓

Time-Series Database (AWS RDS)

↓

AI Prediction

↓

Decision Engine

↓

Digital Twin

↓

Dashboard

↓ (AWS API Gateway)

REST API
```


---

# Design Principles

The architecture follows these principles:

- Modular
- Scalable
- Cloud-native
- API-first
- Explainable AI
- Real-time processing
- Digital Twin centric
- Human-in-the-loop decision making

---

# Architecture Philosophy

Civil engineers build flood mitigation infrastructure.

FIaaS provides the intelligence layer that transforms physical infrastructure into an intelligent flood resilience system.

Rather than asking:

"What is happening?"

FIaaS answers:

"What will happen next?"

and

"What should we do now?"