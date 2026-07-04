import { formatNumber, formatSigned, riskClass } from "../../utils/formatters.js";

export function renderKpiCards(current) {
  const cards = [
    {
      label: "Current flood risk",
      value: current.riskLevel,
      detail: current.riskTrend,
      tone: riskClass(current.riskLevel),
      icon: "RL",
    },
    {
      label: "Rain intensity",
      value: `${formatNumber(current.rainfallMmPerHour, 1)} mm/hr`,
      detail: `${formatSigned(current.rainfallChangePercent, 0, "%")} vs last hour`,
      tone: "risk-high",
      icon: "RN",
    },
    {
      label: "Water level (avg)",
      value: `${formatNumber(current.averageWaterLevelM, 2)} m`,
      detail: `${formatSigned(current.waterLevelChangeM, 2, " m")} vs last hour`,
      tone: current.waterLevelChangeM >= 0 ? "risk-high" : "risk-low",
      icon: "WL",
    },
    {
      label: "Attenuation tank",
      value: `${current.tankCapacityPercent}%`,
      detail: "Capacity used",
      tone: current.tankCapacityPercent >= 80 ? "risk-high" : "risk-medium",
      icon: "TK",
    },
    {
      label: "Pump station",
      value: `${current.pumpsActive} / ${current.pumpsTotal}`,
      detail: "Pumps active",
      tone: current.pumpsActive > 0 ? "risk-low" : "risk-medium",
      icon: "PS",
    },
    {
      label: "Affected area",
      value: `${formatNumber(current.affectedAreaHa, 1)} ha`,
      detail: "Estimated",
      tone: current.affectedAreaHa >= 14 ? "risk-high" : "risk-medium",
      icon: "HA",
    },
  ];

  return cards.map((card) => `
    <article class="kpi-card ${card.tone}">
      <div class="kpi-icon">${card.icon}</div>
      <div>
        <span>${card.label}</span>
        <strong>${card.value}</strong>
        <small>${card.detail}</small>
      </div>
    </article>
  `).join("");
}
