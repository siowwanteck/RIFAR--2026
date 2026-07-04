# API_PRODUCTS.md

# FIaaS API Products

Version: MVP 1.0  
Project: Flood Intelligence as a Service  
Target Area: Taman Sri Muda, Selangor

---

# Purpose

FIaaS is not only a dashboard product.

FIaaS can also be sold as an API-based flood intelligence platform.

The APIs allow external organisations to connect FIaaS flood prediction, sensor intelligence, Digital Twin data and AI recommendations directly into their own systems.

---

# API Business Positioning

FIaaS does not sell raw data only.

FIaaS sells flood intelligence.

Raw sensor data answers:

```text
What is the water level now?
```

FIaaS APIs answer:

```text
What is the flood risk now?

What will happen in the next 48 hours?

Which areas may be affected?

What action should be taken?
```

---

# Target API Customers

Potential API customers include:

- Government agencies
- JPS
- Local councils
- Insurance companies
- Property developers
- Utility providers
- TNB
- Transport operators
- Smart city platforms
- Civil engineering consultants
- Universities and researchers

---

# API Product Categories

FIaaS APIs are grouped into three categories:

1. Intelligence APIs
2. Operational APIs
3. Integration APIs

---

# 1. Intelligence APIs

These are the most valuable API products because they provide processed flood intelligence instead of raw sensor values.

---

## 1.1 Current Flood Intelligence API

Provides the current flood condition for a selected location.

Includes:

- Current flood risk
- Rainfall intensity
- Water level
- Tank capacity
- Pump status
- Affected area estimate

Target customers:

- Government agencies
- Mobile app developers
- Property developers
- Smart city platforms

Business value:

Helps customers understand the current flood situation without building their own monitoring system.

---

## 1.2 Flood Forecast API

Provides AI-powered flood forecast for the next 48 hours.

Includes:

- Future flood risk
- Estimated water depth
- Time-to-flood
- Peak risk timing
- Confidence level

Target customers:

- Local councils
- Emergency response teams
- Smart city platforms
- Utility providers
- Transport operators

Business value:

Allows customers to prepare before flooding occurs.

---

## 1.3 Affected Area API

Provides predicted affected locations based on AI prediction and terrain-aware analysis.

Includes:

- Area name
- Estimated depth
- Risk level
- Estimated time of impact
- Affected road or asset information

Target customers:

- Government agencies
- Property developers
- Emergency response teams
- Insurance companies

Business value:

Helps organisations identify which areas require early action.

---

## 1.4 Asset Risk API

Provides flood risk information for specific assets.

Examples:

- Substations
- Roads
- Pump stations
- Buildings
- Drainage assets
- Tidal gates

Target customers:

- TNB
- Utility providers
- Transport operators
- Property developers

Business value:

Helps infrastructure owners protect critical assets before flooding occurs.

---

# 2. Operational APIs

These APIs support real-time operational decision making.

---

## 2.1 Sensor Intelligence API

Provides live and historical sensor readings.

Includes:

- Rain gauge readings
- Water level readings
- Drain level readings
- Tank level readings
- Pump status
- Tidal gate status

Target customers:

- Engineering consultants
- Universities
- Researchers
- Infrastructure operators

Business value:

Allows technical users to analyse real flood system behaviour using hyperlocal data.

---

## 2.2 Decision Support API

Provides AI-recommended mitigation actions.

Examples:

- Activate Pump PS2
- Prepare Pump PS3
- Monitor Tank A
- Notify Local Council
- Send Community Alert
- Monitor Low-Lying Area

Target customers:

- Local councils
- Infrastructure operators
- Emergency response teams
- Property management companies

Business value:

Transforms prediction into practical flood mitigation actions.

---

## 2.3 Pump Recommendation API

Provides pump operation recommendations based on predicted flood conditions.

Includes:

- Recommended pump action
- Reason for recommendation
- Priority level
- Affected asset
- Expected impact

Target customers:

- Pump operators
- Local councils
- Property developers
- Facility managers

