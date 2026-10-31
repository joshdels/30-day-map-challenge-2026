# CLAUDE.md

Guidance for Claude Code (and humans) working in this repo. The authoritative
project rules live in [`AGENTS.md`](./AGENTS.md) — read it first. This file is a
shorter, task-oriented companion.

## What this is

A **Philippines-first**, frontend-focused Next.js gallery for the November 2026
`#30DayMapChallenge`. One map a day, 30 days. Day 01 is published; days 02–30
stay as intentional "coming soon" routes until their content is authored.

## Stack (keep it boring)

- Next.js App Router at the repo root, TypeScript, React **server components by
  default**. Add `"use client"` only when a browser API or interaction needs it.
- Authored CSS in [`app/globals.css`](./app/globals.css). No Tailwind utility
  soup in markup, no CSS-in-JS.
- Shared prompt metadata: [`lib/challenge.ts`](./lib/challenge.ts). Never
  duplicate the 30-prompt list anywhere else.

## The day system (the important part)

Each published day is **one typed entry** in the day registry — you do not edit
the route component to publish a day.

- Prompt titles/descriptions → [`lib/challenge.ts`](./lib/challenge.ts) (fixed).
- Published map content → [`lib/days.tsx`](./lib/days.tsx) (the registry; source
  of truth for `isPublished`).
- Rendering → [`app/days/[day]/page.tsx`](./app/days/[day]/page.tsx) reads the
  registry; [`components/day-media.tsx`](./components/day-media.tsx) renders the
  map by `media.kind` (`image` | `video` | `webgis` | `custom`).

**To publish a day: add an entry to `days` in `lib/days.tsx`.** Nothing else.
Full walkthrough with copy-paste templates: [`docs/ADDING-DAYS.md`](./docs/ADDING-DAYS.md).

## Data honesty rules

- Center maps on the Philippines; use authoritative PH government / primary
  sources when you can.
- Every real dataset records source, license, retrieval date, coverage, fields,
  transformations — the `credit` field on a media entry does this.
- Never pass off synthetic/illustrative geometry as measured data. Mark it with
  `illustrative: true` (the UI shows a disclaimer).
- Keep API keys/tokens out of client source and Git — use env vars.

## Before you finish

Run from the repo root and make them pass:

```bash
npm run lint && npm run typecheck && npm run build
```

Then eyeball `/`, `/days/01` (published), an unpublished day (e.g. `/days/05`),
and an invalid route (e.g. `/days/99`). Check mobile width too.
