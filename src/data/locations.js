const originalCenter = { lat: 3.0248, lng: 101.5371 };
const targetCenter = { lat: 3.032111111111111, lng: 101.52705555555555 };
const latShift = targetCenter.lat - originalCenter.lat;
const lngShift = targetCenter.lng - originalCenter.lng;

export const tamanSriMuda = {
  name: "Taman Sri Muda Pilot Site, Shah Alam",
  label: "Taman Sri Muda pilot: Jalan Srikandi 25/14",
  center: targetCenter,
  bounds: [
    shiftLatLng([3.0168, 101.5302]),
    shiftLatLng([3.0336, 101.5452]),
  ],
};

export const mapMarkers = [
  {
    id: "IoT sensor",
    name: "IoT Sensor",
    type: "sensor",
    lat: 3.0301,
    lng: 101.5396,
    tooltip: "Rainfall, water level, and local drainage monitoring.",
    labelDirection: "top",
    labelOffset: [0, -12],
  },
  shiftMarker({
    id: "tank-4000",
    name: "Underground Attenuation Tank",
    type: "tank",
    lat: 3.030714,
    lng: 101.5274,
    tooltip: "Storage below the open green attenuation zone.",
    labelDirection: "top",
    labelOffset: [0, -16],
  }),
  shiftMarker({
    id: "outflow-pump",
    name: "Pump Station",
    type: "pump",
    lat: 3.030253,
    lng: 101.527528,
    tooltip: "Pumps stored runoff toward the tidal gate when downstream conditions are safe.",
    labelDirection: "bottom",
    labelOffset: [0, 16],
  }),
  shiftMarker({
    id: "tidal-gate",
    name: "Tidal Gate",
    type: "gate",
    lat: 3.029803,
    lng: 101.525822,
    tooltip: "Backflow control at the lower-left drainage outlet beside Klang River.",
    labelDirection: "left",
    labelOffset: [-14, 0],
  }),
  shiftMarker({
    id: "bioswale-field",
    name: "Bioswale / Green Drainage Strip",
    type: "bioswale",
    lat: 3.029857,
    lng: 101.527443,
    tooltip: "Green drainage strip feeding the attenuation tank zone.",
  }),
];

export const affectedZones = [
  shiftZone({
    id: "jalan-teladan",
    name: "Jalan Teladan 25/22",
    lat: 3.0264,
    lng: 101.5373,
    riskBias: 1.03,
    shape: [
      [-0.0022, -0.00028],
      [-0.0015, -0.0006],
      [0.0019, -0.0005],
      [0.0024, 0.00005],
      [0.0013, 0.00055],
      [-0.0019, 0.00048],
    ],
  }),
  shiftZone({
    id: "jalan-nyaman",
    name: "Jalan Nyaman 25/20",
    lat: 3.0235,
    lng: 101.5362,
    riskBias: 1.12,
    shape: [
      [-0.0021, -0.00035],
      [-0.0013, -0.00075],
      [0.0022, -0.00055],
      [0.0025, 0.0002],
      [0.0012, 0.00064],
      [-0.0020, 0.00048],
    ],
  }),
  shiftZone({
    id: "jalan-bakti",
    name: "Jalan Bakti 25/15",
    lat: 3.022,
    lng: 101.5348,
    riskBias: 1,
    shape: [
      [-0.00055, -0.0025],
      [-0.00015, -0.0020],
      [0.00035, 0.0022],
      [0.00005, 0.0027],
      [-0.00065, 0.0021],
      [-0.0009, -0.0018],
    ],
  }),
  shiftZone({
    id: "field-tank-zone",
    name: "Existing field / attenuation tank zone",
    lat: 3.0208,
    lng: 101.5364,
    riskBias: 1.22,
    shape: [
      [-0.00125, -0.00105],
      [0.00145, -0.00095],
      [0.00155, 0.00105],
      [0.00055, 0.00155],
      [-0.00135, 0.0012],
      [-0.00155, -0.00045],
    ],
  }),
  shiftZone({
    id: "tidal-gate-outlet",
    name: "Tidal gate outlet",
    lat: 3.0192,
    lng: 101.5334,
    riskBias: 0.94,
    shape: [
      [-0.001, -0.0005],
      [0.0009, -0.0006],
      [0.00125, 0.00005],
      [0.00075, 0.0007],
      [-0.0011, 0.00055],
      [-0.00135, -0.00008],
    ],
  }),
];

export const hydraulicCorridors = [
  shiftLine({
    id: "klang-river",
    name: "Klang River downstream corridor",
    type: "river",
    coordinates: [
      [101.5321, 3.0184],
      [101.5325, 3.0214],
      [101.5334, 3.0256],
      [101.5342, 3.0293],
      [101.5357, 3.0326],
    ],
  }),
  shiftLine({
    id: "e13-corridor",
    name: "E13 road corridor",
    type: "road",
    coordinates: [
      [101.532, 3.0175],
      [101.5323, 3.0204],
      [101.5326, 3.0246],
      [101.5329, 3.0298],
      [101.533, 3.0331],
    ],
  }),
];

export const hydraulicFlowPaths = [
  shiftLine({
    id: "residential-runoff",
    name: "Residential drains -> tank -> pump -> outlet",
    type: "runoff",
    coordinates: [
      [101.5396, 3.0301],
      [101.5373, 3.0264],
      [101.5362, 3.0235],
      [101.5367, 3.0209],
      [101.5366, 3.0189],
      [101.5328, 3.0192],
    ],
  }),
  shiftLine({
    id: "river-backflow-risk",
    name: "High tide / river backflow risk",
    type: "backflow",
    coordinates: [
      [101.532, 3.0188],
      [101.5328, 3.0192],
      [101.5348, 3.0202],
      [101.5364, 3.0208],
    ],
  }),
];

function shiftMarker(marker) {
  return {
    ...marker,
    lat: round(marker.lat + latShift),
    lng: round(marker.lng + lngShift),
  };
}

function shiftZone(zone) {
  return {
    ...zone,
    lat: round(zone.lat + latShift),
    lng: round(zone.lng + lngShift),
  };
}

function shiftLine(line) {
  return {
    ...line,
    coordinates: line.coordinates.map(([lng, lat]) => [
      round(lng + lngShift),
      round(lat + latShift),
    ]),
  };
}

function shiftLatLng([lat, lng]) {
  return [round(lat + latShift), round(lng + lngShift)];
}

function round(value) {
  return Number(value.toFixed(6));
}
