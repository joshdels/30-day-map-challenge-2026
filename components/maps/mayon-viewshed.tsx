"use client";

/**
 * Day 05 — "Senses: Sight". An interactive 3D viewshed from the summit of
 * Mayon Volcano: everything the eye could reach from 2,462 m, computed live
 * against global terrain.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript **3D SceneView** (the first
 * 3D day) built as a client child of the day page. Uses the SDK's
 * ViewshedAnalysis to shade visible vs. hidden ground from an observer dome.
 *
 * AGENTS.md compliance:
 *   - Heavy ArcGIS modules are lazy-imported inside the effect.
 *   - The view is destroyed on unmount.
 *   - Keyless light-gray basemap + keyless Esri Terrain3D world elevation
 *     (elevation3d.arcgis.com) — no API key in client source.
 *   - View is centred on the Philippine study area (Bicol).
 *   - A themed "data source" panel docks bottom-left, reusing the site tokens.
 *
 * There is no bundled data file: the terrain is streamed from Esri's keyless
 * world-elevation service and the viewshed is computed client-side.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Mayon Volcano summit (WGS 84), with an observer height just above the crater.
const SUMMIT = { x: 123.6856, y: 13.2572, z: 2500 };

export function MayonViewshedMap() {
  // ArcGIS takes full ownership of `mapNodeRef` and mutates its DOM directly.
  // React must never render children into that node (the status overlay and the
  // source panel are siblings) or the two fight over the same nodes on unmount.
  const mapNodeRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const el = mapNodeRef.current;
    if (!el) return;
    let active = true;
    let view: __esri.SceneView | undefined;

    const startedAt = performance.now();
    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    (async () => {
      try {
        const [
          { default: esriConfig },
          { default: Map },
          { default: SceneView },
          { default: Basemap },
          { default: TileLayer },
          { default: ElevationLayer },
          { default: Ground },
          { default: ViewshedAnalysis },
          { default: Viewshed },
          { default: Point },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/SceneView"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/layers/ElevationLayer"),
          import("@arcgis/core/Ground"),
          import("@arcgis/core/analysis/ViewshedAnalysis"),
          import("@arcgis/core/analysis/Viewshed"),
          import("@arcgis/core/geometry/Point"),
          import("@arcgis/core/core/reactiveUtils"),
          // Registers the real Esri <calcite-loader> web component (side effect).
          import(
            "@esri/calcite-components/components/calcite-loader/customElement"
          ),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";

        if (!active) return;

        // Keyless light-gray basemap drapes over the terrain so landforms read
        // as shape, not colour.
        const gray = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
            }),
          ],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        // Keyless global terrain (Esri WorldElevation3D / Terrain3D) — the
        // surface the viewshed is traced across.
        const ground = new Ground({
          layers: [
            new ElevationLayer({
              url: "https://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
            }),
          ],
        });

        // A 360° view dome from the summit: what the whole horizon reveals.
        const viewshed = new Viewshed({
          observer: new Point({
            x: SUMMIT.x,
            y: SUMMIT.y,
            z: SUMMIT.z,
          }),
          farDistance: 45000,
          tilt: 90,
          heading: 0,
          horizontalFieldOfView: 360,
          verticalFieldOfView: 55,
        });
        const analysis = new ViewshedAnalysis({ viewsheds: [viewshed] });

        view = new SceneView({
          container: el,
          map: new Map({ basemap: gray, ground }),
          analyses: [analysis],
          qualityProfile: "high",
          camera: {
            // An oblique vantage south-west of the cone, looking north-east
            // across the summit toward Albay Gulf.
            position: { x: 123.58, y: 13.14, z: 7000 },
            heading: 35,
            tilt: 72,
          },
          ui: { components: ["attribution", "zoom", "compass", "navigation-toggle"] },
        });

        await view.when();
        if (!active) return;

        // Themed "data source" panel, docked bottom-left (a child box of the
        // map). Reuses the site tokens via the .map-source-box class.
        const sourceBox = document.createElement("div");
        sourceBox.className = "map-source-box";
        sourceBox.innerHTML = `
          <span class="map-source-box-label">Data source</span>
          <dl>
            <div><dt>Terrain</dt><dd>Esri WorldElevation3D / Terrain3D (global DEM)</dd></div>
            <div><dt>Observer</dt><dd>Mayon Volcano summit, ~2,462 m (Albay)</dd></div>
            <div><dt>Analysis</dt><dd>360° viewshed, 45 km range — computed in-browser</dd></div>
            <div><dt>Green</dt><dd>Visible from the summit · Red: hidden</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        // Keep the spinner up until the scene has finished its first draw.
        await reactiveUtils.whenOnce(() => !view!.updating);
        if (!active) return;

        // Keep the spinner on screen for at least ~1s so the loading animation
        // is actually seen.
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
      aria-label="Interactive 3D viewshed from the summit of Mayon Volcano, showing which ground is visible from the peak"
    >
      {/* Dedicated, child-free node that ArcGIS owns and mutates. */}
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading terrain",
                text: "Loading terrain…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
