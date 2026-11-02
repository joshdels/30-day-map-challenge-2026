import type { ReactNode } from "react";
import { TagumWatershedMap } from "@/components/maps/tagum-watershed";

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
};

export const getDay = (day: number): DayContent | undefined => days[day];
export const isPublished = (day: number): boolean => Boolean(days[day]);
export const publishedDayNumbers = (): number[] =>
  Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
