export const mapLibre3dConfig = {
  styleUrl: "https://tiles.openfreemap.org/styles/liberty",
  attribution: "OpenFreeMap, OpenMapTiles, OpenStreetMap",
  camera: {
    zoom: 15.6,
    pitch: 50,
    bearing: -15,
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
