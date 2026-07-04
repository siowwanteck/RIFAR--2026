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
    this.mode = null;
    this.leafletMap = null;
    this.maplibreMap = null;
    this.markerLayer = null;
    this.overlayLayer = null;
    this.pendingLayers = null;
  }

  mount(layers, mode = "2d") {
    this.switchMode(mode, layers);
  }

  switchMode(mode, layers) {
    if (this.mode === mode && (this.leafletMap || this.maplibreMap)) {
      this.update(layers);
      return;
    }

    this.destroy();
    this.mode = mode;

    if (mode === "3d") {
      this.mountMapLibre(layers);
    } else {
      this.mountLeaflet(layers);
    }
  }

  mountLeaflet(layers) {
    const container = resetContainer(this.containerId, "leaflet-map");
    if (!window.L) {
      container.innerHTML = "<div class='map-unavailable'>Leaflet unavailable. Check map library loading.</div>";
      return;
    }

    this.leafletMap = window.L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([layers.mapCenter.lat, layers.mapCenter.lng], 14);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "OpenStreetMap",
    }).addTo(this.leafletMap);

    window.L.control.zoom({ position: "bottomright" }).addTo(this.leafletMap);
    this.markerLayer = window.L.layerGroup().addTo(this.leafletMap);
    this.overlayLayer = window.L.layerGroup().addTo(this.leafletMap);
    this.update(layers);
  }

  mountMapLibre(layers) {
    const container = resetContainer(this.containerId, "maplibre-map");
    if (!window.maplibregl) {
      container.innerHTML = "<div class='map-unavailable'>MapLibre unavailable. Check local dependency loading.</div>";
      return;
    }

    this.pendingLayers = layers;
    this.maplibreMap = new window.maplibregl.Map({
      container,
      style: "https://demotiles.maplibre.org/style.json",
      center: [layers.mapCenter.lng, layers.mapCenter.lat],
      zoom: 13.8,
      pitch: 60,
      bearing: -20,
      attributionControl: false,
    });

    this.maplibreMap.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    this.maplibreMap.on("load", () => this.update(this.pendingLayers));
  }

  update(layers) {
    this.pendingLayers = layers;
    if (this.mode === "3d") {
      this.updateMapLibre(layers);
    } else {
      this.updateLeaflet(layers);
    }
  }

  updateLeaflet(layers) {
    if (!this.leafletMap) return;

    this.markerLayer.clearLayers();
    this.overlayLayer.clearLayers();

    layers.floodOverlays.forEach((zone) => {
      const color = riskColors[zone.riskLevel] ?? riskColors.MEDIUM;
      const latLngs = zone.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      window.L.polygon(latLngs, {
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
        html: `<i data-lucide="${markerIcon(marker.type)}"></i>`,
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

    createLucideIcons();
  }

  updateMapLibre(layers) {
    if (!this.maplibreMap || !this.maplibreMap.loaded()) return;

    const floodData = {
      type: "FeatureCollection",
      features: layers.floodOverlays.map((zone) => ({
        type: "Feature",
        properties: {
          id: zone.id,
          name: zone.name,
          riskLevel: zone.riskLevel,
          depthM: zone.depthM,
          opacity: zone.opacity,
          color: riskColors[zone.riskLevel] ?? riskColors.MEDIUM,
          height: Math.max(2, zone.depthM * 18),
        },
        geometry: zone.geometry,
      })),
    };

    const markerData = {
      type: "FeatureCollection",
      features: layers.markers.map((marker) => ({
        type: "Feature",
        properties: {
          id: marker.id,
          name: marker.name,
          type: marker.type,
          status: marker.status,
          value: marker.value,
        },
        geometry: {
          type: "Point",
          coordinates: [marker.lng, marker.lat],
        },
      })),
    };

    upsertGeoJsonSource(this.maplibreMap, "flood-polygons", floodData);
    upsertGeoJsonSource(this.maplibreMap, "asset-markers", markerData);

    if (!this.maplibreMap.getLayer("flood-fill")) {
      this.maplibreMap.addLayer({
        id: "flood-fill",
        type: "fill",
        source: "flood-polygons",
        paint: {
          "fill-color": ["get", "color"],
          "fill-opacity": ["get", "opacity"],
        },
      });
    }

    if (!this.maplibreMap.getLayer("flood-extrusion")) {
      this.maplibreMap.addLayer({
        id: "flood-extrusion",
        type: "fill-extrusion",
        source: "flood-polygons",
        paint: {
          "fill-extrusion-color": ["get", "color"],
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": 0.42,
        },
      });
    }

    if (!this.maplibreMap.getLayer("asset-circles")) {
      this.maplibreMap.addLayer({
        id: "asset-circles",
        type: "circle",
        source: "asset-markers",
        paint: {
          "circle-radius": 7,
          "circle-color": "#06111c",
          "circle-stroke-color": "#6dd7ff",
          "circle-stroke-width": 2,
        },
      });
    }

    if (!this.maplibreMap.getLayer("asset-labels")) {
      this.maplibreMap.addLayer({
        id: "asset-labels",
        type: "symbol",
        source: "asset-markers",
        layout: {
          "text-field": ["concat", ["get", "name"], "\n", ["get", "value"]],
          "text-size": 11,
          "text-offset": [0, 1.3],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#edf6ff",
          "text-halo-color": "#06111c",
          "text-halo-width": 1.5,
        },
      });
    }

    this.maplibreMap.easeTo({
      center: [layers.mapCenter.lng, layers.mapCenter.lat],
      zoom: 13.8,
      pitch: 60,
      bearing: -20,
      duration: 500,
    });
  }

  destroy() {
    if (this.leafletMap) {
      this.leafletMap.remove();
      this.leafletMap = null;
    }
    if (this.maplibreMap) {
      this.maplibreMap.remove();
      this.maplibreMap = null;
    }
    this.markerLayer = null;
    this.overlayLayer = null;
  }
}

function upsertGeoJsonSource(map, sourceId, data) {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(sourceId, { type: "geojson", data });
}

function resetContainer(containerId, className) {
  const shell = document.getElementById(containerId);
  shell.innerHTML = "";
  const container = document.createElement("div");
  container.className = className;
  shell.append(container);
  return container;
}

function markerIcon(type) {
  if (type === "pump") return "power";
  if (type === "tank") return "gauge";
  if (type === "gate") return "git-branch";
  if (type === "sensor") return "radio-tower";
  if (type === "drain") return "waves";
  return "map-pin";
}

function createLucideIcons() {
  window.lucide?.createIcons?.({
    attrs: {
      width: 17,
      height: 17,
      "stroke-width": 2,
    },
  });
}
