import { riskLevelForScore } from "./floodModel.js";

const forecastStops = [
  { key: "NOW", label: "NOW", hours: 0 },
  { key: "30M", label: "+30m", hours: 0.5 },
  { key: "1H", label: "+1h", hours: 1 },
  { key: "3H", label: "+3h", hours: 3 },
  { key: "6H", label: "+6h", hours: 6 },
  { key: "12H", label: "+12h", hours: 12 },
  { key: "24H", label: "+24h", hours: 24 },
  { key: "48H", label: "+48h", hours: 48 },
];

export function generateForecast48h(state) {
  const pumpRelief = state.infrastructure.pumps.ps2.active ? 24 : 0;
  const rainPressure = state.weather.rainIntensity * 0.92;
  const waterPressure = state.hydrology.waterLevelM * 15;
  const tankPressure = state.hydrology.tankCapacityPercent * 0.34;

  const timeline = forecastStops.map((stop) => {
    const stormCurve = Math.sin((stop.hours + 3) / 8) * 10 + Math.min(stop.hours * 1.25, 18);
    const recovery = stop.hours > 24 ? (stop.hours - 24) * 0.9 : 0;
    const score = clampScore(rainPressure + waterPressure + tankPressure + stormCurve - pumpRelief - recovery);
    const depthM = Math.max(0.06, state.hydrology.waterLevelM - 2 + score / 190);

    return {
      ...stop,
      score: Math.round(score),
      riskLevel: riskLevelForScore(score),
      depthM: Number(depthM.toFixed(2)),
      confidencePercent: Math.round(clampScore(76 + score * 0.12)),
    };
  });

  const peak = timeline.reduce((highest, point) => point.score > highest.score ? point : highest, timeline[0]);

  return {
    timeline,
    peak: {
      ...peak,
      eta: peak.key === "NOW" ? "now" : peak.label,
      confidencePercent: peak.confidencePercent,
    },
  };
}

function clampScore(value) {
  return Math.min(99, Math.max(8, value));
}
