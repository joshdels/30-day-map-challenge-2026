"use client";

/**
 * Shared 2D map shell for the gallery's data days.
 *
 * Most days are the same recipe: a keyless Esri basemap, one or more GeoJSON
 * layers with a renderer, an optional legend, a themed "data source" box, and
 * a fit-to-data view. This component captures that recipe so each day is driven
 * by a small, serialisable `MapConfig` (plain data — safe to pass from the
 * server day registry) instead of a hand-written 200-line clone.
 *
 * Every map built through this shell gets a **Fullscreen** control (top-right)
 * so any day can be expanded edge-to-edge for a clean screenshot.
 *
 * AGENTS.md compliance: lazy ArcGIS imports, view destroyed on unmount, keyless
 * basemaps (no API key), Philippine extents, themed source box via the shared
 * .map-source-box tokens.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

export type SourceRow = [label: string, value: string];

export type MapConfig = {
  ariaLabel: string;
  center: [number, number];
  zoom: number;
  minZoom?: number;
  /** Keyless basemap: muted gray (default), shaded relief, hillshade, or none
   *  (a bare canvas for data-as-art / inverted days). */
  basemap?: "gray" | "relief" | "hillshade" | "none";
  /** Background colour for the map node (used mainly with basemap "none"). */
  background?: string;
  /** GeoJSONLayer property objects — renderer, labels, clustering, popups. */
  layers: __esri.GeoJSONLayerProperties[];
  /** Show the Esri legend (bottom-right). */
  legend?: boolean;
  /** Fit the initial view to this layer's extent (index into `layers`). */
  fitToLayerIndex?: number | null;
  /** Apply the Day-06 sepia "vintage" tint to the whole canvas. */
  vintage?: boolean;
  sourceBox: { rows: SourceRow[] };
  /** Loader caption, e.g. "Loading rivers". */
  loadingLabel?: string;
};

const BASEMAP_URL: Record<"gray" | "relief" | "hillshade", string> = {
  gray: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
  relief:
    "https://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer",
  hillshade:
    "https://services.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer",
};

export function Arcgis2DMap({ config }: { config: MapConfig }) {
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
          import(
            "@esri/calcite-components/components/calcite-loader/customElement"
          ),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";
        if (!active) return;

        const kind = config.basemap ?? "gray";
        const basemap =
          kind === "none"
            ? null
            : new Basemap({
                baseLayers: [new TileLayer({ url: BASEMAP_URL[kind] })],
                title: "Basemap",
                id: "esri-keyless-base",
              });

        const layers = config.layers.map((l) => new GeoJSONLayer(l));

        view = new MapView({
          container: el,
          map: new Map(basemap ? { basemap, layers } : { layers }),
          center: config.center,
          zoom: config.zoom,
          constraints: { minZoom: config.minZoom ?? 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        if (config.legend) view.ui.add(new Legend({ view }), "bottom-right");
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        const box = document.createElement("div");
        box.className = "map-source-box";
        box.innerHTML =
          `<span class="map-source-box-label">Data source</span><dl>` +
          config.sourceBox.rows
            .map(
              ([k, v]) =>
                `<div><dt>${escapeHtml(k)}</dt><dd>${escapeHtml(v)}</dd></div>`,
            )
            .join("") +
          `</dl>`;
        view.ui.add(box, "bottom-left");

        const fitIdx = config.fitToLayerIndex;
        if (fitIdx != null && layers[fitIdx]) {
          const fitLayer = layers[fitIdx];
          await fitLayer.when().catch(() => {});
          if (!active || !view) return;
          if (fitLayer.fullExtent) {
            await view
              .goTo(fitLayer.fullExtent.clone().expand(1.12), { animate: false })
              .catch(() => {});
          }
        }

        // Reveal once the first layer has drawn, racing a hard timeout so a
        // slow tile/data stream never spins forever.
        const first = layers[0];
        if (first) {
          const lv = await view.whenLayerView(first).catch(() => undefined);
          if (lv) {
            await Promise.race([
              reactiveUtils.whenOnce(() => !lv.updating).catch(() => {}),
              sleep(6000),
            ]);
          }
        }
        if (!active) return;

        const elapsed = performance.now() - startedAt;
        if (elapsed < 900) await sleep(900 - elapsed);
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
  }, [config]);

  return (
    <div
      className={
        "embedded-map arcgis-map" + (config.vintage ? " vintage-map" : "")
      }
      role="application"
      aria-label={config.ariaLabel}
    >
      <div
        ref={mapNodeRef}
        className="arcgis-map-node"
        style={config.background ? { background: config.background } : undefined}
      />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error" ? (
            <span>Map failed to load.</span>
          ) : (
            createElement("calcite-loader", {
              label: config.loadingLabel ?? "Loading map",
              text: (config.loadingLabel ?? "Loading map") + "…",
              scale: "l",
              style: { "--calcite-color-brand": "var(--red)" },
            })
          )}
        </div>
      )}
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
