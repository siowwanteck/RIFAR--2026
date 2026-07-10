export function buildRecommendations(state) {
  const pumpConfirmed = state.confirmedActions.includes("act-pump-outflow");
  const gateConfirmed = state.confirmedActions.includes("close-tidal-gate");
  const floodAlertConfirmed = state.confirmedActions.includes("issue-flood-alert");
  const downstreamSafe = !state.infrastructure.tidalGates.outlet.open || state.hydrology.backflowRiskPercent < 58;
  const shouldIssueFloodAlert = state.risk.score >= 84 || state.hydrology.predictedDepthM >= 1;

  const recommendations = [
    {
      id: "act-pump-outflow",
      title: "Activate Pump Station",
      reason: state.hydrology.tankCapacityPercent >= 78
        ? "The 4000 m³ attenuation tank is approaching the warning threshold."
        : "Store runoff first, then pump when downstream river conditions are safe.",
      priority: state.risk.score >= 80 ? "CRITICAL" : "HIGH",
      asset: "Outflow Pump Station",
      expectedImpact: downstreamSafe
        ? "Gradually lowers tank pressure and predicted road depth."
        : "Hold until tidal gate closure or river level reduction makes the outlet safe.",
      status: pumpConfirmed ? "confirmed" : "pending",
      requiresConfirmation: true,
    },
    {
      id: "close-tidal-gate",
      title: "Close Tidal Gate",
      reason: "High Klang River level or tide can push back through the lower-left outlet.",
      priority: state.weather.tideLevelM >= 1.32 ? "HIGH" : "MEDIUM",
      asset: "Tidal / Box Culvert Gate",
      expectedImpact: "Reduces river backflow risk before releasing stored runoff.",
      status: gateConfirmed ? "confirmed" : "pending",
      requiresConfirmation: true,
    },
    ...(shouldIssueFloodAlert
      ? [{
        id: "issue-flood-alert",
        title: "Issue Flood Alert",
        reason: "Projected road flooding and rising runoff now justify a public warning for the pilot-site lowlands.",
        priority: state.risk.score >= 88 ? "CRITICAL" : "HIGH",
        asset: "Community alerting",
        expectedImpact: "Prompts early resident action around Jalan Teladan, Jalan Nyaman, and the field attenuation zone.",
        status: floodAlertConfirmed ? "confirmed" : "pending",
        requiresConfirmation: true,
      }]
      : []),
    {
      id: "watch-lowlands",
      title: "Monitor Pilot-Site Low Points",
      reason: "Jalan Teladan 25/22, Jalan Nyaman 25/20, and the field zone remain the first likely affected areas.",
      priority: state.risk.level === "LOW" ? "LOW" : "MEDIUM",
      asset: "Jalan Teladan / Jalan Nyaman pilot drains",
      expectedImpact: "Supports early community alert decisions.",
      status: "watching",
      requiresConfirmation: false,
    },
  ];

  return recommendations;
}
