import { cloneState, formatTime } from "../data/initialState.js";
import { buildRecommendations } from "./recommendationEngine.js";
import { clamp, nextWeatherSample } from "./sensorSimulator.js";

export function advanceSimulation(state, seconds = 3, event = {}) {
  let next = nextWeatherSample(state, seconds);

  if (event.confirmedActionId) {
    next = applyConfirmedAction(next, event.confirmedActionId);
  }

  return recomputeDerivedState(next);
}

export function applyConfirmedActionWithoutWeatherStep(state, actionId) {
  const next = applyConfirmedAction(state, actionId);
  return recomputeDerivedState(next);
}

function recomputeDerivedState(next) {

  const gateClosed = !next.infrastructure.tidalGates.outlet.open;
  const backflowPressure = Math.max(0, (next.weather.riverLevelM - 1.35) * 0.016 + (next.weather.tideLevelM - 1.1) * 0.012);
  const backflowInflow = gateClosed ? backflowPressure * 0.22 : backflowPressure;
  const downstreamSafe = gateClosed || backflowPressure < 0.012;
  const pumpOutflow = downstreamSafe && next.infrastructure.pumps.outflow.active ? 0.34 : 0;
  const inflow = next.weather.rainIntensity * 0.006 + backflowInflow;
  const previousWaterLevelM = next.hydrology.waterLevelM;
  const previousTankCapacity = next.hydrology.tankCapacityPercent;

  // Simple mass-balance mock: rainfall and river/tide pressure add water,
  // active pumps remove it. This is intentionally replaceable by a real model.
  next.hydrology.previousWaterLevelM = previousWaterLevelM;
  next.hydrology.waterLevelM = round(clamp(previousWaterLevelM + inflow - pumpOutflow, 1.1, 3.8), 2);
  next.hydrology.drainLevelM = round(clamp(next.hydrology.waterLevelM - 0.9, 0.4, 2.8), 2);
  next.hydrology.tankCapacityPercent = Math.round(clamp(previousTankCapacity + next.weather.rainIntensity * 0.11 + backflowInflow * 120 - pumpOutflow * 60, 28, 99));
  next.hydrology.tankPressurePercent = Math.round(clamp(next.hydrology.tankCapacityPercent + next.hydrology.waterLevelM * 4 - pumpOutflow * 34, 20, 99));
  next.hydrology.predictedDepthM = round(clamp(next.hydrology.waterLevelM - 1.72 + next.hydrology.tankCapacityPercent / 280, 0.05, 2.4), 2);
  next.hydrology.backflowRiskPercent = Math.round(clamp((next.weather.riverLevelM + next.weather.tideLevelM) * 20 - (gateClosed ? 26 : 0), 8, 96));

  const score = computeRiskScore(next);
  next.risk = {
    score,
    level: riskLevelForScore(score),
    trend: next.hydrology.waterLevelM >= previousWaterLevelM ? "Increasing" : "Reducing",
    confidencePercent: Math.round(clamp(78 + score * 0.12, 76, 94)),
  };
  next.impact.affectedAreaHa = round(clamp(3.2 + score * 0.14 + next.hydrology.waterLevelM * 1.6, 3, 24), 1);
  next.recommendations = buildRecommendations(next);

  if (next.risk.score >= 88 && !next.alerts.some((alert) => alert.id === "critical-risk")) {
    next.alerts.unshift({
      id: "critical-risk",
      severity: "CRITICAL",
      title: "Critical flood risk forecast",
      detail: "Digital Twin overlay expanded around Jalan Nyaman 25/20 and the field attenuation zone.",
      time: formatTime(),
    });
  }

  return next;
}

export function computeRiskScore(state) {
  const rain = state.weather.rainIntensity * 1.1;
  const water = (state.hydrology.waterLevelM - 1.2) * 26;
  const tank = state.hydrology.tankCapacityPercent * 0.38;
  const tide = state.weather.tideLevelM * 6;
  const pumpRelief = state.infrastructure.pumps.outflow.active ? 9 : 0;
  const gateRelief = state.infrastructure.tidalGates.outlet.open ? 0 : 7;

  return Math.round(clamp(rain + water + tank + tide - pumpRelief - gateRelief, 8, 99));
}

export function riskLevelForScore(score) {
  if (score >= 88) return "CRITICAL";
  if (score >= 68) return "HIGH";
  if (score >= 42) return "MEDIUM";
  return "LOW";
}

function applyConfirmedAction(state, actionId) {
  const next = cloneState(state);
  if (!next.confirmedActions.includes(actionId)) {
    next.confirmedActions.push(actionId);
  }

  if (actionId === "act-pump-outflow") {
    next.infrastructure.pumps.outflow.active = true;
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: "LOW",
      title: "Outflow Pump Station activation confirmed",
      detail: "Operator confirmed controlled release from the 4000 m³ attenuation tank.",
      time: formatTime(),
    });
  }

  if (actionId === "close-tidal-gate") {
    next.infrastructure.tidalGates.outlet.open = false;
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: "MEDIUM",
      title: "Tidal / Box Culvert Gate closure confirmed",
      detail: "Gate recommendation confirmed to reduce Klang River backflow at the outlet.",
      time: formatTime(),
    });
  }

  if (actionId === "issue-flood-alert") {
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: next.risk.score >= 88 ? "CRITICAL" : "HIGH",
      title: "Flood alert issued for pilot-site lowlands",
      detail: "Resident alert sent for Jalan Teladan 25/22, Jalan Nyaman 25/20, and the field attenuation zone.",
      time: formatTime(),
    });
  }

  return next;
}

function round(value, digits) {
  return Number(value.toFixed(digits));
}
