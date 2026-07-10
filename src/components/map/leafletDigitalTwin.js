import { riskClass } from "../../utils/formatters.js";
import { mapLibre3dConfig } from "../../data/mapConfig.js";

export class LeafletDigitalTwin {
  constructor(containerId) {
    this.containerId = containerId;
    this.mode = null;
    this.leafletMap = null;
    this.maplibreMap = null;
    this.markerLayer = null;
    this.overlayLayer = null;
    this.pendingLayers = null;
    this.resizeFrame = null;
    this.handleWindowResize = () => this.scheduleResizeSync();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleWindowResize);
    }
  }

  mount(layers, mode = "2d", mapLayerVisibility = { showFloodAreas: true }) {
    this.switchMode(mode, layers, mapLayerVisibility);
  }

  switchMode(mode, layers, mapLayerVisibility = { showFloodAreas: true }) {
    if (this.mode === mode && (this.leafletMap || this.maplibreMap)) {
      this.update(layers, mapLayerVisibility);
      return;
    }

    this.destroy();
    this.mode = mode;

    if (mode === "3d") {
      this.mountMapLibre(layers, mapLayerVisibility);
    } else {
      this.mountLeaflet(layers, mapLayerVisibility);
    }
  }

  mountLeaflet(layers, mapLayerVisibility = { showFloodAreas: true }) {
    const container = resetContainer(this.containerId, "leaflet-map");
    if (!window.L) {
      container.innerHTML = "<div class='map-unavailable'>Leaflet unavailable. Check map library loading.</div>";
      return;
    }

    this.leafletMap = window.L.map(container, {
      zoomControl: false,
      attributionControl: false,
    }).setView([layers.mapCenter.lat, layers.mapCenter.lng], 16.5);

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "OpenStreetMap",
    }).addTo(this.leafletMap);

    window.L.control.zoom({ position: "bottomright" }).addTo(this.leafletMap);
    this.markerLayer = window.L.layerGroup().addTo(this.leafletMap);
    this.overlayLayer = window.L.layerGroup().addTo(this.leafletMap);
    this.update(layers, mapLayerVisibility);
  }

  mountMapLibre(layers, mapLayerVisibility = { showFloodAreas: true }) {
    const container = resetContainer(this.containerId, "maplibre-map");
    if (!window.maplibregl) {
      container.innerHTML = "<div class='map-unavailable'>MapLibre unavailable. Check local dependency loading.</div>";
      return;
    }

    this.pendingLayers = getMapRenderState(layers, mapLayerVisibility);
    this.maplibreMap = new window.maplibregl.Map({
      container,
      style: mapLibre3dConfig.styleUrl,
      center: [layers.mapCenter.lng, layers.mapCenter.lat],
      zoom: mapLibre3dConfig.camera.zoom,
      pitch: mapLibre3dConfig.camera.pitch,
      bearing: mapLibre3dConfig.camera.bearing,
      attributionControl: false,
    });

    this.maplibreMap.addControl(new window.maplibregl.NavigationControl({ visualizePitch: true }), "bottom-right");
    this.maplibreMap.on("load", () => {
      addBuildingExtrusions(this.maplibreMap);
      this.update(this.pendingLayers, mapLayerVisibility);
      this.scheduleResizeSync();
    });
  }

  update(layers, mapLayerVisibility = { showFloodAreas: true }) {
    this.pendingLayers = getMapRenderState(layers, mapLayerVisibility);
    if (this.mode === "3d") {
      this.updateMapLibre(this.pendingLayers, mapLayerVisibility);
    } else {
      this.updateLeaflet(this.pendingLayers);
    }
  }

  updateLeaflet(layers) {
    if (!this.leafletMap) return;

    this.markerLayer.clearLayers();
    this.overlayLayer.clearLayers();

    layers.corridors?.forEach((corridor) => {
      window.L.polyline(toLatLngs(corridor.coordinates), {
        color: lineColor(corridor.type),
        weight: corridor.type === "river" ? 9 : 5,
        opacity: corridor.type === "river" ? 0.36 + corridor.intensity * 0.34 : 0.42,
      })
        .bindTooltip(corridor.name, { permanent: false })
        .addTo(this.overlayLayer);
    });

    layers.floodOverlays.forEach((zone) => {
      const latLngs = zone.geometry.coordinates[0].map(([lng, lat]) => [lat, lng]);
      window.L.polygon(latLngs, leafletFloodStyle(zone, "glow"))
        .addTo(this.overlayLayer);
      window.L.polygon(latLngs, leafletFloodStyle(zone, "core"))
        .addTo(this.overlayLayer);
      window.L.polygon(latLngs, leafletFloodStyle(zone))
        .bindTooltip(`${zone.name}: ${zone.depthM.toFixed(2)} m`, { permanent: false })
        .addTo(this.overlayLayer);
    });

    layers.flowPaths?.forEach((path) => {
      const latLngs = toLatLngs(path.coordinates);
      window.L.polyline(latLngs, {
        color: lineColor(path.type),
        weight: 3,
        opacity: 0.48 + path.intensity * 0.38,
        dashArray: path.type === "backflow" ? "7 7" : "none",
      })
        .bindTooltip(path.name, { permanent: false })
        .addTo(this.overlayLayer);
      addArrowMarker(path, latLngs, this.overlayLayer);
    });

    layers.markers.forEach((marker) => {
      const icon = window.L.divIcon({
        className: `fiass-marker ${marker.type} ${riskClass(marker.status)}`,
        html: `<i data-lucide="${markerIcon(marker.type)}"></i>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      window.L.marker([marker.lat, marker.lng], { icon })
        .bindTooltip(`<strong>${marker.name}</strong><br>${marker.value}${marker.tooltip ? `<br><small>${marker.tooltip}</small>` : ""}`, {
          direction: marker.labelDirection ?? "top",
          offset: marker.labelOffset ?? [0, -12],
          permanent: ["pond-sensor", "tank-4000", "outflow-pump", "tidal-gate"].includes(marker.id),
        })
        .addTo(this.markerLayer);
    });

    createLucideIcons();
    this.scheduleResizeSync();
  }

  updateMapLibre(layers, mapLayerVisibility = { showFloodAreas: true }) {
    if (!this.maplibreMap || !this.maplibreMap.loaded()) return;
    const floodPaint = mapLibreFloodPaint();

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
          color: waterDepthColor(zone.depthM),
          height: Math.max(0.8, round(zone.depthM * floodPaint.extrusionHeightMultiplier, 2)),
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
          iconId: mapLibreMarkerIconId(marker),
        },
        geometry: {
          type: "Point",
          coordinates: [marker.lng, marker.lat],
        },
      })),
    };

    const corridorData = {
      type: "FeatureCollection",
      features: (layers.corridors ?? []).map((corridor) => lineFeature(corridor, {
        color: lineColor(corridor.type),
        width: corridor.type === "river" ? 8 : 4,
        opacity: corridor.type === "river" ? 0.36 + corridor.intensity * 0.34 : 0.42,
      })),
    };

    const flowData = {
      type: "FeatureCollection",
      features: (layers.flowPaths ?? []).map((path) => lineFeature(path, {
        color: lineColor(path.type),
        width: 3,
        opacity: 0.48 + path.intensity * 0.38,
        dash: path.type === "backflow" ? "dashed" : "solid",
      })),
    };

    upsertGeoJsonSource(this.maplibreMap, "hydraulic-corridors", corridorData);
    upsertGeoJsonSource(this.maplibreMap, "flood-polygons", floodData);
    upsertGeoJsonSource(this.maplibreMap, "flow-paths", flowData);
    upsertGeoJsonSource(this.maplibreMap, "asset-markers", markerData);
    ensureMapLibreMarkerIcons(this.maplibreMap, layers.markers);

    if (!this.maplibreMap.getLayer("hydraulic-corridors-line")) {
      this.maplibreMap.addLayer({
        id: "hydraulic-corridors-line",
        type: "line",
        source: "hydraulic-corridors",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": ["get", "opacity"],
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    if (!this.maplibreMap.getLayer("flood-fill")) {
      this.maplibreMap.addLayer({
        id: "flood-fill",
        type: "fill",
        source: "flood-polygons",
        paint: {
          "fill-color": floodPaint.fillColor,
          "fill-opacity": floodPaint.fillOpacity,
          "fill-outline-color": floodPaint.fillOutlineColor,
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    if (!this.maplibreMap.getLayer("flood-outline")) {
      this.maplibreMap.addLayer({
        id: "flood-outline",
        type: "line",
        source: "flood-polygons",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#94e5ff",
          "line-width": 1.2,
          "line-opacity": 0.34,
          "line-blur": 1.8,
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    if (!this.maplibreMap.getLayer("flow-path-lines")) {
      this.maplibreMap.addLayer({
        id: "flow-path-lines",
        type: "line",
        source: "flow-paths",
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": ["get", "color"],
          "line-width": ["get", "width"],
          "line-opacity": ["get", "opacity"],
          "line-dasharray": ["case", ["==", ["get", "dash"], "dashed"], ["literal", [1.2, 1.2]], ["literal", [1, 0]]],
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    if (!this.maplibreMap.getLayer("flow-path-arrows")) {
      this.maplibreMap.addLayer({
        id: "flow-path-arrows",
        type: "symbol",
        source: "flow-paths",
        layout: {
          "symbol-placement": "line",
          "symbol-spacing": 88,
          "text-field": "->",
          "text-size": 18,
          "text-keep-upright": false,
        },
        paint: {
          "text-color": ["get", "color"],
          "text-halo-color": "#06111c",
          "text-halo-width": 1,
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    if (!this.maplibreMap.getLayer("flood-extrusion")) {
      this.maplibreMap.addLayer({
        id: "flood-extrusion",
        type: "fill-extrusion",
        source: "flood-polygons",
        paint: {
          "fill-extrusion-color": floodPaint.extrusionColor,
          "fill-extrusion-height": ["get", "height"],
          "fill-extrusion-base": 0,
          "fill-extrusion-opacity": floodPaint.extrusionOpacity,
        },
      }, firstSymbolLayerId(this.maplibreMap));
    }

    setLayerVisibility(this.maplibreMap, "flood-fill", floodLayerVisibility(mapLayerVisibility.showFloodAreas));
    setLayerVisibility(this.maplibreMap, "flood-outline", floodLayerVisibility(mapLayerVisibility.showFloodAreas));
    setLayerVisibility(this.maplibreMap, "flood-extrusion", floodLayerVisibility(mapLayerVisibility.showFloodAreas));

    if (!this.maplibreMap.getLayer("asset-icons")) {
      this.maplibreMap.addLayer({
        id: "asset-icons",
        type: "symbol",
        source: "asset-markers",
        layout: {
          "icon-image": ["get", "iconId"],
          "icon-size": 1,
          "icon-allow-overlap": true,
          "icon-anchor": "center",
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
          "text-offset": [0, 2.2],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#edf6ff",
          "text-halo-color": "#06111c",
          "text-halo-width": 1.5,
        },
      });
    }
    this.scheduleResizeSync();
  }

  destroy() {
    if (this.resizeFrame) {
      window.cancelAnimationFrame(this.resizeFrame);
      this.resizeFrame = null;
    }
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

  scheduleResizeSync() {
    if (typeof window === "undefined") return;
    if (this.resizeFrame) {
      window.cancelAnimationFrame(this.resizeFrame);
    }

    this.resizeFrame = window.requestAnimationFrame(() => {
      this.resizeFrame = null;
      if (this.leafletMap) {
        this.leafletMap.invalidateSize();
      }
      if (this.maplibreMap) {
        this.maplibreMap.resize();
      }
    });
  }
}

export function getMapRenderState(layers, mapLayerVisibility = { showFloodAreas: true }) {
  return {
    ...layers,
    floodOverlays: mapLayerVisibility.showFloodAreas ? layers.floodOverlays : [],
  };
}

export function getMapFitBounds(layers) {
  const coordinates = [];

  if (Array.isArray(layers.bounds)) {
    layers.bounds.forEach((point) => {
      if (Array.isArray(point) && point.length === 2) {
        coordinates.push(point);
      }
    });
  }

  (layers.markers ?? []).forEach((marker) => {
    coordinates.push([marker.lat, marker.lng]);
  });

  (layers.floodOverlays ?? []).forEach((overlay) => {
    overlay.geometry?.coordinates?.[0]?.forEach(([lng, lat]) => {
      coordinates.push([lat, lng]);
    });
  });

  if (!coordinates.length) {
    const { lat, lng } = layers.mapCenter;
    return [
      [lat - 0.002, lng - 0.002],
      [lat + 0.002, lng + 0.002],
    ];
  }

  const latitudes = coordinates.map(([lat]) => lat);
  const longitudes = coordinates.map(([, lng]) => lng);

  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
}

export function floodLayerVisibility(showFloodAreas) {
  return showFloodAreas ? "visible" : "none";
}

export function leafletFloodStyle(zone, variant = "sheet") {
  const fillColor = variant === "core" ? "#dff9ff" : waterDepthColor(zone.depthM);
  const baseOpacity = Math.min(0.44, zone.opacity + 0.06);

  if (variant === "glow") {
    return {
      stroke: false,
      fillColor,
      fillOpacity: Math.min(0.18, baseOpacity * 0.42),
      fillRule: "evenodd",
      className: "leaflet-flood-glow",
      interactive: false,
    };
  }

  if (variant === "core") {
    return {
      stroke: false,
      fillColor,
      fillOpacity: Math.min(0.11, baseOpacity * 0.28),
      fillRule: "evenodd",
      className: "leaflet-flood-core",
      interactive: false,
    };
  }

  return {
    stroke: false,
    fillColor,
    fillOpacity: baseOpacity,
    fillRule: "evenodd",
    className: "leaflet-flood-sheet",
  };
}

export function mapLibreFloodPaint() {
  return {
    fillColor: ["get", "color"],
    fillOpacity: ["+", ["get", "opacity"], 0.05],
    fillOutlineColor: "rgba(0,0,0,0)",
    extrusionColor: ["get", "color"],
    extrusionOpacity: 0.14,
    extrusionHeightMultiplier: 6.5,
  };
}

function upsertGeoJsonSource(map, sourceId, data) {
  const source = map.getSource(sourceId);
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(sourceId, { type: "geojson", data });
}

function setLayerVisibility(map, layerId, visibility) {
  if (!map.getLayer(layerId)) return;
  map.setLayoutProperty(layerId, "visibility", visibility);
}

function round(value, digits) {
  return Number(value.toFixed(digits));
}

function lineFeature(line, properties) {
  return {
    type: "Feature",
    properties: {
      id: line.id,
      name: line.name,
      type: line.type,
      ...properties,
    },
    geometry: {
      type: "LineString",
      coordinates: line.coordinates,
    },
  };
}

function toLatLngs(coordinates) {
  return coordinates.map(([lng, lat]) => [lat, lng]);
}

function addArrowMarker(path, latLngs, layer) {
  const middle = latLngs[Math.floor(latLngs.length / 2)];
  const icon = window.L.divIcon({
    className: `flow-arrow ${path.type}`,
    html: "->",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  window.L.marker(middle, { icon, interactive: false }).addTo(layer);
}

function lineColor(type) {
  if (type === "river" || type === "backflow") return "#6dd7ff";
  if (type === "road") return "#f2d06b";
  return "#28d17c";
}

function waterDepthColor(depthM) {
  if (depthM > 2.6) return "#7c4dff";
  if (depthM > 1.6) return "#3157d8";
  if (depthM > 0.8) return "#168fff";
  if (depthM > 0.25) return "#20bce8";
  return "#9bdff0";
}

function addBuildingExtrusions(map) {
  const style = map.getStyle();
  const sourceId = mapLibre3dConfig.vectorSourceCandidates.find((candidate) => style.sources?.[candidate]?.type === "vector");
  const beforeId = firstSymbolLayerId(map);

  if (!sourceId || map.getLayer(mapLibre3dConfig.buildingLayers[0].id)) return;

  // Open-source styles vary by region and tile schema; this layer appears when OpenMapTiles building data is available.
  map.addLayer({
    id: mapLibre3dConfig.buildingLayers[0].id,
    type: "fill-extrusion",
    source: sourceId,
    "source-layer": mapLibre3dConfig.buildingLayers[0].sourceLayer,
    minzoom: 13,
    paint: {
      "fill-extrusion-color": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        "#19334a",
        16,
        "#3f6681",
      ],
      "fill-extrusion-height": [
        "interpolate",
        ["linear"],
        ["zoom"],
        13,
        0,
        15,
        ["coalesce", ["to-number", ["get", "render_height"]], ["to-number", ["get", "height"]], 18],
      ],
      "fill-extrusion-base": ["coalesce", ["to-number", ["get", "render_min_height"]], 0],
      "fill-extrusion-opacity": 0.55,
    },
  }, beforeId);
}

function firstSymbolLayerId(map) {
  return map.getStyle().layers?.find((layer) => layer.type === "symbol")?.id;
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
  if (type === "drain" || type === "river") return "waves";
  if (type === "bioswale") return "leaf";
  return "map-pin";
}

function mapLibreMarkerIconId(marker) {
  return `asset-${marker.type}-${markerTone(marker.status)}`;
}

function ensureMapLibreMarkerIcons(map, markers) {
  const seen = new Set();

  markers.forEach((marker) => {
    const iconId = mapLibreMarkerIconId(marker);
    if (seen.has(iconId) || map.hasImage(iconId)) return;
    seen.add(iconId);
    addMapLibreMarkerIcon(map, iconId, marker.type, markerTone(marker.status));
  });
}

function addMapLibreMarkerIcon(map, iconId, type, tone) {
  const image = new Image(40, 40);
  image.onload = () => {
    if (!map.hasImage(iconId)) {
      map.addImage(iconId, image, { pixelRatio: 2 });
    }
  };
  image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(mapLibreMarkerSvg(type, tone))}`;
}

function markerTone(status) {
  if (status === "ACTIVE" || status === "OPERATIONAL") return "green";
  if (status === "WARNING" || status === "WATCH") return "orange";
  if (status === "HIGH" || status === "CRITICAL" || status === "ALERT") return "red";
  return "cyan";
}

function mapLibreMarkerSvg(type, tone) {
  const accent = markerToneColor(tone);
  const glyph = infrastructureGlyph(type);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
      <defs>
        <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.4" flood-color="${accent}" flood-opacity="0.45"/>
        </filter>
      </defs>
      <circle cx="20" cy="20" r="15.5" fill="#071521" stroke="${accent}" stroke-width="2.4" filter="url(#glow)"/>
      <circle cx="20" cy="20" r="12.5" fill="rgba(11,31,46,0.94)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
      ${glyph.replaceAll("__ACCENT__", accent)}
    </svg>
  `.trim();
}

function markerToneColor(tone) {
  if (tone === "green") return "#2bd67b";
  if (tone === "orange") return "#ffb347";
  if (tone === "red") return "#ff6b6b";
  return "#6dd7ff";
}

function infrastructureGlyph(type) {
  if (type === "pump") {
    return `
      <rect x="11" y="16" width="10" height="8" rx="2" fill="none" stroke="__ACCENT__" stroke-width="2"/>
      <path d="M21 20h6.5a3.5 3.5 0 1 1 0 7H25" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
      <path d="M14 14v-2.5m4 2.5v-2.5" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
    `;
  }
  if (type === "tank") {
    return `
      <ellipse cx="20" cy="14.5" rx="7.5" ry="3.5" fill="none" stroke="__ACCENT__" stroke-width="2"/>
      <path d="M12.5 14.5v10c0 2 3.4 3.5 7.5 3.5s7.5-1.5 7.5-3.5v-10" fill="none" stroke="__ACCENT__" stroke-width="2"/>
      <path d="M15 21.5c1.8 1 8.2 1 10 0" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
    `;
  }
  if (type === "gate") {
    return `
      <path d="M12 27V15l8-4 8 4v12" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linejoin="round"/>
      <path d="M15.5 16.5v8m9-8v8M12 24h16" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
      <path d="M17 20h6" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
    `;
  }
  if (type === "sensor") {
    return `
      <circle cx="20" cy="21" r="2.4" fill="__ACCENT__"/>
      <path d="M20 12v4m0 10v2" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
      <path d="M14.5 15.5a8 8 0 0 0 0 11m11-11a8 8 0 0 1 0 11" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
      <path d="M11 12.5a12.5 12.5 0 0 0 0 17m18-17a12.5 12.5 0 0 1 0 17" fill="none" stroke="__ACCENT__" stroke-width="1.8" stroke-linecap="round"/>
    `;
  }
  if (type === "bioswale") {
    return `
      <path d="M20 28c-5.5-3.2-7.7-7.3-6.6-12.8 4.1-.1 7 1.6 8.6 5.2 1.7-3 4.3-4.5 7.9-4.5.5 5.3-1.7 9.3-6.8 12.1" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linejoin="round"/>
      <path d="M20 15v13" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linecap="round"/>
    `;
  }
  return `
    <path d="M20 11l7 7-7 11-7-11z" fill="none" stroke="__ACCENT__" stroke-width="2" stroke-linejoin="round"/>
    <circle cx="20" cy="18" r="2" fill="__ACCENT__"/>
  `;
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
