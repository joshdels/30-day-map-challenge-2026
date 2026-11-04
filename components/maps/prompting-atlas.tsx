"use client";

/**
 * Day 10 — "Prompting only". The brief: make something start-to-finish in a
 * chat window. So this map is about its own making. Every map in this gallery
 * was authored by prompting an AI coding agent; here the first ten days are
 * plotted back onto the Philippines they describe — a self-portrait of the
 * project, generated the same way as everything else.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView, client child of
 * the day page (same skeleton as Days 02–09).
 *
 * Data: /days/day10/gallery-atlas.geojson (10 points; fields: day, theme,
 *   subject). Positions are representative of each day's subject, not measured
 *   data — see `illustrative`.
 *
 * AGENTS.md compliance: lazy imports, view destroyed on unmount, keyless
 * light-gray basemap, Philippine extent, themed source box.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

const CENTER: [number, number] = [122.8, 12.0];

export function PromptingAtlasMap() {
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
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/core/reactiveUtils"),
          import(
            "@esri/calcite-components/components/calcite-loader/customElement"
          ),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";

        if (!active) return;

        const gray = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
            }),
          ],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        const atlas = new GeoJSONLayer({
          url: "/days/day10/gallery-atlas.geojson",
          title: "The gallery, mapped",
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              style: "circle",
              size: 22,
              color: "#151513",
              outline: { color: "#e4322b", width: 2 },
            },
          },
          labelingInfo: [
            {
              labelExpressionInfo: {
                expression:
                  "$feature.day + TextFormatting.NewLine + $feature.theme",
              },
              symbol: {
                type: "text",
                color: "#151513",
                haloColor: "#ffffff",
                haloSize: 1.4,
                font: { family: "monospace", weight: "bold", size: 10 },
              },
              labelPlacement: "center-right",
            },
          ],
          popupTemplate: {
            title: "Day {day} — {theme}",
            content:
              "{subject}<br/><br/><i>Authored by prompting, like every map in this gallery.</i>",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: gray, layers: [atlas] }),
          center: CENTER,
          zoom: 5,
          constraints: { minZoom: 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        view.ui.move("zoom", "top-right");

        const sourceBox = document.createElement("div");
        sourceBox.className = "map-source-box";
        sourceBox.innerHTML = `
          <span class="map-source-box-label">Data source</span>
          <dl>
            <div><dt>Content</dt><dd>Days 1–10 of this gallery, plotted by subject</dd></div>
            <div><dt>Method</dt><dd>Written start-to-finish by prompting an AI agent</dd></div>
            <div><dt>Positions</dt><dd>Representative of each map's subject — illustrative</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        await atlas.when();
        if (!active || !view) return;
        if (atlas.fullExtent) {
          await view
            .goTo(atlas.fullExtent.clone().expand(1.2), { animate: false })
            .catch(() => {});
        }

        const atlasLV = await view.whenLayerView(atlas);
        await reactiveUtils.whenOnce(() => !atlasLV.updating);
        if (!active) return;

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
      aria-label="A self-referential map plotting the first ten days of this gallery onto the Philippines"
    >
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading atlas",
                text: "Loading atlas…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
