import type { ReactNode } from "react";
import { TagumWatershedMap } from "@/components/maps/tagum-watershed";
import { RegionsPovertyMap } from "@/components/maps/regions-poverty";

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
};

export const getDay = (day: number): DayContent | undefined => days[day];
export const isPublished = (day: number): boolean => Boolean(days[day]);
export const publishedDayNumbers = (): number[] =>
  Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
