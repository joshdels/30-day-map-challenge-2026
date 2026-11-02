"use client";

/**
 * Day 02 — Tagum–Saug watershed stream network, classified by Strahler order.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript **2D MapView** built as a
 * client child of the day page (see docs/ADDING-DAYS.md → "In-repo WebGIS").
 * Opens zoom-fit to the whole watershed boundary.
 *
 * Data is served statically from /public as WGS 84 GeoJSON:
 *   - /days/day02/streams.geojson  (1,411 stream segments, field: strahler 1–5)
 *   - /days/day02/basin.geojson    (watershed boundary, 1 polygon)
 *
 * AGENTS.md compliance:
 *   - Heavy ArcGIS modules are lazy-imported inside the effect so the gallery
 *     homepage stays fast.
 *   - The view + animation frame are destroyed on unmount.
 *   - Keyless light-gray basemap (CARTO Positron) — no API key in client source.
 *   - View is centred/constrained on the Philippine study area.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Tagum–Saug watershed centroid (WGS 84) — the point the camera orbits.
const CENTER: [number, number] = [125.6913, 7.713];

// Strahler order → line colour (light→dark blue) and width. A light-gray
// basemap keeps these the only saturated marks on the map.
const STRAHLER_STYLE: Record<number, { color: string; width: number }> = {
  1: { color: "#9ecae1", width: 0.8 },
  2: { color: "#6baed6", width: 1.3 },
  3: { color: "#3182bd", width: 2 },
  4: { color: "#08519c", width: 3 },
  5: { color: "#08306b", width: 4.2 },
};

export function TagumWatershedMap() {
  // ArcGIS takes full ownership of `mapNodeRef` and mutates its DOM directly.
  // React must never render children into that node (the status overlay is a
  // sibling) or the two fight over the same nodes on unmount.
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const el = mapNodeRef.current;
    if (!el) return;
    let active = true;
    let view: __esri.MapView | undefined;

    const startedAt = performance.now();
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      try {
        const [
          { default: esriConfig },
          { default: Map },
          { default: MapView },
          { default: GeoJSONLayer },
          { default: Basemap },
          { default: TileLayer },
          { default: Legend },
          { default: Fullscreen },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/Legend"),
          import("@arcgis/core/widgets/Fullscreen"),
          import("@arcgis/core/core/reactiveUtils"),
          // Registers the real Esri <calcite-loader> web component (side effect).
          import(
            "@esri/calcite-components/components/calcite-loader/customElement"
          ),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";

        if (!active) return;

        // Keyless light-gray basemap (Esri "World Light Gray Base", a free
        // cached tile service — no API key). Its muted ground lets the blue
        // Strahler lines read as the only saturated marks.
        const gray = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
            }),
          ],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        const basin = new GeoJSONLayer({
          url: "/days/day02/basin.geojson",
          title: "Watershed boundary",
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-line",
              color: "#e4322b",
              width: 2,
            },
          },
        });

        const streams = new GeoJSONLayer({
          url: "/days/day02/streams.geojson",
          title: "Streams (Strahler order)",
          renderer: {
            type: "unique-value",
            field: "strahler",
            legendOptions: { title: "Strahler stream order" },
            uniqueValueInfos: Object.entries(STRAHLER_STYLE).map(
              ([order, s]) => ({
                value: Number(order),
                label: `Order ${order}`,
                symbol: {
                  type: "simple-line",
                  color: s.color,
                  width: s.width,
                },
              }),
            ),
          },
          popupTemplate: {
            title: "Stream segment",
            content: "Strahler order: {strahler}",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({
            basemap: gray,
            layers: [basin, streams],
          }),
          center: CENTER,
          zoom: 10,
          constraints: { minZoom: 8, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        view.ui.add(new Legend({ view }), "bottom-right");
        // Zoom + fullscreen grouped together, top-right.
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        // Frame the whole watershed boundary once it has loaded (no rotation).
        await basin.when();
        if (!active || !view) return;
        if (basin.fullExtent) {
          await view
            .goTo(basin.fullExtent.clone().expand(1.15), { animate: false })
            .catch(() => {});
        }

        // Keep the spinner up until the stream layer has actually drawn (its
        // layer view has finished its first update), not just downloaded.
        const streamsLV = await view.whenLayerView(streams);
        await reactiveUtils.whenOnce(() => !streamsLV.updating);
        if (!active) return;

        // Keep the spinner on screen for at least ~1s so the loading animation
        // is actually seen, even when the data draws almost instantly.
        const elapsed = performance.now() - startedAt;
        if (elapsed < 1000) await sleep(1000 - elapsed);
        if (!active) return;

        setStatus("ready");
      } catch {
        if (active) setStatus("error");
      }
    })();

    return () => {
      active = false;
      view?.destroy();
      view = undefined;
    };
  }, []);

  return (
    <div
      className="embedded-map arcgis-map"
      role="application"
      aria-label="Interactive map of the Tagum–Saug watershed stream network, classified by Strahler order"
    >
      {/* Dedicated, child-free node that ArcGIS owns and mutates. */}
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading watershed",
                text: "Loading watershed…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
