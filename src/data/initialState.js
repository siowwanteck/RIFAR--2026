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
      drainLevelM: 1.42,
    },
    infrastructure: {
      pumps: {
        ps2: { active: false, ready: true, flowM3s: 0.42 },
        ps3: { active: false, ready: true, flowM3s: 0.34 },
      },
      tidalGates: {
        tg1: { open: true },
        tg2: { open: true },
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
        detail: "Rain Gauge RG1 reports rising intensity over Taman Sri Muda.",
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
