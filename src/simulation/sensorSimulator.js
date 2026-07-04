import { cloneState } from "../data/initialState.js";

export function nextWeatherSample(state, seconds = 3) {
  const next = cloneState(state);
  const phase = (next.tick + seconds) / 7;
  const pulse = Math.sin(phase) * 2.4 + Math.sin(phase / 2) * 1.8;

  next.tick += seconds;
  next.weather.rainIntensity = clamp(next.weather.rainIntensity + pulse * 0.18, 5, 42);
  next.weather.rainTrendPercent = Math.round((next.weather.rainIntensity - 14.8) * 3.5);
  next.weather.condition = next.weather.rainIntensity > 28 ? "Heavy Rain" : next.weather.rainIntensity > 14 ? "Light Rain" : "Cloudy";
  next.weather.riverLevelM = clamp(next.weather.riverLevelM + (next.weather.rainIntensity - 18) * 0.002, 0.9, 2.5);
  next.weather.tideLevelM = clamp(1.14 + Math.sin(next.tick / 30) * 0.22, 0.8, 1.55);

  return next;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
