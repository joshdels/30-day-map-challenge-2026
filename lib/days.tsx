import type { ReactNode } from "react";
import { TagumWatershedMap } from "@/components/maps/tagum-watershed";
import { RegionsPovertyMap } from "@/components/maps/regions-poverty";
import { PhEarthquakesMap } from "@/components/maps/ph-earthquakes";
import { MayonViewshedMap } from "@/components/maps/mayon-viewshed";
import { VolcanoesVintageMap } from "@/components/maps/volcanoes-vintage";
import { RegionalCapitalsMap } from "@/components/maps/regional-capitals";
import { RenewablesUtopiaMap } from "@/components/maps/renewables-utopia";
import { UrbanRuralMap } from "@/components/maps/urban-rural";
import { PromptingAtlasMap } from "@/components/maps/prompting-atlas";
import { Arcgis2DMap } from "@/components/maps/arcgis-2d-map";
import { dayMapConfigs } from "@/lib/day-map-configs";
import { GlobeProjectionMap } from "@/components/maps/globe-projection";
import { QuakesTimeSliderMap } from "@/components/maps/quakes-timeslider";
import { SatelliteRasterMap } from "@/components/maps/satellite-raster";

/**
 * Source attribution for an operational layer / dataset.
 * AGENTS.md requires every real data source to record these fields.
 * Omit it only for clearly-labelled illustrative or synthetic graphics.
 */
export type DataCredit = {
  source: string; // e.g. "PSA 2020 Census of Population"
  license: string; // usage terms, e.g. "CC BY 4.0"
  retrieved: string; // ISO date the data was pulled
  coverage: string; // geographic coverage, e.g. "Philippines, national"
  fields?: string; // key fields used
  transformations?: string; // any processing applied
  url?: string;
};

/** A single block of the written field note that accompanies each map. */
export type EssayBlock = { heading?: string; body: string };

/**
 * The map/media itself. Pick ONE kind per day.
 * - image:  a rendered map exported as a picture (PNG/JPG/SVG in /public)
 * - video:  a screen recording or animation (local file or YouTube/Vimeo embed)
 * - webgis: an interactive web map (iframe embed now, ArcGIS component later)
 * - custom: anything else — inline SVG, a chart, a React component you author
 */
export type DayMedia =
  | { kind: "image"; src: string; alt: string; width?: number; height?: number; credit?: DataCredit; illustrative?: boolean; bleed?: boolean }
  | { kind: "video"; src: string; poster?: string; embed?: boolean; credit?: DataCredit; bleed?: boolean }
  | { kind: "webgis"; embedUrl: string; title: string; credit?: DataCredit; bleed?: boolean }
  | { kind: "custom"; render: () => ReactNode; illustrative?: boolean; credit?: DataCredit; bleed?: boolean };

/** Everything the day route needs to render one map essay. */
export type DayContent = {
  dek: string; // one-line tagline under the title
  note?: string; // short standfirst to the right of the intro
  figLabel?: string; // caption label, defaults to FIG. 0NN
  caption: string; // what the figure shows
  media: DayMedia;
  essay: EssayBlock[];
  publishedAt: string; // ISO date
};

/**
 * THE DAY REGISTRY — the single source of truth for published days.
 *
 * To publish a day: add an entry keyed by its day number (1–30).
 * The prompt title/description come automatically from lib/challenge.ts,
 * so you only author the map, caption and field note here.
 * Days with no entry stay as intentional "coming soon" routes.
 *
 * See docs/ADDING-DAYS.md for a full walkthrough and copy-paste templates.
 */
