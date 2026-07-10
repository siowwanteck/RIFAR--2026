import { tamanSriMuda } from "./locations.js";
import { buildRecommendations } from "../simulation/recommendationEngine.js";

export function createInitialState() {
  const now = new Date();
  const state = {
    tick: 0,
    location: tamanSriMuda,
    weather: {
      temperatureC: 27,
      condition: "Light Rain",
      rainIntensity: 12.4,
      rainTrendPercent: -8,
      tideLevelM: 1.08,
      riverLevelM: 1.24,
    },
    hydrology: {
      waterLevelM: 1.78,
      previousWaterLevelM: 1.7,
      tankCapacityPercent: 48,
      tankPressurePercent: 45,
      drainLevelM: 0.88,
      predictedDepthM: 0.29,
      backflowRiskPercent: 22,
    },
    infrastructure: {
      pumps: {
        outflow: { active: false, ready: true, flowM3s: 0.42 },
      },
      tidalGates: {
        outlet: { open: true },
      },
    },
    risk: {
      score: 53,
      level: "MEDIUM",
      trend: "Increasing",
      confidencePercent: 82,
    },
    impact: {
      affectedAreaHa: 8.1,
    },
    confirmedActions: [],
    alerts: [
      {
        id: "boot-risk",
        severity: "MEDIUM",
        title: "Runoff conditions under watch",
        detail: "Pilot Pond IoT Sensor shows moderate rain with manageable drain and tank levels.",
        time: formatTime(now),
      },
    ],
  };

  return {
    ...state,
    recommendations: buildRecommendations(state),
  };
}

export function cloneState(state) {
  return structuredClone(state);
}

export function formatTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-MY", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
