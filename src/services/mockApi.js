import { affectedZones, hydraulicCorridors, hydraulicFlowPaths, mapMarkers, tamanSriMuda } from "../data/locations.js";
import { createInitialState } from "../data/initialState.js";
import { advanceSimulation } from "../simulation/floodModel.js";
import { generateForecast48h } from "../simulation/weatherScenario.js";

let currentState = createInitialState();

export function resetSimulation() {
  currentState = createInitialState();
  return getDashboardState();
}

export function stepSimulation(seconds = 3) {
  currentState = advanceSimulation(currentState, seconds);
  return getDashboardState();
}

export function getCurrentFloodStatus() {
  return {
    location: currentState.location.label,
    status: "LIVE",
    weather: {
      temperatureC: currentState.weather.temperatureC,
      condition: currentState.weather.condition,
    },
    riskLevel: currentState.risk.level,
    riskScore: currentState.risk.score,
    riskTrend: currentState.risk.trend,
    rainfallMmPerHour: round(currentState.weather.rainIntensity, 1),
    rainfallChangePercent: currentState.weather.rainTrendPercent,
    averageWaterLevelM: round(currentState.hydrology.waterLevelM, 2),
    waterLevelChangeM: round(currentState.hydrology.waterLevelM - currentState.hydrology.previousWaterLevelM, 2),
    tankCapacityPercent: currentState.hydrology.tankCapacityPercent,
    pumpsActive: Number(currentState.infrastructure.pumps.outflow.active),
    pumpsTotal: 1,
    affectedAreaHa: currentState.impact.affectedAreaHa,
  };
}

export function getSensorReadings() {
  return [
    sensor("IOT1", "Rain + Water Level", "Pilot Pond IoT Sensor", `${round(currentState.weather.rainIntensity, 1)} mm/hr`, "rising"),
    sensor("WL1", "Water Level", "Jalan Teladan 25/22 drain", `${round(currentState.hydrology.waterLevelM, 2)} m`, currentState.risk.trend.toLowerCase()),
    sensor("WL2", "Water Level", "Jalan Nyaman 25/20 drain", `${round(currentState.hydrology.drainLevelM, 2)} m`, currentState.risk.trend.toLowerCase()),
    sensor("TL1", "Tank Level", "4000 m³ Underground Attenuation Tank", `${currentState.hydrology.tankCapacityPercent}%`, tankTrend(currentState.hydrology.tankCapacityPercent)),
    sensor("PUMP", "Pump Station", "Outflow Pump Station", currentState.infrastructure.pumps.outflow.active ? "Active" : "Standby", "operational"),
    sensor("GATE", "Tidal Gate", "Tidal gate outlet", currentState.infrastructure.tidalGates.outlet.open ? "Open" : "Closed", "stable"),
  ];
}

export function getForecast48h() {
  return generateForecast48h(currentState);
}

export function getDigitalTwinLayers(state = currentState, scenarioKey = "NOW") {
  const forecast = generateForecast48h(state);
  const scenario = forecast.timeline.find((point) => point.key === scenarioKey) ?? forecast.timeline[0];
  const intensity = scenario.score / 100;

  return {
    mapCenter: tamanSriMuda.center,
    bounds: tamanSriMuda.bounds,
    selectedScenario: scenario,
    markers: mapMarkers.map((marker) => ({
      ...marker,
      status: markerStatus(marker.id, state),
      value: markerValue(marker.id, state),
    })),
    floodOverlays: affectedZones.map((zone) => buildFloodPolygon(zone, scenario, intensity)),
    corridors: hydraulicCorridors.map((corridor) => buildCorridor(corridor, state)),
    flowPaths: hydraulicFlowPaths.map((path) => buildFlowPath(path, state)),
    mapEngines: ["leaflet-2d", "maplibre-3d"],
    layers: ["Water depth", "Pilot sensors", "Outflow pump", "4000 m³ attenuation tank", "Tidal gate", "Klang River backflow", "Runoff arrows"],
  };
}

export function getRecommendedActions() {
  return currentState.recommendations;
}

export function getAffectedAreas() {
  const forecast = generateForecast48h(currentState);
  return affectedZones.map((zone, index) => {
    const point = forecast.timeline[Math.min(index + 2, forecast.timeline.length - 1)];
    return {
      area: zone.name,
      estimatedDepth: round(point.depthM * zone.riskBias, 2),
      riskLevel: point.riskLevel,
      eta: point.label === "NOW" ? "Now" : point.label,
    };
  });
}

export function getAlertsTimeline() {
  return currentState.alerts.slice(0, 6);
}

export function getSystemStatus() {
  return {
    sources: [
      { name: "IoT Sensor Feed", status: "OPERATIONAL" },
      { name: "Weather Data Feed", status: "OPERATIONAL" },
      { name: "River Level Data", status: "OPERATIONAL" },
      { name: "Tidal Data", status: "OPERATIONAL" },
      { name: "Simulation Engine", status: "OPERATIONAL" },
      { name: "Prediction Model", status: currentState.risk.score >= 88 ? "WARNING" : "OPERATIONAL" },
      { name: "Data Sync", status: "OPERATIONAL" },
    ],
    model: {
      accuracy7Day: round(91.4 + currentState.risk.confidencePercent / 100, 1),
      precision: 90.1,
      recall: 91.3,
      lastTrained: "5 May 2025",
    },
  };
}

