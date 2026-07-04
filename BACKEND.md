# BACKEND_REQUIREMENTS.md

# FIaaS Backend Requirements

Version: MVP 1.0

---

# Purpose

The backend is the brain of FIaaS.

Its job is to collect data, analyse the flood situation, generate predictions and provide information to the Dashboard and APIs.

The backend should not only display data.

It should transform raw data into useful flood intelligence.

---

# Overall Workflow

IoT Sensors

↓

Backend

↓

AI Prediction

↓

Decision Engine

↓

Digital Twin

↓

Dashboard

↓

API

---

# What the Backend Receives

The backend continuously receives data from different sources.

## IoT Sensors

- Tank Water Level
- Drain Water Level
- Pump Status
- Rain Gauge
- Tidal Gate Status

---

## External Data

- Weather Forecast
- Rainfall Forecast
- River Water Level
- Tide Level

---

# What the Backend Does

The backend is responsible for five main tasks.

## 1. Store Data

Store all incoming sensor readings for historical analysis.

Examples:

- rainfall
- water level
- tank level
- pump status

---

## 2. Predict Flood Conditions

The backend sends the latest data to the AI model.

The AI predicts:

- Flood Risk
- Estimated Water Depth
- Time-to-Flood
- Likely Affected Areas

The prediction should support:

NOW

30 mins

1 hour

6 hours

24 hours

48 hours

---

## 3. Generate Recommendations

Based on the prediction, the backend generates recommendations.

Examples:

- Activate Pump PS2
- Prepare Pump PS3
- Monitor Tank A
- Notify Local Council
- Send Community Alert

For the MVP, these are recommendations only.

The operator decides whether to execute them.

---

## 4. Update the Digital Twin

The backend continuously updates the Digital Twin.

The Digital Twin displays:

- Current flood condition
- Future flood prediction
- Flood depth
- Flooded areas
- Infrastructure status

---

## 5. Provide APIs

The backend provides information to:

- Dashboard
- Government
- Insurance Companies
- Property Developers
- Utility Companies

Everything displayed on the dashboard comes from backend APIs.

---

# Dashboard Data

The backend provides data for:

Current Flood Risk

Rainfall

Water Level

Tank Capacity

Pump Status

48-hour Forecast

Digital Twin

AI Recommendations

Affected Areas

System Status

---

# Pump Control

For the MVP:

The backend recommends pump activation.

Example:

Predicted tank capacity exceeds 80%.

↓

Recommend activating Pump PS2.

The operator confirms the action.

The backend updates the dashboard.

Future versions may integrate with SCADA for automatic pump control.

---

# APIs

Example APIs:

GET /current

GET /forecast

GET /recommendations

GET /digital-twin

GET /affected-areas

GET /alerts

These APIs allow other systems to integrate with FIaaS.

---

# Future Expansion

The backend should be designed so new locations can easily be added.

For example:

Taman Sri Muda

↓

Another residential area

↓

Industrial park

↓

Smart city

Only the sensors and local data need to change.

The backend architecture remains the same.

---

# MVP Scope

The backend should demonstrate:

✅ Sensor integration

✅ AI prediction

✅ Decision support

✅ Digital Twin updates

✅ Dashboard APIs

It does NOT need to implement:

❌ Full hydraulic simulation

❌ Automatic pump control

❌ Complex AI retraining

Those belong to future commercial versions.

---

# Backend Philosophy

The backend transforms data into decisions.

Instead of asking:

"What is the current water level?"

FIaaS answers:

"What will happen next, and what should we do?"