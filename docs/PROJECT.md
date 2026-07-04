# PROJECT.md

# Flood Intelligence as a Service (FIaaS)

Version: MVP 1.0

---

# Project Vision

Flood Intelligence as a Service (FIaaS) is an AI-powered flood decision intelligence platform designed to improve flood resilience for urban communities.

The first deployment target is **Taman Sri Muda, Selangor**, an area that has experienced severe urban flooding.

Unlike conventional flood monitoring systems, FIaaS combines real-time IoT sensing, predictive analytics, digital twin technology and decision support into one integrated platform.

The platform is designed to help operators make informed decisions before flooding occurs rather than simply reporting flood events after they happen.

---

# Background

Flood mitigation traditionally relies on physical infrastructure such as:

- attenuation tanks
- underground detention systems
- drainage networks
- pumps
- tidal gates

These infrastructures are designed by civil engineers.

However, many flood management systems still rely on manual monitoring and reactive decision making.

Operators often have to manually determine:

- when to activate pumps
- when flood risk becomes critical
- which locations will be affected first
- how flooding will evolve over time

FIaaS provides the intelligence layer above the physical infrastructure.

---

# Our Role

Civil engineers build flood mitigation infrastructure.

FIaaS makes that infrastructure intelligent.

Instead of replacing physical infrastructure, FIaaS continuously analyses operational data and predicts future flood behaviour to support faster and better decisions.

---

# Project Objective

Build an AI-powered flood decision intelligence platform capable of:

- collecting hyperlocal operational data
- predicting flood risk
- estimating flood timing
- estimating flood depth
- identifying likely affected low-lying areas
- recommending mitigation actions
- visualising both current and future flood situations through a Digital Twin
- exposing the information through dashboards and APIs

---

# Problem Statement

Current flood monitoring systems often suffer from several limitations:

- isolated sensor networks
- limited predictive capability
- fragmented data sources
- little operational decision support
- poor visualisation
- lack of interoperability

Most systems answer:

"What is happening?"

FIaaS answers:

"What will happen next?"

and

"What should we do now?"

---

# Solution Overview

FIaaS integrates multiple data sources into one platform.

Input sources include:

- IoT water level sensors
- attenuation tank sensors
- drainage sensors
- tidal gate sensors
- pump status
- rainfall data
- weather forecast
- river water level
- tidal information

These data are continuously analysed by the prediction engine.

The results are visualised inside a real-time Digital Twin and presented through an operational dashboard.

The platform also provides APIs for third-party integration.

---

# Key Technologies

- IoT
- MQTT
- Time-series database
- Machine Learning
- AI Decision Engine
- Digital Twin
- React Dashboard
- Spring Boot Backend
- REST API
- OpenStreetMap
- DEM Terrain Data

---

# Digital Twin Philosophy

The Digital Twin is NOT just a 3D map.

It is a continuously updated virtual representation of the real flood mitigation system.

The Digital Twin supports two operating modes:

## Live Mode

Displays:

- current sensor readings
- current flood conditions
- current infrastructure status

## Prediction Mode

Displays predicted conditions at:

- +30 minutes
- +1 hour
- +3 hours
- +6 hours
- +12 hours
- +24 hours
- +48 hours

This allows operators to understand how flooding is expected to evolve over time.

---

# Machine Learning

Machine learning is responsible for prediction.

The Digital Twin is responsible for visualisation.

The prediction engine estimates:

- flood risk
- flood timing
- estimated water depth
- likely affected areas

Future versions may continuously retrain the model using historical operational data.

---

# Pump Control Philosophy

For the MVP:

The system recommends pump operations.

Operators remain responsible for confirming the action.

Future commercial deployments may integrate with SCADA systems to support automatic pump operation where appropriate.

---

# Dashboard Philosophy

The dashboard is NOT designed to monitor floods.

It is designed to support flood management decisions.

Operators should be able to understand the overall situation within 30 seconds.

Every visual element must contribute towards operational decision making.

---

# Business Model

FIaaS is designed as a scalable SaaS platform.

Potential customers include:

- Local councils
- JPS
- Insurance companies
- Property developers
- Utility providers
- Transport operators
- Smart city operators

Customers may subscribe to:

- Dashboard platform
- REST APIs
- Predictive analytics
- Decision support services

---

# Scalability

The platform is location-independent.

Deploying FIaaS to a new location only requires:

- local IoT sensors
- local terrain data
- local hydrological parameters
- local asset information

The overall cloud architecture remains unchanged.

---

# MVP Scope

The MVP demonstrates:

- synthetic IoT data
- real terrain
- real map
- AI prediction
- Digital Twin
- operational dashboard
- API architecture

The MVP is NOT intended to replace hydraulic simulation software.

---

# Out of Scope

The MVP will NOT include:

- full hydraulic simulation
- CFD
- HEC-RAS integration
- automatic SCADA control
- autonomous emergency response

These belong to future commercial versions.

---

# Future Vision

FIaaS aims to become an intelligent flood resilience platform capable of connecting physical flood mitigation infrastructure with AI-driven operational intelligence.

The long-term goal is to enable governments, developers and infrastructure operators to make faster, data-driven flood management decisions through one unified platform.