# 30 Day Map Challenge 2026 — Project Guide

## Product

This repository is a 30-day cartographic gallery for the November 2026 `#30DayMapChallenge`. It is Philippines-first: every published map, dataset, default map extent, example, place name, and narrative should focus on the Philippines unless a challenge prompt explicitly requires a comparison.

Day 01 is published first. Days 02–30 must remain valid, intentional “coming soon” routes until their work is ready. Do not replace unpublished routes with broken links or placeholder lorem ipsum.

## Stack

- Use native Next.js App Router at the repository root, TypeScript, React, and authored CSS in `app/globals.css`. The production target is Vercel.
- Keep shared challenge metadata in `lib/challenge.ts`; do not duplicate the prompt list across routes.
- Build pages responsively and accessibly. Preserve semantic headings, keyboard-visible links and controls, reduced-motion behavior, and meaningful map alternatives/captions.
- Prefer server components. Add client components only where an interaction or ArcGIS browser API requires them.

## Web GIS

- Interactive web maps should use the latest stable **ArcGIS Maps SDK for JavaScript** available when that day is implemented. As of 2026-10-31, the current documented release line is **5.1**.
- Use supported npm packages (`@arcgis/core`, `@arcgis/map-components`, and `@esri/calcite-components` when needed), rather than legacy CDN/AMD patterns.
- Pin package versions through the lockfile. Before upgrading the SDK, check Esri's official release notes and version matrix, then build and test every published map route.
- Center default views on the Philippines and constrain initial scales/extents to the Philippine study area. Use WGS 84 for interchange unless a dataset or analysis requires a documented projected CRS.
- Every operational layer must record its source, license/usage terms, retrieval date, geographic coverage, key fields, and any transformations. Prefer Philippine government or other authoritative primary sources when available.
- Never silently imply invented sample geometry is measured data. Label illustrative or synthetic data clearly.
- Keep API keys and tokens out of client source and Git. Use environment variables and restrict keys by referrer and service scope.
- Lazy-load heavy map modules on map routes so the gallery homepage stays fast. Destroy map views and handles on component unmount.

## Agent-friendly behavior

- Give interactive controls stable accessible names and expose important state in text, not only through color or the canvas.
- Keep routes predictable (`/days/01` through `/days/30`) and preserve deep links.
- When adding an agentic or natural-language map tool, require explicit confirmation before edits, downloads, sharing, or other consequential actions; show the interpreted query and active filters in the UI.

## Verification

- Run `npm run lint`, `npm run typecheck`, and `npm run build` from the repository root after route, component, dependency, or map changes.
- Test `/`, `/days/01`, at least one unpublished day, and an invalid day route.
- Check desktop and mobile layouts. For interactive maps, also verify loading, empty, error, keyboard, and reduced-motion states.
