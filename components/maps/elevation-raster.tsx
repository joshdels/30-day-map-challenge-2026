"use client";

/**
 * Day 29 — "Raster". Do something with pixels. This map drops the vector marks
 * entirely and renders the land itself as a raster: Esri's global elevation
 * imagery (keyless Terrain3D), stretched through a hypsometric colour ramp so
 * every pixel's height reads as colour — lowlands green, mountains brown, the
 * highest summits pale.
 *
 * Keyless, lazy imports, destroyed on unmount, Fullscreen control.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

export function ElevationRasterMap() {
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
          { default: ImageryTileLayer },
          { default: Basemap },
          { default: TileLayer },
          { default: Fullscreen },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/ImageryTileLayer"),
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

        // Hypsometric ramp: sea-level green → brown uplands → pale peaks.
        const elevation = new ImageryTileLayer({
          url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
          title: "Elevation (raster)",
          opacity: 0.92,
          renderer: {
            type: "raster-stretch",
            stretchType: "min-max",
            statistics: [{ min: 0, max: 2900, avg: 400, stddev: 400 }],
            colorRamp: {
              type: "multipart",
              colorRamps: [
                { fromColor: [1, 102, 94], toColor: [120, 170, 90] },
                { fromColor: [120, 170, 90], toColor: [223, 194, 125] },
                { fromColor: [223, 194, 125], toColor: [140, 81, 10] },
                { fromColor: [140, 81, 10], toColor: [245, 245, 240] },
              ],
            },
          },
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: gray, layers: [elevation] }),
          center: [122.8, 12.0],
          zoom: 6,
          constraints: { minZoom: 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        const box = document.createElement("div");
        box.className = "map-source-box";
        box.innerHTML = `<span class="map-source-box-label">Data source</span><dl>
          <div><dt>Raster</dt><dd>Esri WorldElevation3D / Terrain3D (DEM)</dd></div>
          <div><dt>Render</dt><dd>Per-pixel height → hypsometric colour</dd></div>
          <div><dt>Pixels</dt><dd>Green lowlands · brown uplands · pale peaks</dd></div></dl>`;
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
    <div className="embedded-map arcgis-map" role="application" aria-label="Raster elevation map of the Philippines with a hypsometric colour ramp">
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error" ? <span>Map failed to load.</span> : createElement("calcite-loader", { label: "Loading raster", text: "Loading raster…", scale: "l", style: { "--calcite-color-brand": "var(--red)" } })}
        </div>
      )}
    </div>
  );
}
