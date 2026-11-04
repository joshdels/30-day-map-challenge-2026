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
};

export const getDay = (day: number): DayContent | undefined => days[day];
export const isPublished = (day: number): boolean => Boolean(days[day]);
export const publishedDayNumbers = (): number[] =>
  Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