export const days: Partial<Record<number, DayContent>> = {
  1: {
    dek: "What if every point held a story?",
    note: "A study of place through the smallest cartographic mark—mapping the Philippines as a constellation of lived moments.",
    figLabel: "DATA / CITIES — NAMRIA CENTROIDS",
    caption: "Each luminous point represents a place—not as a statistic, but as a beginning.",
    media: {
      kind: "image",
      bleed: false, // Day 01 keeps its framed, acid-background editorial look.
      src: "/days/01-points.png",
      alt: "Map of the Philippines rendered as a constellation of black dots, forming the silhouette of Luzon, the Visayas and Mindanao.",
      width: 2161,
      height: 3549,
    },
    essay: [
      {
        heading: "A country is more than its outline.",
        body: "Start with a dot. Then another. Soon the familiar silhouette appears: Luzon in the north, the Visayas scattered at its center, Mindanao holding the south. Yet no single point explains the whole.",
      },
      {
        body: "This opening study treats the map as a constellation. It is a reminder that geography is assembled from specific places, and that every place becomes meaningful through the people who name it home.",
      },
    ],
    publishedAt: "2026-11-01",
  },
  2: {
    dek: "A river is a hierarchy you can see from above.",
    note: "The Tagum–Saug watershed drawn as a branching network—every channel ranked by Strahler stream order, from first-order headwaters to the fifth-order trunk.",
    figLabel: "DATA / HYDROLOGY — STRAHLER STREAM ORDER",
    caption:
      "1,411 stream segments of the Tagum–Saug watershed, classified by Strahler order (1–5). Pan and zoom the interactive map; thicker, darker lines carry more of the network.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <TagumWatershedMap />,
      credit: {
        source:
          "Copernicus GLO-30 DEM, hydrologically derived (GRASS GIS r.watershed / r.stream.order)",
        license: "Copernicus DEM — free and open (ESA, open licence)",
        retrieved: "2026-11-02",
        coverage: "Tagum–Saug watershed, Davao del Norte, Philippines",
        fields: "strahler (stream order 1–5)",
        transformations:
          "DEM-conditioned flow routing; streams extracted and Strahler-ordered; clipped to the delineated basin; simplified (15 m) and reprojected from UTM 51N to WGS 84.",
        url: "https://dataspace.copernicus.eu/",
      },
    },
    essay: [
      {
        heading: "Order is what a watershed is made of.",
        body: "Rain that falls on the hills of Davao del Norte does not drain at random. Every drop finds a first-order channel, which joins another to make a second, and so on until the whole catchment is organised into the Tagum–Saug trunk. Strahler stream order is the simplest way to read that hierarchy: a channel's order rises only when two streams of equal order meet.",
      },
      {
        body: "Here the network is derived from a Copernicus 30-metre DEM, with flow routed downhill and each segment ranked from 1 (the faint headwater threads) to 5 (the dark central spine). The red outline is the delineated watershed boundary—the exact ground that feeds this river. Read as a whole, it is less a map of water than a map of gravity, made legible.",
      },
    ],
    publishedAt: "2026-11-02",
  },
  3: {
    dek: "A polygon can hold a hard number.",
    note: "The seventeen regions of the Philippines, each drawn as one representative province and shaded by its 2023 poverty incidence—from a 1.1% low in Metro Manila to 24.2% in the Zamboanga Peninsula.",
    figLabel: "DATA / SOCIETY — POVERTY INCIDENCE 2023 (PSA)",
    caption:
      "Regional poverty incidence for 2023 (PSA), drawn as polygons. Pan, zoom and click a region; darker fills mark a larger share of the population living below the poverty line.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <RegionsPovertyMap />,
      credit: {
        source:
          "PSA 2023 Full Year Official Poverty Statistics of the Philippines; administrative boundaries from OCHA/HDX Philippines COD-AB (v03)",
        license:
          "PSA statistics — open government data; HDX boundaries — CC BY-IGO 3.0",
        retrieved: "2026-11-03",
        coverage: "Philippines, 17 regions",
        fields: "pov_incidence_2023 (poverty incidence among population, %)",
        transformations:
          "Regional poverty incidence joined to administrative polygons; each region represented by one province polygon; geometry simplified (~0.004°) and written as WGS 84 GeoJSON.",
        url: "https://psa.gov.ph/statistics/poverty",
      },
    },
    essay: [
      {
        heading: "Where the line falls, and who lives below it.",
        body: "Poverty incidence is the share of a population whose income cannot meet basic food and non-food needs. In 2023 the Philippine Statistics Authority put that figure at roughly one in ten Filipinos nationally—but the national average hides a steep geography. Metro Manila reports 1.1%; the Zamboanga Peninsula and the Bangsamoro region climb past 23%.",
      },
      {
        body: "This map is a study in polygons: each of the seventeen regions is rendered as a single representative province, shaded on a light-to-deep red ramp by its regional poverty incidence. The province stands in for its region—so read the colour, not the exact borders—and the pattern is unmistakable. Prosperity concentrates in and around the capital and the central Luzon–Calabarzon corridor; hardship deepens toward the southern and western edges of the archipelago.",
      },
    ],
    publishedAt: "2026-11-03",
  },
  4: {
    dek: "Where the ground gathers its force.",
    note: "Twenty-six years of Philippine seismicity—8,027 magnitude-4.5-and-above epicenters—collapsed into clusters. The bubbles trace the trenches and fault zones where earthquakes gather most densely.",
    figLabel: "DATA / HAZARD — SEISMIC CLUSTERS 2000–2026",
    caption:
      "8,027 earthquakes of magnitude 4.5 and above (2000–2026), clustered by location. Each bubble counts the epicenters it holds; zoom in to split clusters apart and click a single quake for its magnitude, depth and place.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <PhEarthquakesMap />,
      credit: {
        source:
          "USGS Advanced National Seismic System (ANSS) Comprehensive Catalog, via the FDSN event web service",
        license: "USGS earthquake data — public domain",
        retrieved: "2026-11-04",
        coverage:
          "Philippine region (lat 4.5°–21.5° N, lon 116°–127° E), 2000–2026",
        fields: "mag, place, depth_km, year",
        transformations:
          "Queried M4.5+ events for the PH bounding box; reduced to magnitude, place, depth and year; coordinates rounded to 4 decimals; written as WGS 84 GeoJSON. Clustering is performed client-side by the ArcGIS SDK.",
        url: "https://earthquake.usgs.gov/fdsnws/event/1/",
      },
    },
    essay: [
      {
        heading: "An archipelago assembled by force.",
        body: "The Philippines sits astride the Pacific Ring of Fire, caught between subducting plates on nearly every side—the Manila Trench to the west, the Philippine Trench to the east, and the Philippine Fault slicing diagonally through the islands. Earthquakes here are not scattered at random; they concentrate along these seams.",
      },
      {
        body: "Rendered one dot at a time, 8,027 epicenters would be an illegible smear. Clustered, the pattern resolves: dense knots of seismicity shadow the trench lines offshore and the fault traces on land, while the stable interior stays comparatively quiet. Each bubble reports how many quakes it holds and their average magnitude—a way of reading a quarter-century of ground movement as the places where the Earth most often gathers its force.",
      },
    ],
    publishedAt: "2026-11-04",
  },
  5: {
    dek: "To see is to stand somewhere.",
    note: "A 360° viewshed from the summit of Mayon Volcano—every patch of ground the eye could reach from 2,462 metres, traced across real terrain and computed live in your browser.",
    figLabel: "DATA / SIGHT — MAYON SUMMIT VIEWSHED",
    caption:
      "What can be seen from the top of Mayon. Green marks ground visible from the summit; red marks land hidden behind the terrain. Drag to orbit the cone, scroll to zoom—the analysis recomputes against the elevation as you move.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <MayonViewshedMap />,
      credit: {
        source:
          "Esri WorldElevation3D / Terrain3D global elevation service (keyless); viewshed computed client-side by the ArcGIS Maps SDK",
        license: "Esri Terrain3D — free to use as a 3D ground surface",
        retrieved: "2026-11-05",
        coverage: "Mayon Volcano and Albay, Bicol Region, Philippines",
        fields: "observer summit position; 45 km far distance; 360° dome",
        transformations:
          "Observer placed at the Mayon summit (~2,500 m). Visibility traced across the streamed DEM; no data bundled in the repo.",
        url: "https://developers.arcgis.com/javascript/latest/api-reference/esri-analysis-ViewshedAnalysis.html",
      },
    },
    essay: [
      {
        heading: "Sight is a question of where you stand.",
        body: "A viewshed answers a deceptively simple question: from a given point, what can actually be seen? The answer is written entirely in the terrain. Ridges block, valleys hide, and the open sea stretches the horizon. From the near-perfect cone of Mayon—the most symmetric volcano in the world—the view fans out across the Bicol lowlands and Albay Gulf almost unobstructed.",
      },
      {
        body: "This is the gallery's first fully three-dimensional map. The green shell is every surface the summit observer can see within 45 kilometres; the red is land folded out of view behind intervening slopes. Nothing here is a static picture—the visibility is recomputed against the elevation surface as you orbit and zoom, a reminder that 'sight' is never just about the eye, but about the ground beneath it.",
      },
    ],
    publishedAt: "2026-11-05",
  },
  6: {
    dek: "An old chart for a restless archipelago.",
    note: "The twenty-three Holocene volcanoes of the Philippines, drawn as an antique relief chart—engraved cones sized by height, labelled in a cartographer's italic with the year each last erupted.",
    figLabel: "DATA / VINTAGE — HOLOCENE VOLCANOES (GVP)",
    caption:
      "The Philippines' Holocene volcanoes on a sepia relief chart. Triangles are sized by summit elevation; italic labels give the last recorded eruption year. Click a cone for its type and history.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <VolcanoesVintageMap />,
      credit: {
        source:
          "Smithsonian Institution, Global Volcanism Program — Volcanoes of the World (Holocene) via GVP WFS; relief from Esri World Shaded Relief (keyless)",
        license:
          "GVP data — free for non-commercial use with attribution; Esri relief — free to use",
        retrieved: "2026-11-06",
        coverage: "Philippines, Holocene volcanoes (23)",
        fields: "name, type, last_eruption, elevation_m, subregion",
        transformations:
          "Queried GVP Holocene volcanoes where Country = Philippines; reduced to five fields; rendered as WGS 84 GeoJSON. The vintage tone is a scoped CSS sepia filter over grayscale relief tiles.",
        url: "https://volcano.si.edu/",
      },
    },
    essay: [
      {
        heading: "The look of an older science.",
        body: "Before satellites and seismographs, a volcano map was an act of drawing: shaded cones, ruled meridians, a careful italic hand. This map borrows that grammar deliberately. The terrain is tinted to aged paper, a graticule is ruled every two degrees, and each of the archipelago's twenty-three Holocene volcanoes is set down as an engraved triangle.",
      },
      {
        body: "The data beneath the styling is thoroughly modern—the Smithsonian's Global Volcanism Program catalogue—but the question is old as cartography itself: where does the land threaten to remake itself? Mayon, Taal, Kanlaon, Pinatubo and Bulusan carry the most recent eruption years; others have been quiet for centuries. A vintage chart is still, at heart, a hazard map.",
      },
    ],
    publishedAt: "2026-11-06",
  },
  7: {
    dek: "Quick hands, honest marks.",
    note: "The ten-minute map: the seat of government of each of the seventeen Philippine regions, dropped as plain dots. No gradients, no analysis—just where the country administers itself.",
    figLabel: "DATA / QUICK — 17 REGIONAL CAPITALS",
    caption:
      "The regional centres of the Philippines—from Manila and Baguio to Davao City and Cotabato City—as a bare points map. Click a dot for its region.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <RegionalCapitalsMap />,
      credit: {
        source:
          "Seats of regional government of the Philippines (regional centres), compiled from public administrative references",
        license: "Reference place coordinates — public information",
        retrieved: "2026-11-07",
        coverage: "Philippines, 17 regional centres",
        fields: "city, region",
        transformations:
          "City coordinates for each region's seat of government entered directly as WGS 84 point GeoJSON; no processing.",
      },
    },
    essay: [
      {
        heading: "The discipline of ten minutes.",
        body: "The prompt is a constraint, not a theme: finish a map in ten minutes. So this one strips away everything optional. Seventeen dots, seventeen names—the city where each Philippine region seats its government. Manila anchors the National Capital Region; Baguio presides over the Cordillera; Davao City and Cotabato City hold the south.",
      },
      {
        body: "There is a quiet lesson in working fast. With no time for styling tricks, the map falls back on the oldest cartographic act there is—putting a point where a place is, and writing its name beside it. Sometimes that is the whole job.",
      },
    ],
    publishedAt: "2026-11-07",
  },
  8: {
    dek: "A country that could run on its own weather.",
    note: "Utopia as an extrapolation: the renewable power already generating across the Philippines—hydro, geothermal, solar, wind, biomass—mapped as the foundation of an all-clean grid that could be.",
    figLabel: "DATA / UTOPIA — RENEWABLE GENERATION",
    caption:
      "Every renewable power plant in the Philippines, coloured by fuel and sized by capacity. The Philippines is the world's third-largest geothermal producer; read this as the first draft of a grid that could one day be entirely clean.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <RenewablesUtopiaMap />,
      credit: {
        source:
          "World Resources Institute — Global Power Plant Database (v1.3.0)",
        license: "WRI GPPD — CC BY 4.0",
        retrieved: "2026-11-08",
        coverage: "Philippines; renewable plants only",
        fields: "name, fuel, capacity_mw, year",
        transformations:
          "Filtered GPPD to country PHL and renewable primary fuels (hydro, geothermal, solar, wind, biomass); kept name, fuel, capacity and commissioning year as WGS 84 GeoJSON. Capacities reflect the v1.3.0 snapshot (≤2021).",
        url: "https://datasets.wri.org/dataset/globalpowerplantdatabase",
      },
    },
    essay: [
      {
        heading: "The utopia is already partly built.",
        body: "A utopia need not be invented from nothing; sometimes it is the honest extrapolation of what already works. The Philippines sits on one of the planet's great geothermal provinces and catches monsoon rain across steep terrain—so its clean-energy backbone is real and sizeable: roughly 3,400 MW of hydro and 1,800 MW of geothermal already feed the grid, alongside a fast-growing fringe of solar and wind.",
      },
      {
        body: "This map plots that existing fleet and invites the leap: imagine each dot larger, the gaps filled, the fossil plants quietly subtracted. The data is strictly real—the Global Power Plant Database, measured capacities, true locations—and only the framing is aspirational. That is the most useful kind of utopia: one you can measure the distance to.",
      },
    ],
    publishedAt: "2026-11-08",
  },
  9: {
    dek: "One country, two densities.",
    note: "Population density by region, 2024 Census. The National Capital Region packs roughly 23,500 people into each square kilometre; the Cordillera and Mimaropa hold around a hundred. Urban and rural, drawn as a single ramp.",
    figLabel: "DATA / URBAN–RURAL — DENSITY 2024 (PSA)",
    caption:
      "Population density by region (2024 Census), shaded across the provinces of each region. Click any province for its region's population, area and density. NCR sits alone in the darkest class; the rural highlands and islands sit at the pale floor.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <UrbanRuralMap />,
      credit: {
        source:
          "PSA 2024 Census of Population and Housing (regional populations); administrative boundaries from the faeldon/philippines-json-maps PSGC dataset",
        license:
          "PSA statistics — open government data; boundaries — open (PSA PSGC derived)",
        retrieved: "2026-11-09",
        coverage: "Philippines, 18 regions (88 provinces/districts)",
        fields: "region, pop_2024, region_area_km2, density",
        transformations:
          "Per-region province polygons merged from PSGC region files; each province tagged with its region's 2024 population, total regional land area, and derived density (population ÷ area); simplified low-res geometry as WGS 84 GeoJSON.",
        url: "https://psa.gov.ph/statistics/population-and-housing",
      },
    },
    essay: [
      {
        heading: "The gradient between two ways of living.",
        body: "\"Urban\" and \"rural\" are not two boxes but the ends of a gradient, and population density is the cleanest way to see it. In the Philippines that gradient is unusually steep. Metro Manila concentrates some 14 million people into about 620 square kilometres—roughly 23,500 per square kilometre—one of the densest urban cores on Earth.",
      },
      {
        body: "Away from the capital the map pales quickly. Calabarzon and Central Luzon, the industrial belts flanking Manila, stay warm; Cebu and the old Visayan port-regions hold their own. But the Cordillera's mountains, the scattered islands of Mimaropa, and the forests of Caraga drop toward a hundred people per square kilometre. The same nation, read through density, contains both the crush of the megacity and the quiet of the uplands.",
      },
    ],
    publishedAt: "2026-11-09",
  },
  10: {
    dek: "A map that admits how it was made.",
    note: "The prompt asks for something produced start-to-finish in a chat window. So this map turns the lens on the gallery itself—the first ten days plotted back onto the Philippines they describe, authored the same way as all the rest: by prompting.",
    figLabel: "DATA / PROMPTING — THE GALLERY, MAPPED",
    caption:
      "A self-portrait of the project. Each marker is one day of this gallery, placed at the Philippine subject it maps; click a point for the theme and what it shows. Positions are representative of each map's subject, not measured coordinates.",
    media: {
      kind: "custom",
      bleed: true,
      illustrative: true,
      render: () => <PromptingAtlasMap />,
      credit: {
        source:
          "This gallery's own day registry (lib/days.tsx); marker positions chosen to represent each day's subject",
        license: "Project self-reference",
        retrieved: "2026-11-10",
        coverage: "Philippines; days 1–10 of this gallery",
        fields: "day, theme, subject",
        transformations:
          "Each published day placed at a representative coordinate of its subject and rendered as WGS 84 point GeoJSON. Positions are illustrative, not survey data.",
      },
    },
    essay: [
      {
        heading: "Made in a chat window, from first dot to last.",
        body: "Every map in this gallery was produced by prompting an AI coding agent—describing the data, the cartography and the story in plain language, then refining what came back. Day 10 makes that process its subject. Rather than smuggle in a new dataset, it plots the gallery onto the country the gallery is about: a watershed in Davao, a volcano in Albay, a seismic trench off the eastern seaboard, the density of the capital.",
      },
      {
        body: "A \"prompting only\" map risks being a gimmick, so this one tries to be honest instead. The positions are representative, not measured—flagged as illustrative—and the point is reflexive: a thirty-day cartographic project, assembled through conversation, pausing on day ten to map its own first act. The tool did work for its money; here is the ledger.",
      },
    ],
    publishedAt: "2026-11-10",
  },
  11: {
    dek: "A country has a sound, and some of it is engines.",
    note: "The Philippines' airports, plotted as sources of aviation sound—from the roar of the international gateways to the single daily hum of a provincial strip.",
    figLabel: "DATA / SOUND — AIRPORTS",
    caption:
      "Every airport in the Philippines, sized by class. Read each dot as a source of aircraft noise—loudest where the large hubs cluster around Manila, Cebu and Davao.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[11]} />,
      credit: {
        source: "OurAirports open community database",
        license: "OurAirports — public domain",
        retrieved: "2026-11-11",
        coverage: "Philippines (iso_country = PH)",
        fields: "name, type, iata, municipality",
        transformations: "Filtered to large/medium/small airports in the PH; kept name, class, IATA and municipality as WGS 84 point GeoJSON.",
        url: "https://ourairports.com/",
      },
    },
    essay: [
      { heading: "Mapping a sense you can't see.", body: "Sound has no shape, so a sound map must borrow one. Here the proxy is aviation: each airport is a place where the sky gets loud. The largest markers—Manila's NAIA, Mactan-Cebu, Davao—are the country's acoustic hotspots, where jet engines define the edge of whole neighbourhoods." },
      { body: "Scattered across the provinces are the small strips, many with a single scheduled hum a day. Together they trace a second geography laid over the islands: not where people live, but where the noise of modern movement rises and falls." },
    ],
    publishedAt: "2026-11-11",
  },
  12: {
    dek: "The wires that actually carry the power.",
    note: "Not the plants but the grid itself: every high-voltage transmission line and substation that moves electricity across the Philippines, mapped straight from OpenStreetMap.",
    figLabel: "DATA / POWER — THE TRANSMISSION GRID",
    caption:
      "The Philippine electrical grid—3,644 transmission lines in red, 1,010 substations as dark nodes. This is power in its most literal form: the physical web that carries it from plant to plug.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[12]} />,
      credit: {
        source: "OpenStreetMap contributors — power = line / substation",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-12",
        coverage: "Philippines; transmission grid",
        fields: "kind (line / substation)",
        transformations: "Overpass query for power transmission lines and substations across the PH bounding box; lines kept as WGS 84 line GeoJSON, substations as points.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "Power is a network, not just a source.", body: "Day 08 and the generation fleet answer where power is made; this map answers how it travels. The red filaments are high-voltage transmission lines, stitched between the dark squares of substations that step the voltage up and down—the nervous system of the national grid." },
      { body: "Trace it and the country's electrical logic appears: dense meshes around Luzon's load centres, long lines reaching down the Visayan islands and across Mindanao, and the gaps where the grid thins or an island runs on its own. To map the wires is to map where power can, and can't, yet reach." },
    ],
    publishedAt: "2026-11-12",
  },
  13: {
    dek: "The islands are a conversation between plates.",
    note: "The active faults threading through and around the Philippines—the lines along which the crust slips, locks and ruptures. Day 04's earthquakes are what these interactions sound like.",
    figLabel: "DATA / INTERACTIONS — ACTIVE FAULTS",
    caption:
      "Active fault traces in the Philippine region (GEM). These are the seams where crustal blocks interact—the Philippine Fault slicing the archipelago, the trenches bounding it east and west.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[13]} />,
      credit: {
        source: "GEM Foundation — Global Active Faults Database (harmonized)",
        license: "GEM GAF-DB — CC BY 4.0",
        retrieved: "2026-11-13",
        coverage: "Philippine region (clipped by bounding box)",
        fields: "name, slip_type",
        transformations: "Selected fault traces intersecting the PH bounding box; kept name and slip type as WGS 84 line GeoJSON.",
        url: "https://github.com/GEMScienceTools/gem-global-active-faults",
      },
    },
    essay: [
      { heading: "Every quake is an interaction.", body: "Geology is relational. These red lines are the interfaces where tectonic blocks meet and move past one another—and the Philippine Fault, running the length of the archipelago, is one of the most active strike-slip systems on Earth." },
      { body: "Lay this map beside Day 04's seismic clusters and the relationship is unmistakable: the earthquakes are not random, they are the audible record of these faults interacting. The lines are the cause; the dots are the consequence." },
    ],
    publishedAt: "2026-11-13",
  },
  14: {
    dek: "A map at the scale of the thing itself.",
    note: "Borges imagined a map so detailed it covered the empire it described. This one zooms into Intramuros, Manila's walled old city, and draws every single building footprint—1,680 of them.",
    figLabel: "DATA / BORGESIAN — INTRAMUROS 1:1",
    caption:
      "Every building footprint inside Intramuros, the Spanish-era walled city of Manila. At this scale the map stops summarising and starts simply reproducing—the Borgesian limit.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[14]} />,
      credit: {
        source: "OpenStreetMap contributors — building footprints",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-14",
        coverage: "Intramuros, Manila (≈1.4 km²)",
        fields: "building geometry",
        transformations: "Overpass query for way[building] within the Intramuros bounding box; rendered as WGS 84 polygon GeoJSON.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "On exactitude in science.", body: "In Borges' one-paragraph fable, cartographers perfect their craft until the map of the empire is the size of the empire, and useless. The joke is also a limit: detail and abstraction pull against each other, and a map that abstracts nothing is just the territory again." },
      { body: "Intramuros is the right place to test it—a dense, finite, storied square kilometre whose every structure can actually be drawn. Zoom in and the generalisation that makes maps useful quietly disappears, footprint by footprint." },
    ],
    publishedAt: "2026-11-14",
  },
  15: {
    dek: "The lakes become the islands.",
    note: "An inside-out map: the country's major lakes—usually the empty holes inside the land—are painted as land, floating on a sea where the land used to be. Figure and ground, swapped.",
    figLabel: "DATA / INSIDE OUT — LAKES AS ISLANDS",
    caption:
      "The Philippines turned inside out. Its biggest lakes—Laguna de Bay, Taal, Lanao and the rest—are rendered as tan 'islands' on open blue, so the water reads as land and the land has vanished into sea.",
    media: {
      kind: "custom",
      bleed: true,
      illustrative: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[15]} />,
      credit: {
        source: "Major Philippine lakes from OpenStreetMap (natural = water)",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-15",
        coverage: "Philippines; largest named lakes",
        fields: "name, area",
        transformations: "Overpass query for named water bodies; kept the largest by area and styled as land over a water-coloured background—an intentional figure–ground inversion.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "The eye reads convention, not shape.", body: "Blue means water, tan means land—a rule so deep we never notice obeying it. This map breaks it. The lakes, normally the negative space punched into the land, are promoted to land; everything around them becomes sea. The familiar country dissolves and a strange little archipelago of lakes takes its place." },
      { body: "Laguna de Bay sprawls like a main island, Taal and Lanao become their own territories. Nothing about the geometry is false—these are the real lakes—yet the inversion makes them unrecognisable. That estrangement is the prompt: something here is deliberately, instructively not right." },
    ],
    publishedAt: "2026-11-15",
  },
  16: {
    dek: "A map no one person could have made.",
    note: "Every hospital in the Philippines as recorded in OpenStreetMap—2,080 points, each placed by a volunteer. Clustered, they show a map built by a crowd.",
    figLabel: "DATA / COLLABORATIVE — OSM HOSPITALS",
    caption:
      "Hospitals across the Philippines, contributed to OpenStreetMap by volunteers and clustered by location. Every dot is someone's edit; the whole is a map made collaboratively.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[16]} />,
      credit: {
        source: "OpenStreetMap contributors — amenity = hospital",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-16",
        coverage: "Philippines (OSM relation, admin level 2)",
        fields: "name",
        transformations: "Overpass query for hospitals within the PH boundary; node/way/relation centroids kept as WGS 84 point GeoJSON; clustered client-side.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "Mapping as a public act.", body: "OpenStreetMap is the world's largest collaborative map—millions of contributors, no single author. This layer is one slice of that effort: the hospitals of the Philippines, each added by a person who walked past one, surveyed it, or traced it from imagery." },
      { body: "Clustered, the points mirror the population: dense knots in Metro Manila, Cebu and Davao, thinner coverage in the uplands and smaller islands—which is also a map of where the crowd has, and hasn't, yet mapped." },
    ],
    publishedAt: "2026-11-16",
  },
  17: {
    dek: "The mountains are written in shadow.",
    note: "A hillshade of the Philippines—terrain modelled as light and shadow from a low sun—with the ten highest summits named. Relief needs no colour; it only needs a direction to be lit from.",
    figLabel: "DATA / LIGHT & DARK — HILLSHADE",
    caption:
      "The Philippine landscape as pure light and shadow. A modelled sun rakes across the terrain; the ten highest peaks, from Apo to Pinatubo, are marked.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[17]} />,
      credit: {
        source: "Esri World Hillshade (global DEM, shaded relief); peak list compiled from public references",
        license: "Esri World Hillshade — free to use",
        retrieved: "2026-11-17",
        coverage: "Philippines; 10 highest peaks",
        fields: "name, elevation_m",
        transformations: "Keyless hillshade basemap; ten named summits entered as WGS 84 point GeoJSON with elevation.",
      },
    },
    essay: [
      { heading: "Shadow is information.", body: "A hillshade carries no colour and no labels, yet it reads instantly as mountains, valleys and plains. All it encodes is how a hypothetical sun—here low in the north-west—would strike each slope: lit faces bright, hidden faces dark." },
      { body: "Against that chiaroscuro the country's roof stands out: Apo in Mindanao, Dulang-dulang and Kitanglad on its spine, Pulag in the Cordillera. Light and dark is the oldest trick for turning elevation into a landscape the eye can feel." },
    ],
    publishedAt: "2026-11-17",
  },
  18: {
    dek: "Almost nothing, on purpose.",
    note: "NULL. A map stripped to a single outline on blank paper—no data, no fill, no labels. What remains when you remove everything is still, stubbornly, a map.",
    figLabel: "DATA / NULL — THE EMPTY MAP",
    caption:
      "The Philippines reduced to its boundary and nothing else. The content of this map is the absence of content—an argument that an outline alone still means something.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[18]} />,
      credit: {
        source: "Philippine land boundary (PSA/PSGC via faeldon PH JSON maps)",
        license: "Open (PSA PSGC derived)",
        retrieved: "2026-11-18",
        coverage: "Philippines, national outline",
        fields: "country polygon",
        transformations: "National outline drawn as a hairline over blank paper; every other layer deliberately omitted.",
      },
    },
    essay: [
      { heading: "Making something from nothing.", body: "NULL is the absence of a value. A null map, then, is a provocation: how little can remain and still be a map? Strip the fills, the roads, the names, the colour—keep only the line where land meets sea." },
      { body: "What's left is nearly empty, and yet it is unmistakably the Philippines. The outline does the entire job, which is the quiet lesson: a map is less a pile of data than a single decision about where to draw the edge." },
    ],
    publishedAt: "2026-11-18",
  },
  19: {
    dek: "An archipelago you could find with your eyes closed.",
    note: "A smellscape—seven places chosen for what they give the nose: durian stalls, sulfur vents, fish ports, fermenting bagoong. The positions are real; the sense is interpretive.",
    figLabel: "DATA / SMELL — A SMELLSCAPE",
    caption:
      "An illustrative smell map of the Philippines. Each marker is a real place known for a strong scent—Davao's durian, Taal's sulfur, Navotas' fish port—mapped as a sense rather than a statistic.",
    media: {
      kind: "custom",
      bleed: true,
      illustrative: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[19]} />,
      credit: {
        source: "Representative places compiled for an illustrative smell map",
        license: "Illustrative — public place references",
        retrieved: "2026-11-19",
        coverage: "Philippines; 7 indicative places",
        fields: "place, note",
        transformations: "Notable scent-associated places entered as WGS 84 points. Positions are indicative; the smell association is interpretive, not measured.",
      },
    },
    essay: [
      { heading: "How do you map a nose?", body: "Smell resists cartography—it has no coordinates, no units, no edges. So this map cheats honestly: it marks places whose scent is part of their identity. Davao is durian; Taal is sulfur; Navotas is the brine of the country's largest fish port." },
      { body: "The result is not a measurement but an invitation to remember. A Filipino reading it can almost smell each dot. Flagged illustrative, it argues that some maps work on recognition and association rather than data." },
    ],
    publishedAt: "2026-11-19",
  },
  20: {
    dek: "The good old bestagons.",
    note: "Every town and city of the Philippines, binned into hexagons. Each hex is shaded by how many settlements fall inside it—a clean, grid-free way to read where the country gathers.",
    figLabel: "DATA / HEXAGONS — SETTLEMENT DENSITY",
    caption:
      "Philippine towns and cities aggregated into hexagons and shaded by count. The darkest cells are the urban cores—Metro Manila, Cebu, the Calabarzon belt—where settlements pack most tightly.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[20]} />,
      credit: {
        source: "OpenStreetMap place nodes (city / town), hex-binned",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-20",
        coverage: "Philippines; 1,703 town & city points",
        fields: "count (settlements per hexagon)",
        transformations: "1,703 place nodes assigned to a ~0.33° hexagonal grid; per-hex counts written as WGS 84 polygon GeoJSON (211 hexes).",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "Why hexagons.", body: "Square grids distort: a cell's neighbours sit at unequal distances, and the eye invents lines along the rows. Hexagons solve both—every bin has six equidistant neighbours, so the aggregation adds no false grain of its own. They tile the plane as fairly as a regular shape can." },
      { body: "Binning the country's towns and cities this way turns a thousand scattered dots into a clean density surface. The dark hexes gather around the capital, Cebu and the industrial corridors; the pale ones mark the thinly-settled uplands and small islands—settlement, read as a fair grid." },
    ],
    publishedAt: "2026-11-20",
  },
  21: {
    dek: "The world's map, drawn by everyone.",
    note: "The road network of Cebu City, pulled straight from OpenStreetMap—8,658 segments from national highways down to residential lanes, the free map of the world at street scale.",
    figLabel: "DATA / OPENSTREETMAP — CEBU ROADS",
    caption:
      "Cebu City's streets as mapped in OpenStreetMap. Major arteries in red, the residential weave in grey—an open dataset anyone can read, use, and improve.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[21]} />,
      credit: {
        source: "OpenStreetMap contributors — highway network",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-21",
        coverage: "Cebu City, Philippines",
        fields: "road class (major / minor)",
        transformations: "Overpass query for way[highway] in the Cebu City bounding box; classified major vs minor and kept as WGS 84 line GeoJSON.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "The awesome open dataset.", body: "OpenStreetMap is the prompt's whole subject: a global map built and owned by its users, free to anyone. Cebu—the country's oldest city—shows what that looks like at street level: a dense, living network maintained by local mappers." },
      { body: "The red arteries carry the city's traffic between port, centre and hills; the grey filigree is the residential grain where people actually live. None of it came from a government licence or a paywall—just the collective, patient work of the crowd." },
    ],
    publishedAt: "2026-11-21",
  },
  22: {
    dek: "The only map that doesn't lie about shape.",
    note: "Projections flatten a sphere, and every one of them distorts something—area, angle, distance. So this map refuses to flatten: the Philippines on a true globe you can spin.",
    figLabel: "DATA / PROJECTIONS — ON THE GLOBE",
    caption:
      "The Philippines returned to a sphere. Drag to rotate; the curvature you see is exactly what every flat projection has to stretch, shear or tear away.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <GlobeProjectionMap />,
      credit: {
        source: "Philippine land boundary (PSA/PSGC) on an ArcGIS 3D globe; keyless Esri basemap",
        license: "Open (PSA PSGC derived); Esri basemap — free to use",
        retrieved: "2026-11-22",
        coverage: "Philippines on a global 3D view",
        fields: "country polygon",
        transformations: "National outline draped on a 3D globe (SceneView, global viewing mode). No projection applied beyond the sphere itself.",
      },
    },
    essay: [
      { heading: "Every flat map is a compromise.", body: "You cannot flatten a sphere without tearing it—a theorem older than modern cartography. Mercator preserves angles but inflates the poles; equal-area maps keep size but bend shape. Each projection chooses what to sacrifice." },
      { body: "The globe sacrifices nothing except the convenience of a flat page. Seeing the Philippines on it is a reminder that the archipelago straddles a curved surface, and that every other map in this gallery has quietly agreed to distort that truth to lie flat." },
    ],
    publishedAt: "2026-11-22",
  },
  23: {
    dek: "A country you can taste by region.",
    note: "A taste map: ten regions, ten things they are known for—Cebu's lechon, Davao's durian, Vigan's empanada, Pampanga's sisig. Representative, flavourful, and unapologetically subjective.",
    figLabel: "DATA / TASTE — REGIONAL FLAVOURS",
    caption:
      "An illustrative taste map of the Philippines, each marker a dish a place is famous for. Not a dataset so much as a menu drawn across the islands.",
    media: {
      kind: "custom",
      bleed: true,
      illustrative: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[23]} />,
      credit: {
        source: "Iconic regional specialties compiled for an illustrative taste map",
        license: "Illustrative — public culinary references",
        retrieved: "2026-11-23",
        coverage: "Philippines; 10 indicative places",
        fields: "dish, place",
        transformations: "Well-known regional dishes placed at a representative city as WGS 84 points. Indicative, not exhaustive or survey data.",
      },
    },
    essay: [
      { heading: "Flavour has a geography.", body: "Filipino food is regional to its core: Cebu claims lechon, Davao durian, the Ilocos its bagnet and empanada, Pampanga the sizzling sisig that calls itself the culinary capital's own. Taste, mapped, becomes a tour of local pride." },
      { body: "This is a subjective map and says so—ten dishes could as easily be fifty. But that is also the honesty of the senses: a taste map is an argument about identity, and every Filipino will want to add their hometown's dish to it." },
    ],
    publishedAt: "2026-11-23",
  },
  24: {
    dek: "The capital's iron spine.",
    note: "Metro Manila's rail network—LRT-1, LRT-2, MRT-3 and the PNR commuter lines—drawn as the connected system it is meant to be. A network in the truest sense: nodes joined by routes.",
    figLabel: "DATA / NETWORK — METRO MANILA RAIL",
    caption:
      "The rail transit network of Metro Manila. Three light-rail and metro lines plus the PNR commuter services, each a coloured thread through the densest city in the country.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[24]} />,
      credit: {
        source: "OpenStreetMap contributors — transit route relations",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-24",
        coverage: "Metro Manila, Philippines",
        fields: "line",
        transformations: "Overpass query for light_rail/subway/train route relations in Metro Manila; member ways merged per line into WGS 84 line GeoJSON.",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "A network is routes plus the gaps between them.", body: "A transit map is the clearest everyday example of network thinking: lines that matter only where they connect. Metro Manila's rail spine—LRT-1 down the bay, LRT-2 across, MRT-3 along EDSA, the PNR running north–south—carries millions of daily trips." },
      { body: "Drawn together, the lines also expose what a network lacks: the parts of the metropolis they never reach. The story of Manila's transit is as much about the missing links as the built ones, which is why the map of the network is also a map of its ambitions." },
    ],
    publishedAt: "2026-11-24",
  },
  25: {
    dek: "When does data stop being a map?",
    note: "No basemap, no labels, no coastline—just 437 typhoon tracks glowing on deep blue. The storms swirl past the archipelago in pale threads, and the Philippines appears as the shape they bend around.",
    figLabel: "DATA / IS THIS A MAP? — TYPHOON TRACKS",
    caption:
      "A quarter-century of typhoon paths as abstract linework: every tropical cyclone that crossed the Philippine area since 2000, drawn on bare blue. Part dataset, part painting of the weather.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[25]} />,
      credit: {
        source: "NOAA IBTrACS — International Best Track Archive for Climate Stewardship (Western Pacific)",
        license: "IBTrACS — public domain (NOAA NCEI)",
        retrieved: "2026-11-25",
        coverage: "Western Pacific tracks crossing the PH area, 2000–2024",
        fields: "name, season, max_wind_kt",
        transformations: "Filtered IBTrACS WP storms (season ≥ 2000) passing through the Philippine area; each storm's fixes joined into a track line in WGS 84 GeoJSON (437 tracks).",
        url: "https://www.ncei.noaa.gov/products/international-best-track-archive",
      },
    },
    essay: [
      { heading: "The line between map and image.", body: "Strip a map of its scaffolding—coastline, graticule, labels—and what survives? Here, only the storms. Yet the Philippines materialises anyway, as the blank in the weave: the typhoons curve up from the Pacific and bend north around the islands, tracing their shape by absence." },
      { body: "The country sits in the world's most active tropical-cyclone basin, and twenty-five years of tracks make a dense, swirling fabric that reads first as art and only then as data. Whether you call it a map depends on whether a map needs a frame, or just needs to be true." },
    ],
    publishedAt: "2026-11-25",
  },
  26: {
    dek: "Mostly, the Philippines is water.",
    note: "The nation's Exclusive Economic Zone—the vast maritime territory it governs—draped over the archipelago. The land is the small part; the sea is the country too.",
    figLabel: "DATA / WATER — THE EEZ",
    caption:
      "The Philippine Exclusive Economic Zone. The blue expanse dwarfs the islands inside it—a reminder that this is a maritime nation first, a land one second.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[26]} />,
      credit: {
        source: "Marine Regions (Flanders Marine Institute / VLIZ) — world EEZ boundaries",
        license: "Marine Regions — CC BY 4.0",
        retrieved: "2026-11-26",
        coverage: "Philippine Exclusive Economic Zone",
        fields: "EEZ polygon",
        transformations: "Selected the Philippine EEZ polygon; simplified (~0.02°) and written as WGS 84 GeoJSON.",
        url: "https://www.marineregions.org/",
      },
    },
    essay: [
      { heading: "Seventy-one percent, made national.", body: "The prompt is water, and for the Philippines water is not a backdrop but the bulk of the country. Its Exclusive Economic Zone—reaching 200 nautical miles out—covers roughly two million square kilometres, many times the land area." },
      { body: "Inside that blue are fisheries that feed the nation, shipping lanes, and contested reefs. To draw the EEZ is to draw the real extent of the Philippines: an archipelagic state whose territory is mostly sea." },
    ],
    publishedAt: "2026-11-26",
  },
  27: {
    dek: "Press play on a quarter-century of shaking.",
    note: "A new tool for this gallery: the ArcGIS TimeSlider. The same 8,027 epicenters as Day 04, but animated—drag or play the slider and watch them accumulate from 2000 to 2026.",
    figLabel: "DATA / NEW TOOL — TIMESLIDER",
    caption:
      "Philippine seismicity through time. Use the slider to step or play through the years; epicenters build up cumulatively, revealing when and where the ground moved.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <QuakesTimeSliderMap />,
      credit: {
        source: "USGS ANSS ComCat — M4.5+ epicenters (2000–2026)",
        license: "USGS earthquake data — public domain",
        retrieved: "2026-11-27",
        coverage: "Philippine region, 2000–2026",
        fields: "mag, year, date",
        transformations: "Each epicenter stamped with a year date; the ArcGIS TimeSlider animates them cumulatively by year over the loaded GeoJSON.",
        url: "https://earthquake.usgs.gov/",
      },
    },
    essay: [
      { heading: "Trying a tool for the first time.", body: "The prompt asks you to add something new to your workflow. For this gallery that is the TimeSlider—a widget that binds a layer's time field to a playable control, turning a static scatter into a chronology." },
      { body: "Animated, the earthquakes stop being a single blurred mass and become a sequence: quiet stretches, then bursts around major events, each year adding its marks. The data hasn't changed since Day 04—only the tool, and with it, what you can see." },
    ],
    publishedAt: "2026-11-27",
  },
  28: {
    dek: "A country that prays.",
    note: "A feeling is hard to map, so this one maps faith—18,836 places of worship across the Philippines, Christian in red, Muslim in green. Devotion, rendered as a scatter of the sacred.",
    figLabel: "DATA / FEELING — PLACES OF WORSHIP",
    caption:
      "Every place of worship in the Philippines mapped by religion. The dense red is a Catholic-majority nation; the green knot in the south-west is the Muslim heartland of Mindanao and the Sulu archipelago.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <Arcgis2DMap config={dayMapConfigs[28]} />,
      credit: {
        source: "OpenStreetMap contributors — amenity = place_of_worship",
        license: "OpenStreetMap — ODbL",
        retrieved: "2026-11-28",
        coverage: "Philippines",
        fields: "religion (Christian / Muslim / other)",
        transformations: "Overpass query for places of worship across the PH; grouped by religion and kept as WGS 84 point GeoJSON (18,836 points).",
        url: "https://www.openstreetmap.org/",
      },
    },
    essay: [
      { heading: "Mapping the most abstract sense.", body: "How do you map a feeling? Faith is one of the deepest, and it leaves a physical trace: the churches, chapels, mosques and temples a community builds. Plotting them all turns private devotion into a visible pattern laid across the whole country." },
      { body: "The Philippines is one of the most religious nations on Earth, and the map shows it—an almost solid wash of red where Catholicism dominates, from Luzon through the Visayas. In the south-west, around the Bangsamoro and Sulu, the green of Islam concentrates into its own heartland. Belief, it turns out, has a geography you can feel." },
    ],
    publishedAt: "2026-11-28",
  },
  29: {
    dek: "The land, one pixel at a time.",
    note: "Pure raster: no points, no lines, no vectors at all—just true-colour satellite pixels. The lens settles on Taal, a volcano in a lake on an island in a lake on an island.",
    figLabel: "DATA / RASTER — SATELLITE PIXELS",
    caption:
      "Taal Volcano rendered as raw raster: true-colour satellite imagery and nothing else. Every detail here is a pixel streamed from orbit—the crater lake, Volcano Island, the surrounding caldera.",
    media: {
      kind: "custom",
      bleed: true,
      render: () => <SatelliteRasterMap />,
      credit: {
        source: "Esri World Imagery — true-colour satellite basemap (keyless)",
        license: "Esri World Imagery — free to use (imagery © providers)",
        retrieved: "2026-11-29",
        coverage: "Taal Volcano, Batangas, Philippines",
        fields: "RGB pixels",
        transformations: "Streamed the keyless World Imagery tile service over Taal Volcano; no vectors or overlays—pure raster imagery.",
        url: "https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9",
      },
    },
    essay: [
      { heading: "Do something cool with pixels.", body: "Every other map in this gallery draws vectors—points, lines, polygons. A raster is different: a grid of cells, each holding a value. The purest raster of all is a photograph from space, where each pixel is simply the colour of the ground beneath it." },
      { body: "Taal is the perfect subject—one of the world's smallest and most restless volcanoes, a nested puzzle of lake and island and crater. Shown as nothing but satellite pixels, it needs no labels or lines; the imagery itself is the map, geography rendered as pure colour from orbit." },
    ],
    publishedAt: "2026-11-29",
  },
};

export const getDay = (day: number): DayContent | undefined => days[day];
export const isPublished = (day: number): boolean => Boolean(days[day]);
export const publishedDayNumbers = (): number[] =>
  Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
