"use client";

/**
 * Day 29 — "Raster". Do something cool with pixels. The most literal raster of
 * all: true-colour satellite imagery. This map drops every vector mark and
 * shows nothing but pixels — Esri's keyless World Imagery over Taal Volcano,
 * the island-in-a-lake-on-an-island-in-a-lake that is one of the most
 * photogenic rasters in the Philippines.
 *
 * Keyless (World Imagery tiles), lazy imports, destroyed on unmount, Fullscreen.
 * There is no bundled data file — the raster streams from the tile service.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Taal Volcano, Batangas — the crater lake and its central Volcano Island.
const CENTER: [number, number] = [120.993, 14.002];

export function SatelliteRasterMap() {
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const el = mapNodeRef.current;
    if (!el) return;
    let active = true;
    let view: __esri.MapView | undefined;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    (async () => {
      try {
        const [
          { default: esriConfig },
          { default: Map },
          { default: MapView },
          { default: Basemap },
          { default: TileLayer },
          { default: Fullscreen },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/Fullscreen"),
          import("@arcgis/core/core/reactiveUtils"),
          import("@esri/calcite-components/components/calcite-loader/customElement"),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";
        if (!active) return;

        // Keyless true-colour satellite imagery (Esri World Imagery) — raw pixels.
        const imagery = new Basemap({
          baseLayers: [new TileLayer({ url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer" })],
          title: "World Imagery",
          id: "esri-world-imagery",
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: imagery }),
          center: CENTER,
          zoom: 13,
          constraints: { minZoom: 9, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        const box = document.createElement("div");
        box.className = "map-source-box";
        box.innerHTML = `<span class="map-source-box-label">Data source</span><dl>
          <div><dt>Raster</dt><dd>Esri World Imagery (true-colour satellite)</dd></div>
          <div><dt>Scene</dt><dd>Taal Volcano &amp; crater lake, Batangas</dd></div>
          <div><dt>Pixels</dt><dd>No vectors — only imagery tiles</dd></div></dl>`;
        view.ui.add(box, "bottom-left");

        await Promise.race([
          reactiveUtils.whenOnce(() => !view!.updating).catch(() => {}),
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
    <div className="embedded-map arcgis-map" role="application" aria-label="True-colour satellite imagery of Taal Volcano, a pure raster map">
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error" ? <span>Map failed to load.</span> : createElement("calcite-loader", { label: "Loading imagery", text: "Loading imagery…", scale: "l", style: { "--calcite-color-brand": "var(--red)" } })}
        </div>
      )}
    </div>
  );
}
