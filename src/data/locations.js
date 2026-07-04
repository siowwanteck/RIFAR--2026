export const tamanSriMuda = {
  name: "Taman Sri Muda, Shah Alam",
  label: "Taman Sri Muda, Selangor",
  center: { lat: 3.0289, lng: 101.5417 },
  bounds: [
    [3.0174, 101.5298],
    [3.0414, 101.5562],
  ],
};

export const mapMarkers = [
  { id: "main-drain", name: "Main Drain", type: "drain", lat: 3.0307, lng: 101.5424 },
  { id: "section-25", name: "Seksyen 25", type: "area", lat: 3.0254, lng: 101.5368 },
  { id: "section-26", name: "Seksyen 26", type: "area", lat: 3.0218, lng: 101.5442 },
  { id: "section-27", name: "Seksyen 27", type: "area", lat: 3.0345, lng: 101.5487 },
  { id: "tank-a", name: "Attenuation Tank A", type: "tank", lat: 3.0325, lng: 101.5466 },
  { id: "ps2", name: "Pump Station PS2", type: "pump", lat: 3.0284, lng: 101.5362 },
  { id: "ps3", name: "Pump Station PS3", type: "pump", lat: 3.0225, lng: 101.5496 },
  { id: "tg1", name: "Tidal Gate TG1", type: "gate", lat: 3.0303, lng: 101.5524 },
  { id: "wl1", name: "Water Level Sensor WL1", type: "sensor", lat: 3.0298, lng: 101.5412 },
  { id: "rg1", name: "Rain Gauge RG1", type: "sensor", lat: 3.034, lng: 101.538 },
];

export const affectedZones = [
  { id: "zone-25", name: "Seksyen 25", lat: 3.0254, lng: 101.5368, baseRadiusM: 240, riskBias: 1.08 },
  { id: "zone-26", name: "Seksyen 26", lat: 3.0218, lng: 101.5442, baseRadiusM: 210, riskBias: 0.96 },
  { id: "zone-27", name: "Seksyen 27", lat: 3.0345, lng: 101.5487, baseRadiusM: 180, riskBias: 0.72 },
  { id: "persiaran", name: "Persiaran Sri Muda", lat: 3.0293, lng: 101.5334, baseRadiusM: 160, riskBias: 0.64 },
];
