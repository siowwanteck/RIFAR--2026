import { riskClass } from "../../utils/formatters.js";

const riskColors = {
  LOW: "#24d17e",
  MEDIUM: "#f2a93b",
  HIGH: "#ff5a50",
  CRITICAL: "#8257ff",
};

export class LeafletDigitalTwin {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.markerLayer = null;
    this.overlayLayer = null;
  }

  mount(layers) {
    if (!window.L) {
      document.getElementById(this.containerId).innerHTML = "<div class='map-unavailable'>Map library unavailable. Check network access for Leaflet.</div>";
      return;
    }

    this.map = window.L.map(this.containerId, {
      zoomControl: false,
      attributionControl: false,
    }).setView([layers.mapCenter.lat, layers.mapCenter.lng], 14);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "OpenStreetMap",
    }).addTo(this.map);

    window.L.control.zoom({ position: "bottomright" }).addTo(this.map);
    this.markerLayer = window.L.layerGroup().addTo(this.map);
    this.overlayLayer = window.L.layerGroup().addTo(this.map);
    this.update(layers);
  }

  update(layers) {
    if (!this.map) return;

    this.markerLayer.clearLayers();
    this.overlayLayer.clearLayers();

    layers.floodOverlays.forEach((zone) => {
      const color = riskColors[zone.riskLevel] ?? riskColors.MEDIUM;
      window.L.circle([zone.lat, zone.lng], {
        radius: zone.radiusM,
        stroke: true,
        color,
        weight: 1,
        fillColor: color,
        fillOpacity: zone.opacity,
      })
        .bindTooltip(`${zone.name}: ${zone.depthM.toFixed(2)} m`, { permanent: false })
        .addTo(this.overlayLayer);
    });

    layers.markers.forEach((marker) => {
      const icon = window.L.divIcon({
        className: `fiass-marker ${marker.type} ${riskClass(marker.status)}`,
        html: `<span>${markerIcon(marker.type)}</span>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      window.L.marker([marker.lat, marker.lng], { icon })
        .bindTooltip(`<strong>${marker.name}</strong><br>${marker.value}`, {
          direction: "top",
          offset: [0, -12],
          permanent: ["ps2", "tank-a", "tg1", "wl1"].includes(marker.id),
        })
        .addTo(this.markerLayer);
    });
  }
}

function markerIcon(type) {
  if (type === "pump") return "P";
  if (type === "tank") return "T";
  if (type === "gate") return "G";
  if (type === "sensor") return "S";
  if (type === "drain") return "D";
  return "A";
}
