"use client";

/**
 * Day 22 — "Projections". Every flat map is a compromise; the only honest one
 * is the globe. This map drops the Philippines back onto a true sphere (a 3D
 * SceneView in global mode) so the curvature — the thing every projection must
 * distort away — is visible again.
 *
 * Keyless: gray basemap, no elevation needed. Lazy imports, destroyed on
 * unmount, Fullscreen control for screenshots.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

export function GlobeProjectionMap() {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const el = mapNodeRef.current;
    if (!el) return;
    let active = true;
    let view: __esri.SceneView | undefined;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      try {
        const [
          { default: esriConfig },
          { default: Map },
          { default: SceneView },
          { default: GeoJSONLayer },
          { default: Basemap },
          { default: TileLayer },
          { default: Fullscreen },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/SceneView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/Fullscreen"),
          import("@arcgis/core/core/reactiveUtils"),
          import("@esri/calcite-components/components/calcite-loader/customElement"),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";
        if (!active) return;

        const gray = new Basemap({
          baseLayers: [new TileLayer({ url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer" })],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        const country = new GeoJSONLayer({
          url: "/days/day18/country.geojson",
          title: "Philippines",
          renderer: {
            type: "simple",
            symbol: { type: "simple-fill", color: "rgba(228,50,43,0.85)", outline: { color: "#a50f15", width: 1 } },
          },
        });

        view = new SceneView({
          container: el,
          map: new Map({ basemap: gray, layers: [country] }),
          viewingMode: "global",
          qualityProfile: "medium",
          camera: { position: { x: 123, y: 12, z: 9_000_000 }, heading: 0, tilt: 18 },
          ui: { components: ["attribution", "zoom", "compass"] },
        });

        await view.when();
        if (!active) return;
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        const box = document.createElement("div");
        box.className = "map-source-box";
        box.innerHTML = `<span class="map-source-box-label">Data source</span><dl>
          <div><dt>Globe</dt><dd>3D sphere — the only undistorted \"projection\"</dd></div>
          <div><dt>Outline</dt><dd>Philippine land area (PSA/PSGC)</dd></div>
          <div><dt>Prompt</dt><dd>Drag to spin; every flat map flattens this</dd></div></dl>`;
        view.ui.add(box, "bottom-left");

        await Promise.race([
          reactiveUtils.whenOnce(() => view!.ready && !view!.updating).catch(() => {}),
          sleep(6000),
        ]);
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
    <div className="embedded-map arcgis-map" role="application" aria-label="The Philippines on a 3D globe, showing the curvature every flat projection must distort">
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error" ? <span>Map failed to load.</span> : createElement("calcite-loader", { label: "Loading globe", text: "Loading globe…", scale: "l", style: { "--calcite-color-brand": "var(--red)" } })}
        </div>
      )}
    </div>
  );
}
