export const mapLibre3dConfig = {
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  attribution: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
  camera: {
    zoom: 14.2,
    pitch: 62,
    bearing: -22,
  },
  vectorSourceCandidates: ["openmaptiles", "vector"],
  buildingLayers: [
    {
      id: "fiass-3d-buildings",
      type: "fill-extrusion",
      sourceLayer: "building",
    },
  ],
};
