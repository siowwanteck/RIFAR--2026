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
      rainIntensity: 18.6,
      rainTrendPercent: 24,
      tideLevelM: 1.18,
      riverLevelM: 1.42,
    },
    hydrology: {
      waterLevelM: 2.35,
      previousWaterLevelM: 2.07,
      tankCapacityPercent: 62,
      tankPressurePercent: 58,
      drainLevelM: 1.42,
      predictedDepthM: 0.72,
      backflowRiskPercent: 42,
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
      score: 72,
      level: "HIGH",
      trend: "Increasing",
      confidencePercent: 87,
    },
    impact: {
      affectedAreaHa: 12.4,
    },
    confirmedActions: [],
    alerts: [
      {
        id: "boot-risk",
        severity: "HIGH",
        title: "Heavy rain detected",
        detail: "Pilot Pond IoT Sensor reports rising rainfall near Jalan Teladan 25/22.",
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