Business value:

Supports human-in-the-loop pump operation decisions.

Important MVP note:

This API recommends pump operation only.  
It does not directly control real pumps in the MVP.

---

## 2.4 Flood Alert API

Sends alerts when flood risk exceeds predefined thresholds.

Supports:

- Dashboard alerts
- Webhooks
- SMS integration
- Email integration
- Mobile notification integration

Target customers:

- Government agencies
- Property management companies
- Emergency services
- Insurance companies

Business value:

Enables early warning and faster emergency response.

---

# 3. Integration APIs

These APIs allow FIaaS to connect with third-party systems.

---

## 3.1 Digital Twin Intelligence API

Provides Digital Twin data for current and predicted flood conditions.

Includes:

- Map centre
- Asset locations
- Sensor locations
- Current flood overlay
- Predicted flood overlay
- Timeline scenario data

Target customers:

- Smart city platforms
- Government agencies
- Property developers
- Infrastructure planners

Business value:

Allows external platforms to visualise flood intelligence without rebuilding their own Digital Twin system.

Important note:

This is not full hydraulic simulation.

It is a terrain-aware Digital Twin visualisation powered by sensor data and AI prediction.

---

## 3.2 Timeline Forecast API

Provides future scenario data at selected time intervals.

Supported timeline:

```text
NOW
+30m
+1h
+3h
+6h
+12h
+24h
+48h
```

Target customers:

- Emergency response teams
- Infrastructure operators
- Local councils
- Smart city platforms

Business value:

Helps users understand how flooding may evolve over time.

---

## 3.3 Webhook Integration API

Allows customers to receive automatic flood intelligence updates.

Example triggers:

- Flood risk becomes High
- Flood risk becomes Critical
- Tank capacity exceeds 80%
- Pump failure detected
- Sensor offline
- Road predicted to flood

Target customers:

- Government agencies
- Insurance companies
- Utilities
- Transport operators
- Property management companies

Business value:

Allows FIaaS to plug directly into customer workflows.

---

## 3.4 Historical Data API

Provides historical flood and sensor data.

Includes:

- Rainfall history
- Water level history
- Pump operation history
- Flood risk history
- Alert history
- Forecast history

Target customers:

- Researchers
- Universities
- Engineering consultants
- Insurance companies

Business value:

Supports reporting, research, model validation and risk analysis.

---

# Dashboard Service

In addition to APIs, FIaaS provides a web-based dashboard.

The dashboard visualises:

- Current flood risk
- 48-hour forecast
- Digital Twin map
- Sensor readings
- Pump recommendation
- Affected areas
- Alerts
- System status

Dashboard target customers:

- Local councils
- Property developers
- Infrastructure operators
- Smart city control rooms

The dashboard is the control-room interface.

The APIs are the integration layer.

---
# Business Value

FIaaS helps customers reduce the cost and complexity of building their own flood intelligence system.

Customers do not need to build:

- IoT data processing system
- Flood prediction model
- Digital Twin dashboard
- Alert engine
- API infrastructure

FIaaS provides these capabilities as a service.

---

# Core API Value Proposition

FIaaS transforms flood data into actionable intelligence.

Instead of selling:

```text
Raw water level data
```

FIaaS sells:

```text
Prediction
Risk
Timing
Affected areas
Recommended actions
Integration
```

---

# MVP Notes

For MVP:

- APIs can return simulated data.
- Flood forecast can be generated using synthetic data or rule-based prediction.
- Digital Twin output can be simplified.
- Pump recommendation should remain human-in-the-loop.
- Do not claim full autonomous pump control.
- Do not claim full hydraulic simulation.

The MVP goal is to demonstrate that FIaaS can become a scalable flood intelligence platform.

---

# Final Positioning

FIaaS is both:

1. A dashboard for flood operators
2. An API platform for external organisations

Together, they allow FIaaS to serve both operational and commercial users.

The dashboard helps people see and decide.

The APIs allow other systems to connect and act.