import { cloneState, formatTime } from "../data/initialState.js";
import { buildRecommendations } from "./recommendationEngine.js";
import { clamp, nextWeatherSample } from "./sensorSimulator.js";

export function advanceSimulation(state, seconds = 3, event = {}) {
  let next = nextWeatherSample(state, seconds);

  if (event.confirmedActionId) {
    next = applyConfirmedAction(next, event.confirmedActionId);
  }

  const inflow = next.weather.rainIntensity * 0.006 + next.weather.riverLevelM * 0.01 + next.weather.tideLevelM * 0.006;
  const pumpOutflow = (next.infrastructure.pumps.ps2.active ? 0.15 : 0) + (next.infrastructure.pumps.ps3.active ? 0.07 : 0);
  const previousWaterLevelM = next.hydrology.waterLevelM;

  // Simple mass-balance mock: rainfall and river/tide pressure add water,
  // active pumps remove it. This is intentionally replaceable by a real model.
  next.hydrology.previousWaterLevelM = previousWaterLevelM;
  next.hydrology.waterLevelM = round(clamp(previousWaterLevelM + inflow - pumpOutflow, 1.1, 3.8), 2);
  next.hydrology.drainLevelM = round(clamp(next.hydrology.waterLevelM - 0.9, 0.4, 2.8), 2);
  next.hydrology.tankCapacityPercent = Math.round(clamp(next.hydrology.tankCapacityPercent + next.weather.rainIntensity * 0.11 - pumpOutflow * 28, 28, 99));

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
      detail: "Digital Twin overlay expanded around Seksyen 25 and Seksyen 26.",
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
  const pumpRelief = state.infrastructure.pumps.ps2.active ? 9 : 0;

  return Math.round(clamp(rain + water + tank + tide - pumpRelief, 8, 99));
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

  if (actionId === "act-ps2") {
    next.infrastructure.pumps.ps2.active = true;
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: "LOW",
      title: "Pump PS2 activation confirmed",
      detail: "Operator confirmed mitigation. FIaaS records the decision only.",
      time: formatTime(),
    });
  }

  if (actionId === "prep-ps3") {
    next.infrastructure.pumps.ps3.ready = true;
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: "MEDIUM",
      title: "Pump PS3 prepared",
      detail: "Standby pump marked ready for escalation.",
      time: formatTime(),
    });
  }

  if (actionId === "gate-tg2") {
    next.infrastructure.tidalGates.tg2.open = false;
    next.alerts.unshift({
      id: `confirm-${actionId}-${next.tick}`,
      severity: "MEDIUM",
      title: "Tidal Gate TG2 closure prepared",
      detail: "Gate recommendation confirmed for backflow mitigation.",
      time: formatTime(),
    });
  }

  return next;
}

function round(value, digits) {
  return Number(value.toFixed(digits));
}
