export function buildRecommendations(state) {
  const ps2Confirmed = state.confirmedActions.includes("act-ps2");
  const ps3Confirmed = state.confirmedActions.includes("prep-ps3");
  const gateConfirmed = state.confirmedActions.includes("gate-tg2");

  return [
    {
      id: "act-ps2",
      title: "Activate Pump PS2",
      reason: state.hydrology.tankCapacityPercent >= 78
        ? "Tank capacity is approaching the warning threshold."
        : "Predicted tank capacity may exceed 80% if rainfall continues.",
      priority: state.risk.score >= 80 ? "CRITICAL" : "HIGH",
      asset: "Pump Station PS2",
      expectedImpact: "Lower main drain pressure over the next simulation cycles.",
      status: ps2Confirmed ? "confirmed" : "pending",
      requiresConfirmation: true,
    },
    {
      id: "prep-ps3",
      title: "Prepare Pump PS3",
      reason: "Keep standby capacity ready if PS2 cannot absorb the inflow.",
      priority: state.weather.rainIntensity >= 26 ? "HIGH" : "MEDIUM",
      asset: "Pump Station PS3",
      expectedImpact: "Improves response time if water level keeps rising.",
      status: ps3Confirmed ? "confirmed" : "pending",
      requiresConfirmation: true,
    },
    {
      id: "gate-tg2",
      title: "Close Tidal Gate TG2 if needed",
      reason: "Tide level can create backflow risk at the river edge.",
      priority: state.weather.tideLevelM >= 1.32 ? "HIGH" : "MEDIUM",
      asset: "Tidal Gate TG2",
      expectedImpact: "Reduces backflow risk for low-lying roads.",
      status: gateConfirmed ? "confirmed" : "pending",
      requiresConfirmation: true,
    },
    {
      id: "watch-lowlands",
      title: "Monitor Low-Lying Area",
      reason: "Seksyen 25 and Seksyen 26 remain the first likely affected areas.",
      priority: state.risk.level === "LOW" ? "LOW" : "MEDIUM",
      asset: "Taman Sri Muda Seksyen 25-26",
      expectedImpact: "Supports early community alert decisions.",
      status: "watching",
      requiresConfirmation: false,
    },
  ];
}
