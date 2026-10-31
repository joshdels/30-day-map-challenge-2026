"use client";

/**
 * In-repo WebGIS template — a CHILD component of the day page, not a separate repo.
 *
 * This is the pattern to copy for an interactive map that lives inside this
 * Next.js app. Reference it from a day entry with the `custom` media kind:
 *
 *   // lib/days.tsx
 *   media: { kind: "custom", render: () => <EmbeddedMap /> }
 *
 * Why a client component? Interactive maps touch browser-only APIs
 * (the DOM, the ArcGIS SDK), so they must run on the client. Server
 * components (the default here) can't do that — hence "use client" above.
 *
 * ── Upgrading this to a real ArcGIS map ────────────────────────────────
 * 1. Install the SDK:  npm i @arcgis/core
 * 2. In the effect below, lazy-import the heavy modules so the gallery
 *    homepage stays fast (AGENTS.md: "Lazy-load heavy map modules"):
 *
 *      const [{ default: Map }, { default: MapView }] = await Promise.all([
 *        import("@arcgis/core/Map"),
 *        import("@arcgis/core/views/MapView"),
 *      ]);
 *      const view = new MapView({
 *        container: el,
 *        map: new Map({ basemap: "topo-vector" }),
 *        center: [121.77, 12.88],   // Philippines
 *        zoom: 5,
 *        constraints: { minZoom: 5 }, // keep the study area in view
 *      });
 *
 * 3. Return a cleanup that destroys the view (AGENTS.md: "Destroy map
 *    views and handles on component unmount"):
 *
 *      return () => view.destroy();
 *
 * Until then, this file renders a lightweight interactive placeholder so
 * the route builds and you can see where the map will go.
 */

import { useEffect, useRef, useState } from "react";

export function EmbeddedMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let active = true;

    // This is where ArcGIS modules would be lazy-imported and a view created.
    // The `active` flag guards against the effect resolving after unmount.
    (async () => {
      if (active) setReady(true);
    })();

    // Cleanup runs on unmount — destroy the map view / handles here.
    return () => {
      active = false;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="embedded-map"
      role="application"
      aria-label="Interactive map of the Philippines"
    >
      <span className="embedded-map-status">
        {ready ? "Interactive map ready — swap in your ArcGIS view here." : "Loading map…"}
      </span>
    </div>
  );
}
