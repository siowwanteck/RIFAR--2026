const actionStatuses = new Map();

const timeline = [
  { key: "NOW", label: "NOW", hours: 0, riskScore: 72, riskLevel: "HIGH", depth: 0.32, tank: 62 },
  { key: "30M", label: "+30m", hours: 0.5, riskScore: 75, riskLevel: "HIGH", depth: 0.34, tank: 65 },
  { key: "1H", label: "+1h", hours: 1, riskScore: 78, riskLevel: "HIGH", depth: 0.36, tank: 68 },
  { key: "3H", label: "+3h", hours: 3, riskScore: 82, riskLevel: "HIGH", depth: 0.4, tank: 74 },
  { key: "6H", label: "+6h", hours: 6, riskScore: 89, riskLevel: "CRITICAL", depth: 0.46, tank: 83 },
  { key: "12H", label: "+12h", hours: 12, riskScore: 94, riskLevel: "CRITICAL", depth: 0.58, tank: 91 },
  { key: "24H", label: "+24h", hours: 24, riskScore: 98, riskLevel: "CRITICAL", depth: 0.72, tank: 96 },
  { key: "48H", label: "+48h", hours: 48, riskScore: 67, riskLevel: "MEDIUM", depth: 0.28, tank: 54 },
];

const recommendations = [
  {
    id: "act-ps2",
    title: "Activate Pump PS2",
    reason: "Predicted tank capacity exceeds 80% within 3 hours.",
    priority: "HIGH",
    asset: "Pump Station PS2",
    expectedImpact: "Reduce Main Drain level by 0.18 m before peak risk.",
    requiresConfirmation: true,
  },
  {
    id: "prep-ps3",
    title: "Prepare Pump PS3",
    reason: "Standby support is needed if rainfall remains above 18 mm/hr.",
    priority: "MEDIUM",
    asset: "Pump Station PS3",
    expectedImpact: "Shorten response time if PS2 is insufficient.",
    requiresConfirmation: true,
  },
  {
    id: "gate-tg2",
    title: "Close Tidal Gate TG2 if needed",
    reason: "Prevent backflow from Sungai Rasau during the next tide rise.",
    priority: "MEDIUM",
    asset: "Tidal Gate TG2",
    expectedImpact: "Protect low-lying road sections near the river edge.",
    requiresConfirmation: true,
  },
  {
    id: "watch-lowlands",
    title: "Monitor Low-Lying Area",
    reason: "Seksyen 25 and Seksyen 26 are forecast to flood first.",
    priority: "LOW",
    asset: "Taman Sri Muda Seksyen 25-26",
    expectedImpact: "Support early council and community alert decisions.",
    requiresConfirmation: false,
  },
];

const affectedAreas = [
  { area: "Seksyen 25", estimatedDepth: 0.45, riskLevel: "HIGH", eta: "6 - 12 h" },
  { area: "Seksyen 26", estimatedDepth: 0.35, riskLevel: "HIGH", eta: "8 - 14 h" },
  { area: "Seksyen 27", estimatedDepth: 0.3, riskLevel: "MEDIUM", eta: "12 - 18 h" },
  { area: "Persiaran Sri Muda", estimatedDepth: 0.25, riskLevel: "MEDIUM", eta: "12 - 18 h" },
  { area: "Jalan Murni 25/123", estimatedDepth: 0.2, riskLevel: "LOW", eta: "18 - 24 h" },
];

const sensors = [
  { id: "RG1", type: "Rain Gauge", status: "ONLINE", location: "Taman Sri Muda", value: "18.6 mm/hr", trend: "rising" },
  { id: "WL1", type: "Water Level", status: "ONLINE", location: "Main Drain", value: "2.35 m", trend: "rising" },
  { id: "WL2", type: "Water Level", status: "ONLINE", location: "Drain Sg. Rasau", value: "1.42 m", trend: "rising" },
  { id: "TL1", type: "Tank Level", status: "ONLINE", location: "Attenuation Tank A", value: "62%", trend: "rising" },
  { id: "PS2", type: "Pump Station", status: "ONLINE", location: "Pump House 2", value: "Active (2/3)", trend: "stable" },
  { id: "TG1", type: "Tidal Gate", status: "ONLINE", location: "Sg. Rasau Gate 1", value: "Open", trend: "stable" },
];

const assets = [
  { id: "asset-ps2", name: "Pump Station PS2", type: "pump", status: "OPEN", x: 32, y: 42, value: "Open" },
  { id: "asset-tank-a", name: "Attenuation Tank A", type: "tank", status: "WARNING", x: 67, y: 31, value: "62%" },
  { id: "asset-tg1", name: "Tidal Gate TG1", type: "gate", status: "ACTIVE", x: 78, y: 47, value: "Active" },
  { id: "asset-main-drain", name: "Main Drain", type: "drain", status: "HIGH", x: 51, y: 62, value: "2.35 m" },
  { id: "asset-lake", name: "Sri Muda Lake", type: "waterbody", status: "OBSERVED", x: 44, y: 29, value: "Observed" },
];