export function confirmRecommendedAction(actionId) {
  currentState = advanceSimulation(currentState, 2, { confirmedActionId: actionId });
  return {
    status: "confirmed",
    actionId,
    dashboard: getDashboardState(),
  };
}

export function getDashboardState(scenarioKey = "NOW") {
  return {
    generatedAt: new Date().toISOString(),
    current: getCurrentFloodStatus(),
    forecast: getForecast48h(),
    digitalTwin: getDigitalTwinLayers(currentState, scenarioKey),
    recommendations: getRecommendedActions(),
    affectedAreas: getAffectedAreas(),
    sensors: getSensorReadings(),
    alerts: getAlertsTimeline(),
    systemStatus: getSystemStatus(),
  };
}

export function getApiPayload(pathname) {
  const routes = {
    "/api/flood/current": getCurrentFloodStatus,
    "/api/flood/forecast": getForecast48h,
    "/api/flood/risk": () => ({ riskLevel: currentState.risk.level, trend: currentState.risk.trend, score: currentState.risk.score }),
    "/api/flood/digital-twin": () => getDigitalTwinLayers(currentState),
    "/api/flood/recommendations": getRecommendedActions,
    "/api/flood/affected-areas": getAffectedAreas,
    "/api/flood/sensors": getSensorReadings,
    "/api/flood/assets": () => getDigitalTwinLayers(currentState).markers,
    "/api/flood/alerts": getAlertsTimeline,
    "/api/flood/system-status": getSystemStatus,
    "/api/flood/dashboard": getDashboardState,
    "/api/flood/simulation/step": stepSimulation,
  };

  return routes[pathname]?.();
}

function sensor(id, type, location, value, trend) {
  return { id, type, status: "ONLINE", location, value, trend };
}

function buildFloodPolygon(zone, scenario, intensity) {
  const scale = 0.46 + intensity * zone.riskBias * 0.32;
  const coordinates = zone.shape.map(([lngOffset, latOffset]) => [
    round(zone.lng + lngOffset * scale, 6),
    round(zone.lat + latOffset * scale, 6),
  ]);
  coordinates.push(coordinates[0]);

  return {
    id: zone.id,
    name: zone.name,
    lat: zone.lat,
    lng: zone.lng,
    intensity: round(intensity * zone.riskBias, 3),
    depthM: round(Math.max(0.08, scenario.depthM * zone.riskBias), 2),
    riskLevel: scenario.riskLevel,
    opacity: round(0.06 + intensity * 0.18, 2),
    geometry: {
      type: "Polygon",
      coordinates: [coordinates],
    },
  };
}

function markerStatus(id, state) {
  if (id === "outflow-pump") return state.infrastructure.pumps.outflow.active ? "ACTIVE" : "STANDBY";
  if (id === "tank-4000") return state.hydrology.tankCapacityPercent >= 80 ? "WARNING" : "NORMAL";
  if (id === "pond-sensor") return state.risk.level;
  if (id === "tidal-gate") return state.infrastructure.tidalGates.outlet.open ? "OPERATIONAL" : "ACTIVE";
  if (id === "klang-river-edge") return state.hydrology.backflowRiskPercent >= 65 ? "WARNING" : "NORMAL";
  return "OPERATIONAL";
}

function markerValue(id, state) {
  if (id === "outflow-pump") return state.infrastructure.pumps.outflow.active ? "Active" : "Standby";
  if (id === "tank-4000") return `${state.hydrology.tankCapacityPercent}% full`;
  if (id === "pond-sensor") return `${round(state.weather.rainIntensity, 1)} mm/hr, ${round(state.hydrology.waterLevelM, 2)} m`;
  if (id === "tidal-gate") return state.infrastructure.tidalGates.outlet.open ? "Open" : "Closed";
  if (id === "klang-river-edge") return `${state.hydrology.backflowRiskPercent}% backflow risk`;
  if (id === "bioswale-field") return "Runoff capture";
  return "Watched";
}

function buildCorridor(corridor, state) {
  return {
    ...corridor,
    intensity: corridor.type === "river" ? state.hydrology.backflowRiskPercent / 100 : 0.42,
  };
}

function buildFlowPath(path, state) {
  const backflowRisk = state.hydrology.backflowRiskPercent / 100;
  const runoffIntensity = clamp((state.weather.rainIntensity / 42 + state.hydrology.waterLevelM / 4) / 2, 0.2, 1);

  return {
    ...path,
    intensity: path.type === "backflow" ? backflowRisk : runoffIntensity,
    direction: path.type === "backflow" ? "river-to-field" : "drains-to-river",
  };
}

function tankTrend(value) {
  if (value >= 80) return "warning";
  if (value >= 60) return "rising";
  return "stable";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function round(value, digits) {
  return Number(value.toFixed(digits));
}
