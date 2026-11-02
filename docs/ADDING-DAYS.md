# How to add a day (Day 01 → Day 30)

Everything about a published day lives in **one place**:
[`lib/days.tsx`](../lib/days.tsx), the *day registry*.

You never touch the route component to publish a day. You add a typed entry and
the page builds itself: title and theme come from `lib/challenge.ts`, and the
map is rendered by `components/day-media.tsx` based on the `media.kind` you pick.

- A day **with** an entry → renders a full map essay at `/days/NN`.
- A day **without** an entry → stays a tidy "coming soon" route. (Don't delete
  routes or add broken links.)

---

## The 60-second version

1. Put your map asset somewhere the app can serve it:
   - **Image/video file** → drop it in [`public/`](../public) (e.g.
     `public/maps/day-02.png`). It is then served at `/maps/day-02.png`.
   - **WebGIS / video embed** → just have the embed URL.
2. Open `lib/days.tsx` and add an entry keyed by the day number.
3. Run `npm run lint && npm run typecheck && npm run build`.

That's it. The homepage gallery card for that day automatically flips to "live".

---

## Full-bleed media (the stage rule)

Published media **fills the whole stage edge-to-edge** — no coloured backing
showing through, no padding, no partial sizing. The caption + `credit` render
*below* the stage. This is automatic for `image`, `video`, and `webgis`. A
`custom` day (e.g. an in-repo ArcGIS map) opts in by setting `bleed: true` on the
media object; omit it (or leave it `false`) to keep the framed editorial look
Day 01 uses. See AGENTS.md → "Published media fills its stage".

## The four media kinds

Pick exactly **one** `media.kind` per day.

### 1. `image` — a map exported as a picture (PNG / JPG / SVG)

The most common case: you made a map in QGIS/ArcGIS/Figma and exported it.

```tsx
2: {
  dek: "Every road is a decision someone made.",
  note: "Tracing the national road network as a single continuous gesture.",
  caption: "Primary and secondary roads of Luzon, generalised at 1:500,000.",
  media: {
    kind: "image",
    src: "/maps/day-02.png",        // file lives in public/maps/
    alt: "Map of Luzon road network as thin red lines on a dark ground.",
    width: 1600,
    height: 1000,
    credit: {
      source: "DPWH Road Network 2024",
      license: "Open Government Data",
      retrieved: "2026-10-20",
      coverage: "Philippines, Luzon",
      fields: "road_class, length_km",
      transformations: "Dissolved by class; simplified 50m; reprojected to WGS 84.",
      url: "https://www.dpwh.gov.ph/",
    },
  },
  essay: [
    { heading: "Lines are arguments.", body: "..." },
    { body: "..." },
  ],
  publishedAt: "2026-11-02",
},
```

Always write a real `alt` — it is the map's text alternative (accessibility +
AGENTS.md requirement).

### 2. `video` — a screen recording or animation

Local file **or** a YouTube/Vimeo embed. The renderer auto-detects: a
YouTube/Vimeo URL becomes an `<iframe>`, anything else becomes a `<video>`.

```tsx
media: {
  kind: "video",
  src: "/maps/day-03-timelapse.mp4",  // or "https://www.youtube.com/embed/XXXX"
  poster: "/maps/day-03-poster.jpg",   // optional, for local files
  // embed: true,                       // force iframe if auto-detect is wrong
  credit: { /* same shape as above */ },
},
```

Use the `/embed/` form of a YouTube URL (`youtube.com/embed/<id>`), not the
`watch?v=` form.

### 3. `webgis` — an interactive web map (iframe embed)

For an ArcGIS Online / Experience Builder / Felt / Kepler map you host
elsewhere, embed it by URL:

```tsx
media: {
  kind: "webgis",
  embedUrl: "https://your-arcgis-item/embed",
  title: "Interactive flood-exposure map of Metro Manila",
  credit: { /* ... */ },
},
```

> **In-repo WebGIS (no separate repo).** To build the interactive map *inside*
> this Next.js app instead of embedding an external URL, use the `custom` kind
> pointed at a `"use client"` child component. A copy-ready template with the
> ArcGIS lazy-load + unmount-cleanup pattern lives at
> [`components/maps/embedded-map.tsx`](../components/maps/embedded-map.tsx):
>
> ```tsx
> import { EmbeddedMap } from "@/components/maps/embedded-map";
> // ...
> media: { kind: "custom", render: () => <EmbeddedMap /> },
> ```
>
> The map must be a client component (interactive maps need browser APIs),
> lazy-load its heavy modules, and destroy the view on unmount — see AGENTS.md
> and the comments in that template. Start with an external embed; graduate to an
> in-repo component when a day needs real interactivity.

### 4. `custom` — anything else (inline SVG, chart, your own component)

Day 01 uses this to render the `<PhilippinesPoints/>` SVG. Return any React
node from `render()`.

```tsx
media: {
  kind: "custom",
  illustrative: true,   // set when the geometry is synthetic, not measured
  render: () => <MyDayFiveChart />,
},
```

If the graphic is **not** real measured data, set `illustrative: true` so the UI
shows the "synthetic geometry, not measured data" disclaimer (AGENTS.md).

---

## Field notes (`essay`)

`essay` is an array of blocks rendered in order. First block usually has a
`heading`; later blocks are just `body` paragraphs.

```tsx
essay: [
  { heading: "A country is more than its outline.", body: "Start with a dot..." },
  { body: "This study treats the map as a constellation..." },
],
```

---

## The `credit` block (data provenance)

Required for any entry showing **real data**. Optional for clearly-labelled
illustrative graphics. Shape:

| field             | meaning                                   | example                      |
| ----------------- | ----------------------------------------- | ---------------------------- |
| `source`          | dataset + origin                          | `"PSA 2020 Census"`          |
| `license`         | usage terms                               | `"CC BY 4.0"`                |
| `retrieved`       | ISO date you pulled it                     | `"2026-10-20"`               |
| `coverage`        | geographic extent                         | `"Philippines, national"`    |
| `fields`          | key attributes used (optional)            | `"pop_total, region"`        |
| `transformations` | processing you applied (optional)         | `"Aggregated to region."`    |
| `url`             | link to the source (optional)             | `"https://psa.gov.ph/"`      |

Prefer Philippine government / authoritative primary sources.

---

## Checklist before committing

- [ ] Asset is in `public/` (for file-based media) and loads at its URL.
- [ ] Entry added to `days` in `lib/days.tsx`, keyed by the day number.
- [ ] `alt` / `title` text is written and meaningful.
- [ ] `credit` filled for real data; `illustrative: true` for synthetic.
- [ ] `npm run lint && npm run typecheck && npm run build` all pass.
- [ ] Checked `/days/NN` on desktop and mobile width.
