import type { MapConfig } from "@/components/maps/arcgis-2d-map";

/**
 * Serialisable map configs for the shell-driven data days (11–29, excluding the
 * three bespoke ones: 22 globe, 27 time slider, 29 raster). Each entry is plain
 * data passed from the server day registry into <Arcgis2DMap config=… />.
 *
 * Keeping these out of lib/days.tsx keeps the registry readable and lets the
 * shell own all the ArcGIS boilerplate (basemap, legend, loader, source box,
 * fullscreen, fit-to-data).
 */

const white06 = { color: "rgba(255,255,255,0.8)", width: 0.6 };

export const dayMapConfigs: Record<number, MapConfig> = {
  // 11 — Senses: Sound. Airports as aviation-noise sources.
  11: {
    ariaLabel: "Map of Philippine airports as sources of aviation sound",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    legend: true,
    loadingLabel: "Loading airports",
    layers: [
      {
        url: "/days/day11/airports.geojson",
        title: "Airports (by size)",
        renderer: {
          type: "unique-value",
          field: "type",
          legendOptions: { title: "Airport class" },
          uniqueValueInfos: [
            { value: "large airport", label: "Large", symbol: { type: "simple-marker", style: "circle", size: 16, color: "#a50f15", outline: white06 } },
            { value: "medium airport", label: "Medium", symbol: { type: "simple-marker", style: "circle", size: 10, color: "#de2d26", outline: white06 } },
            { value: "small airport", label: "Small", symbol: { type: "simple-marker", style: "circle", size: 5, color: "#fb6a4a", outline: white06 } },
          ],
        },
        popupTemplate: { title: "{name}", content: "{type}<br/>{municipality}<br/>IATA: {iata}" },
      },
    ],
    sourceBox: { rows: [
      ["Airports", "OurAirports open database (iso = PH)"],
      ["Count", "244 — sized by class"],
      ["Sound", "Each a source of aircraft noise"],
    ] },
  },

  // 12 — Power. The physical electrical grid: transmission lines + substations.
  12: {
    ariaLabel: "Map of the Philippine electrical grid: transmission lines and substations",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    legend: true,
    loadingLabel: "Loading the grid",
    layers: [
      {
        url: "/days/day12/power-grid.geojson",
        title: "Electrical grid",
        renderer: {
          type: "unique-value",
          field: "kind",
          legendOptions: { title: "Grid element" },
          uniqueValueInfos: [
            { value: "line", label: "Transmission line", symbol: { type: "simple-line", color: "#e4322b", width: 1 } },
            { value: "substation", label: "Substation", symbol: { type: "simple-marker", style: "square", size: 4, color: "#151513", outline: { color: "#ffffff", width: 0.4 } } },
          ],
        },
        popupTemplate: { title: "Power {kind}", content: "Part of the Philippine transmission grid (OpenStreetMap)." },
      },
    ],
    sourceBox: { rows: [
      ["Grid", "OpenStreetMap power = line / substation"],
      ["Count", "3,644 lines + 1,010 substations"],
      ["Power", "The physical network that moves electricity"],
    ] },
  },

  // 13 — Interactions. Active faults: where plates grind.
  13: {
    ariaLabel: "Map of active faults in and around the Philippines",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading faults",
    layers: [
      {
        url: "/days/day13/faults.geojson",
        title: "Active faults",
        renderer: {
          type: "simple",
          symbol: { type: "simple-line", color: "#e4322b", width: 1.4 },
        },
        popupTemplate: { title: "{name}", content: "Active fault — {slip_type}" },
      },
    ],
    sourceBox: { rows: [
      ["Faults", "GEM Global Active Faults database"],
      ["Count", "153 fault traces in the PH region"],
      ["Interaction", "Boundaries where crustal blocks move"],
    ] },
  },

  // 14 — Borgesian map. Intramuros at 1:1 detail.
  14: {
    ariaLabel: "Highly detailed map of every building footprint in Intramuros, Manila",
    center: [120.9755, 14.5905],
    zoom: 16,
    minZoom: 14,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading footprints",
    layers: [
      {
        url: "/days/day14/buildings.geojson",
        title: "Building footprints",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: "rgba(21,21,19,0.88)",
            outline: { color: "#e4322b", width: 0.3 },
          },
        },
      },
    ],
    sourceBox: { rows: [
      ["Footprints", "OpenStreetMap buildings, Intramuros"],
      ["Count", "1,680 buildings — every one drawn"],
      ["Borges", "A map at the scale of the territory"],
    ] },
  },

  // 15 — Inside out. The lakes become the land: figure and ground swapped.
  15: {
    ariaLabel: "An inside-out map where the lakes of the Philippines read as land on a water background",
    center: [122.0, 13.5],
    zoom: 6,
    basemap: "none",
    background: "#2b6cb0",
    fitToLayerIndex: null,
    loadingLabel: "Inverting",
    layers: [
      {
        url: "/days/day15/lakes.geojson",
        title: "Lakes as islands",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: "#efe6d0",
            outline: { color: "#cbb98f", width: 0.8 },
          },
        },
        popupTemplate: { title: "{name}", content: "A lake — here drawn as if it were land." },
      },
    ],
    sourceBox: { rows: [
      ["Lakes", "Major Philippine lakes (OpenStreetMap)"],
      ["Trick", "Water is painted as land, land as water"],
      ["Prompt", "Inside out — the lakes become islands"],
    ] },
  },

  // 16 — Collaborative map. Every hospital volunteers mapped in OSM, clustered.
  16: {
    ariaLabel: "Clustered map of hospitals in the Philippines contributed to OpenStreetMap",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading hospitals",
    layers: [
      {
        url: "/days/day16/hospitals.geojson",
        title: "Hospitals (OSM)",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            style: "circle",
            size: 6,
            color: "rgba(228,50,43,0.7)",
            outline: { color: "rgba(165,15,21,0.9)", width: 0.5 },
          },
        },
        featureReduction: {
          type: "cluster",
          clusterRadius: "70px",
          clusterMinSize: "18px",
          clusterMaxSize: "52px",
          labelingInfo: [
            {
              deconflictionStrategy: "none",
              labelExpressionInfo: { expression: "Text($feature.cluster_count, '#,###')" },
              symbol: { type: "text", color: "#ffffff", haloColor: "#a50f15", haloSize: 1, font: { weight: "bold", family: "monospace", size: 11 } },
              labelPlacement: "center-center",
            },
          ],
          popupTemplate: { title: "Hospitals here", content: "<b>{cluster_count}</b> hospitals mapped in this cluster." },
        },
        popupTemplate: { title: "{name}", content: "Hospital (OpenStreetMap)" },
      },
    ],
    sourceBox: { rows: [
      ["Hospitals", "OpenStreetMap, amenity = hospital"],
      ["Count", "2,080 — added by volunteers"],
      ["Collaborative", "Each point a contributor's edit"],
    ] },
  },

  // 17 — Light & dark. Hillshade reveals the mountains; the peaks are named.
  17: {
    ariaLabel: "Hillshade map of the Philippines with its highest peaks labelled",
    center: [122.8, 12.0],
    zoom: 6,
    minZoom: 5,
    basemap: "hillshade",
    fitToLayerIndex: null,
    loadingLabel: "Loading relief",
    layers: [
      {
        url: "/days/day17/peaks.geojson",
        title: "Highest peaks",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-marker",
            style: "triangle",
            size: 10,
            color: "#ffffff",
            outline: { color: "#151513", width: 1 },
          },
        },
        labelingInfo: [
          {
            labelExpressionInfo: { expression: "$feature.name + ' · ' + Text($feature.elevation_m) + ' m'" },
            symbol: { type: "text", color: "#ffffff", haloColor: "#151513", haloSize: 1.4, font: { family: "monospace", weight: "bold", size: 10 } },
            labelPlacement: "above-center",
          },
        ],
        popupTemplate: { title: "{name}", content: "Elevation: {elevation_m} m" },
      },
    ],
    sourceBox: { rows: [
      ["Relief", "Esri World Hillshade (light & shadow)"],
      ["Peaks", "10 highest Philippine summits"],
      ["Light", "The sun comes from the north-west"],
    ] },
  },

  // 18 — NULL. An almost-empty map: only the outline survives.
  18: {
    ariaLabel: "A nearly empty map showing only the outline of the Philippines",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "none",
    background: "#f4f1ea",
    fitToLayerIndex: 0,
    loadingLabel: "Loading nothing",
    layers: [
      {
        url: "/days/day18/country.geojson",
        title: "Outline",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: "rgba(0,0,0,0)",
            outline: { color: "#151513", width: 0.8 },
          },
        },
      },
    ],
    sourceBox: { rows: [
      ["Content", "None — the data is the absence of data"],
      ["Outline", "Philippine land boundary only"],
      ["NULL", "Make something from nothing"],
    ] },
  },

  // 19 — Senses: Smell. A representative smellscape (illustrative).
  19: {
    ariaLabel: "An illustrative smell map of the Philippines",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading smellscape",
    layers: [
      {
        url: "/days/day19/smellscape.geojson",
        title: "Smellscape",
        renderer: {
          type: "simple",
          symbol: { type: "simple-marker", style: "circle", size: 11, color: "#7a8450", outline: { color: "#2f3418", width: 1 } },
        },
        labelingInfo: [
          {
            labelExpressionInfo: { expression: "$feature.place" },
            symbol: { type: "text", color: "#2f3418", haloColor: "#ffffff", haloSize: 1.4, font: { family: "Georgia", style: "italic", size: 11 } },
            labelPlacement: "above-right",
          },
        ],
        popupTemplate: { title: "{place}", content: "{note}" },
      },
    ],
    sourceBox: { rows: [
      ["Places", "Representative smells (illustrative)"],
      ["Examples", "Durian, sulfur vents, fish ports"],
      ["Note", "Positions are indicative, not survey data"],
    ] },
  },

  // 20 — Hexagons. Settlement density, binned into bestagons.
  20: {
    ariaLabel: "Hexagon-binned map of Philippine settlement density",
    center: [122.8, 12.0],
    zoom: 5,
    minZoom: 4,
    basemap: "gray",
    fitToLayerIndex: 0,
    legend: true,
    loadingLabel: "Loading hexbins",
    layers: [
      {
        url: "/days/day20/hexbins.geojson",
        title: "Settlements per hexagon",
        renderer: {
          type: "class-breaks",
          field: "count",
          legendOptions: { title: "Towns & cities per hex" },
          classBreakInfos: [
            { minValue: 1, maxValue: 2, label: "1 – 2", symbol: { type: "simple-fill", color: "#fee5d9", outline: white06 } },
            { minValue: 2, maxValue: 5, label: "2 – 5", symbol: { type: "simple-fill", color: "#fcae91", outline: white06 } },
            { minValue: 5, maxValue: 10, label: "5 – 10", symbol: { type: "simple-fill", color: "#fb6a4a", outline: white06 } },
            { minValue: 10, maxValue: 20, label: "10 – 20", symbol: { type: "simple-fill", color: "#de2d26", outline: white06 } },
            { minValue: 20, maxValue: 100000, label: "20+", symbol: { type: "simple-fill", color: "#a50f15", outline: white06 } },
          ],
        },
        popupTemplate: { title: "Hexagon", content: "<b>{count}</b> towns & cities in this cell" },
      },
    ],
    sourceBox: { rows: [
      ["Places", "OpenStreetMap towns & cities (place nodes)"],
      ["Bins", "211 hexagons (~37 km across)"],
      ["Density", "Darkest hexes are the urban cores"],
    ] },
  },

  // 21 — OpenStreetMap. The Cebu City road web.
  21: {
    ariaLabel: "OpenStreetMap road network of Cebu City",
    center: [123.89, 10.315],
    zoom: 13,
    minZoom: 11,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading roads",
    layers: [
      {
        url: "/days/day21/cebu-roads.geojson",
        title: "Roads (OSM)",
        renderer: {
          type: "unique-value",
          field: "cls",
          uniqueValueInfos: [
            { value: "major", label: "Major roads", symbol: { type: "simple-line", color: "#e4322b", width: 1.8 } },
            { value: "minor", label: "Minor roads", symbol: { type: "simple-line", color: "rgba(21,21,19,0.45)", width: 0.5 } },
          ],
        },
      },
    ],
    sourceBox: { rows: [
      ["Roads", "OpenStreetMap highways, Cebu City"],
      ["Count", "8,658 road segments"],
      ["Source", "The open map of the world"],
    ] },
  },

  // 23 — Senses: Taste. Iconic regional specialties (illustrative).
  23: {
    ariaLabel: "An illustrative taste map of Philippine regional specialties",
    center: [122.8, 12.0],
    zoom: 5,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading flavours",
    layers: [
      {
        url: "/days/day23/tastemap.geojson",
        title: "Regional specialties",
        renderer: {
          type: "simple",
          symbol: { type: "simple-marker", style: "circle", size: 11, color: "#e4a11b", outline: { color: "#8a5a00", width: 1 } },
        },
        labelingInfo: [
          {
            labelExpressionInfo: { expression: "$feature.dish" },
            symbol: { type: "text", color: "#5a3a00", haloColor: "#ffffff", haloSize: 1.4, font: { family: "Georgia", style: "italic", size: 11 } },
            labelPlacement: "above-right",
          },
        ],
        popupTemplate: { title: "{dish}", content: "A specialty of {place}" },
      },
    ],
    sourceBox: { rows: [
      ["Dishes", "Iconic regional specialties (illustrative)"],
      ["Examples", "Lechon, durian, sisig, Bicol Express"],
      ["Note", "Places are representative, not exhaustive"],
    ] },
  },

  // 24 — Network. Metro Manila's rail lines.
  24: {
    ariaLabel: "Map of the Metro Manila rail transit network",
    center: [121.0, 14.6],
    zoom: 11,
    minZoom: 10,
    basemap: "gray",
    fitToLayerIndex: 0,
    legend: true,
    loadingLabel: "Loading rail",
    layers: [
      {
        url: "/days/day24/rail.geojson",
        title: "Rail lines",
        renderer: {
          type: "unique-value",
          field: "line",
          legendOptions: { title: "Line" },
          uniqueValueInfos: [
            { value: "LRT Line 1", symbol: { type: "simple-line", color: "#2e8b57", width: 4 } },
            { value: "LRT Line 2", symbol: { type: "simple-line", color: "#8e44ad", width: 4 } },
            { value: "MRT Line 3", symbol: { type: "simple-line", color: "#e4b000", width: 4 } },
            { value: "PNR Metro North Commuter Line", symbol: { type: "simple-line", color: "#e4322b", width: 3 } },
            { value: "PNR Shuttle Service Line", symbol: { type: "simple-line", color: "#2b6cb0", width: 3 } },
          ],
        },
        popupTemplate: { title: "{line}", content: "Metro Manila rail transit" },
      },
    ],
    sourceBox: { rows: [
      ["Network", "LRT-1, LRT-2, MRT-3, PNR commuter"],
      ["Source", "OpenStreetMap transit relations"],
      ["Routing", "The spine of the capital's transit"],
    ] },
  },

  // 25 — Is this a map? Typhoon tracks as abstract linework.
  25: {
    ariaLabel: "An artistic rendering of typhoon tracks crossing the Philippines",
    center: [128.0, 15.0],
    zoom: 4,
    minZoom: 3,
    basemap: "none",
    background: "#0b1a2b",
    fitToLayerIndex: null,
    loadingLabel: "Composing",
    layers: [
      {
        url: "/days/day25/typhoons.geojson",
        title: "Typhoon tracks",
        renderer: {
          type: "simple",
          symbol: { type: "simple-line", color: "rgba(120,200,230,0.33)", width: 0.8 },
        },
        popupTemplate: { title: "Typhoon {name} ({season})", content: "Peak wind: {max_wind_kt} kt" },
      },
    ],
    sourceBox: { rows: [
      ["Tracks", "437 tropical cyclones, 2000–2024 (IBTrACS)"],
      ["Basemap", "None — the storms trace the archipelago"],
      ["Question", "Is this a map, or a painting of weather?"],
    ] },
  },

  // 26 — Water. The vast sea the Philippines governs.
  26: {
    ariaLabel: "Map of the Philippine Exclusive Economic Zone",
    center: [123.0, 13.0],
    zoom: 4,
    minZoom: 3,
    basemap: "gray",
    fitToLayerIndex: 0,
    loadingLabel: "Loading waters",
    layers: [
      {
        url: "/days/day26/eez.geojson",
        title: "Exclusive Economic Zone",
        renderer: {
          type: "simple",
          symbol: {
            type: "simple-fill",
            color: "rgba(43,108,176,0.28)",
            outline: { color: "#1a4e86", width: 1.4 },
          },
        },
        popupTemplate: { title: "Philippine EEZ", content: "The maritime zone the Philippines governs — most of the nation is water." },
      },
    ],
    sourceBox: { rows: [
      ["Zone", "Philippine Exclusive Economic Zone"],
      ["Source", "Marine Regions (VLIZ) maritime boundaries"],
      ["Water", "The EEZ dwarfs the land area"],
    ] },
  },

  // 28 — Senses: Feeling. Faith, mapped through places of worship.
  28: {
    ariaLabel: "Map of places of worship across the Philippines by religion",
    center: [122.8, 12.0],
    zoom: 5,
    minZoom: 4,
    basemap: "gray",
    fitToLayerIndex: 0,
    legend: true,
    loadingLabel: "Loading the faithful",
    layers: [
      {
        url: "/days/day28/worship.geojson",
        title: "Places of worship",
        renderer: {
          type: "unique-value",
          field: "religion",
          legendOptions: { title: "Religion" },
          uniqueValueInfos: [
            { value: "Christian", symbol: { type: "simple-marker", style: "circle", size: 3.4, color: "rgba(228,50,43,0.7)", outline: { color: "rgba(0,0,0,0)", width: 0 } } },
            { value: "Muslim", symbol: { type: "simple-marker", style: "circle", size: 3.4, color: "rgba(46,139,87,0.85)", outline: { color: "rgba(0,0,0,0)", width: 0 } } },
            { value: "Other / unspecified", symbol: { type: "simple-marker", style: "circle", size: 3, color: "rgba(90,90,90,0.6)", outline: { color: "rgba(0,0,0,0)", width: 0 } } },
          ],
        },
        popupTemplate: { title: "Place of worship", content: "Religion: {religion}" },
      },
    ],
    sourceBox: { rows: [
      ["Worship", "OpenStreetMap places of worship"],
      ["Count", "18,836 — by religion"],
      ["Feeling", "Faith: Christian red, Muslim green"],
    ] },
  },
};
