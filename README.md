# Joshua De Leon — 30 Day Map Challenge 2026

Joshua De Leon’s editorial web gallery for thirty days of cartographic experiments. Day 01, **Points**, is published; every remaining day has a stable coming-soon route.

## Routes

- `/` — the challenge intro and complete 30-day gallery index
- `/days/01` — the published Points map essay
- `/days/02` through `/days/30` — prompt-specific coming-soon pages

## Stack

- Native Next.js App Router application
- TypeScript and authored CSS
- Vercel-ready production runtime
- ArcGIS Maps SDK for JavaScript for future interactive Web GIS maps (see `AGENTS.md`)

## Development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

The local app is served at `http://localhost:3000` by default.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Deploying to Vercel

Import the repository in Vercel and keep the repository root as the Root Directory. Vercel detects Next.js from `vercel.json` and uses `npm run build`; no custom Output Directory is required.

Project conventions, Philippines data rules, Web GIS requirements, and agent-friendly interaction guidance are documented in [`AGENTS.md`](./AGENTS.md).

## Adding a day (the data)

Publishing a day is **data, not code**: you add one typed entry to the day
registry and the page builds itself. You never edit the route component.

- **Registry (source of truth):** [`lib/days.tsx`](./lib/days.tsx) — add an
  entry keyed by the day number (`1`–`30`). Day 01 is in there as a worked
  example.
- **Prompt titles/descriptions:** [`lib/challenge.ts`](./lib/challenge.ts)
  (fixed list — never duplicated).
- **Renderer:** [`components/day-media.tsx`](./components/day-media.tsx) draws
  the map from `media.kind`.

Each entry picks one `media.kind`:

| kind     | use for                           | where the asset lives                          |
| -------- | --------------------------------- | ---------------------------------------------- |
| `image`  | an exported map (PNG/JPG/SVG)     | a file in `public/` (e.g. `public/maps/day-02.png`) |
| `video`  | a recording/animation             | a file in `public/`, or a YouTube/Vimeo embed URL |
| `webgis` | an *externally hosted* live map   | an `embedUrl` (rendered as an iframe)          |
| `custom` | an *in-repo* interactive map/SVG  | a `"use client"` child component in this repo  |

**In-repo WebGIS** (interactive map inside this app, no separate repo) uses the
`custom` kind pointed at a client component — see
[`components/maps/embedded-map.tsx`](./components/maps/embedded-map.tsx) for a
copy-ready template with the ArcGIS lazy-load + cleanup pattern.

Days with no registry entry stay "coming soon" automatically.

**Full walkthrough with copy-paste templates for every media kind and the
data-provenance (`credit`) rules:** [`docs/ADDING-DAYS.md`](./docs/ADDING-DAYS.md).

After adding a day:

```bash
npm run lint && npm run typecheck && npm run build
```

Then commit and push; Vercel deploys automatically.