const alerts = [
  { id: "alert-risk", severity: "CRITICAL", title: "Peak flood risk forecast", detail: "Critical risk expected in 22 hours.", time: "10:22 AM" },
  { id: "alert-rain", severity: "HIGH", title: "Rainfall intensity increasing", detail: "Rain gauge RG1 is up 24% versus last hour.", time: "10:14 AM" },
  { id: "alert-tank", severity: "MEDIUM", title: "Tank capacity watch", detail: "Attenuation Tank A may exceed 80% within 3 hours.", time: "10:08 AM" },
];

function floodOverlayFor(point) {
  const base = [
    { id: "zone-25", name: "Seksyen 25", depth: Math.max(0.2, point.depth), x: 30, y: 52, width: 31, height: 18 },
    { id: "main-drain", name: "Main Drain corridor", depth: Math.max(0.25, point.depth + 0.08), x: 44, y: 46, width: 35, height: 12 },
  ];

  if (point.hours >= 6) {
    base.push({ id: "zone-26", name: "Seksyen 26", depth: point.depth + 0.04, x: 58, y: 58, width: 24, height: 17 });
  }

  if (point.hours >= 12) {
    base.push({ id: "persiaran", name: "Persiaran Sri Muda", depth: point.depth + 0.02, x: 20, y: 69, width: 48, height: 9 });
  }

  if (point.hours >= 24) {
    base.push({ id: "low-east", name: "Eastern lowlands", depth: point.depth + 0.1, x: 70, y: 63, width: 18, height: 18 });
  }

  return base;
}

function affectedRoadsFor(point) {
  const roads = ["Jalan Murni 25/123"];
  if (point.hours >= 6) roads.push("Jalan Kebun");
  if (point.hours >= 12) roads.push("Persiaran Sri Muda");
  if (point.hours >= 24) roads.push("Jalan Bukit Kemuning");
  return roads;
}

export function buildDashboardState() {
  const scenarios = timeline.map((point) => ({
    ...point,
    floodOverlay: floodOverlayFor(point),
    affectedRoads: affectedRoadsFor(point),
    pumpRecommendation: point.hours >= 3 ? "Activate Pump PS2" : "Prepare Pump PS2",
  }));

  return {
    generatedAt: new Date().toISOString(),
    current: {
      location: "Taman Sri Muda, Selangor",
      status: "LIVE",
      weather: { temperatureC: 27, condition: "Light Rain" },
      riskLevel: "HIGH",
      riskTrend: "Increasing",
      rainfallMmPerHour: 18.6,
      rainfallChangePercent: 24,
      averageWaterLevelM: 2.35,
      waterLevelChangeM: 0.28,
      tankCapacityPercent: 62,
      pumpsActive: 2,
      pumpsTotal: 3,
      affectedAreaHa: 12.4,
    },
    forecast: {
      timeline,
      peak: {
        riskLevel: "CRITICAL",
        hoursFromNow: 22,
        confidencePercent: 87,
        expectedAt: "08:30 AM tomorrow",
      },
    },
    digitalTwin: {
      mapCenter: { lat: 3.0299, lng: 101.5415 },
      mode: "PREDICTION",
      scenarios,
      assets,
      layers: ["Water depth", "Sensor locations", "Pump stations", "Attenuation tanks", "Tidal gates", "Affected roads"],
    },
    recommendations: recommendations.map((item) => ({
      ...item,
      status: actionStatuses.get(item.id) ?? "pending",
    })),
    affectedAreas,
    sensors,
    assets,
    alerts,
    systemStatus: {
      sources: [
        { name: "IoT Sensors", status: "OPERATIONAL" },
        { name: "Weather API", status: "OPERATIONAL" },
        { name: "River Level API", status: "OPERATIONAL" },
        { name: "Tidal API", status: "OPERATIONAL" },
      ],
      model: {
        accuracy7Day: 92.4,
        precision: 90.1,
        recall: 91.3,
        lastTrained: "5 May 2025",
      },
    },
  };
}

export function getActionStatus(actionId) {
  const exists = recommendations.some((item) => item.id === actionId);
  if (!exists) return "unknown";
  return actionStatuses.get(actionId) ?? "pending";
}

export function confirmAction(actionId) {
  const action = recommendations.find((item) => item.id === actionId);
  if (!action) {
    return { status: "not_found", message: `No recommendation found for ${actionId}.` };
  }

  actionStatuses.set(actionId, "confirmed");

  return {
    id: action.id,
    title: action.title,
    status: "confirmed",
    message: `Operator confirmed ${action.title}. FIaaS records the decision but does not control real infrastructure in the MVP.`,
  };
}

export function getApiPayload(pathname) {
  const state = buildDashboardState();

  const routes = {
    "/api/flood/current": state.current,
    "/api/flood/forecast": state.forecast,
    "/api/flood/risk": { riskLevel: state.current.riskLevel, trend: state.current.riskTrend, score: timeline[0].riskScore },
    "/api/flood/digital-twin": state.digitalTwin,
    "/api/flood/recommendations": state.recommendations,
    "/api/flood/affected-areas": state.affectedAreas,
    "/api/flood/sensors": state.sensors,
    "/api/flood/assets": state.assets,
    "/api/flood/alerts": state.alerts,
    "/api/flood/system-status": state.systemStatus,
    "/api/flood/dashboard": state,
  };

  return routes[pathname];
}
