import type { ReactNode } from "react";

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
  | { kind: "image"; src: string; alt: string; width?: number; height?: number; credit?: DataCredit; illustrative?: boolean }
  | { kind: "video"; src: string; poster?: string; embed?: boolean; credit?: DataCredit }
  | { kind: "webgis"; embedUrl: string; title: string; credit?: DataCredit }
  | { kind: "custom"; render: () => ReactNode; illustrative?: boolean; credit?: DataCredit };

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
};

export const getDay = (day: number): DayContent | undefined => days[day];
export const isPublished = (day: number): boolean => Boolean(days[day]);
export const publishedDayNumbers = (): number[] =>
  Object.keys(days)
    .map(Number)
    .sort((a, b) => a - b);
