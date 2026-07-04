export function riskClass(risk) {
  return `risk-${String(risk).toLowerCase()}`;
}

export function formatNumber(value, digits = 1) {
  return Number(value).toFixed(digits);
}

export function formatSigned(value, digits = 2, unit = "") {
  const rounded = Number(value).toFixed(digits);
  const sign = value >= 0 ? "+" : "";
  return `${sign}${rounded}${unit}`;
}

export function cssPercent(value) {
  return `${Math.max(0, Math.min(100, value))}%`;
}
