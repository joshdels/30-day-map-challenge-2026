"use client";

/**
 * Day 06 — "Vintage". The Holocene volcanoes of the Philippines drawn as an
 * antique relief chart: sepia shaded terrain, a hand-ruled graticule, little
 * engraved cones and italic serif labels carrying each volcano's last-known
 * eruption year.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView, client child of
 * the day page (same pattern as Days 02–04). The "vintage" look is achieved
 * keylessly: Esri's free World Shaded Relief tiles, tinted sepia with a scoped
 * CSS filter (.vintage-map), plus a self-drawn graticule and engraved markers.
 *
 * Data is served statically from /public as WGS 84 GeoJSON:
 *   - /days/day06/volcanoes.geojson  (23 Holocene volcanoes; fields: name,
 *     type, last_eruption, elevation_m, subregion)
 *
 * AGENTS.md compliance: lazy imports, view destroyed on unmount, keyless tiles
 * (no API key), Philippine extent, themed source box.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Philippine archipelago centroid (WGS 84).
const CENTER: [number, number] = [122.8, 12.0];

export function VolcanoesVintageMap() {
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
          { default: GraphicsLayer },
          { default: Graphic },
          { default: Polyline },
          { default: Basemap },
          { default: TileLayer },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/layers/GraphicsLayer"),
          import("@arcgis/core/Graphic"),
          import("@arcgis/core/geometry/Polyline"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/core/reactiveUtils"),
          import(
            "@esri/calcite-components/components/calcite-loader/customElement"
          ),
        ]);
        esriConfig.assetsPath = "https://js.arcgis.com/4.33/@arcgis/core/assets";

        if (!active) return;

        // Keyless World Shaded Relief — grayscale terrain the CSS filter tints
        // to aged sepia.
        const relief = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer",
            }),
          ],
          title: "Shaded Relief",
          id: "esri-shaded-relief",
        });

        // Hand-ruled graticule: faint brown lines every 2° — the look of an
        // engraved chart.
        const graticule = new GraphicsLayer({ title: "Graticule" });
        const lineSym = {
          type: "simple-line" as const,
          color: [90, 62, 38, 0.35],
          width: 0.6,
          style: "solid" as const,
        };
        for (let lon = 114; lon <= 128; lon += 2) {
          graticule.add(
            new Graphic({
              geometry: new Polyline({
                paths: [[[lon, 2], [lon, 22]]],
              }),
              symbol: lineSym,
            }),
          );
        }
        for (let lat = 2; lat <= 22; lat += 2) {
          graticule.add(
            new Graphic({
              geometry: new Polyline({
                paths: [[[114, lat], [128, lat]]],
              }),
              symbol: lineSym,
            }),
          );
        }

        const volcanoes = new GeoJSONLayer({
          url: "/days/day06/volcanoes.geojson",
          title: "Holocene volcanoes",
          // An engraved cone: a dark sepia upward triangle, sized by elevation.
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              style: "triangle",
              color: [60, 40, 25, 0.92],
              outline: { color: [30, 20, 12, 1], width: 0.6 },
            },
            visualVariables: [
              {
                type: "size",
                field: "elevation_m",
                legendOptions: { title: "Elevation (m)" },
                stops: [
                  { value: 200, size: 9 },
                  { value: 1500, size: 15 },
                  { value: 2500, size: 24 },
                ],
              } as __esri.SizeVariableProperties,
            ],
          },
          labelingInfo: [
            {
              labelExpressionInfo: {
                expression:
                  "$feature.name + TextFormatting.NewLine + IIf(IsEmpty($feature.last_eruption), '', 'erupt. ' + $feature.last_eruption)",
              },
              symbol: {
                type: "text",
                color: [45, 30, 18, 1],
                haloColor: [239, 230, 208, 0.9],
                haloSize: 1,
                font: { family: "Georgia", style: "italic", size: 10 },
              },
              labelPlacement: "above-right",
            },
          ],
          popupTemplate: {
            title: "{name}",
            content:
              "{type}<br/>Elevation: {elevation_m} m<br/>Last eruption: {last_eruption}<br/>{subregion}",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({
            basemap: relief,
            layers: [graticule, volcanoes],
          }),
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
            <div><dt>Volcanoes</dt><dd>Smithsonian Global Volcanism Program (Holocene VOTW)</dd></div>
            <div><dt>Count</dt><dd>23 volcanoes · sized by elevation</dd></div>
            <div><dt>Relief</dt><dd>Esri World Shaded Relief (tinted)</dd></div>
            <div><dt>Labels</dt><dd>Last recorded eruption year</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        await volcanoes.when();
        if (!active || !view) return;

        const volcanoesLV = await view.whenLayerView(volcanoes);
        await reactiveUtils.whenOnce(() => !volcanoesLV.updating);
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
      className="embedded-map arcgis-map vintage-map"
      role="application"
      aria-label="Vintage-styled map of the Holocene volcanoes of the Philippines"
    >
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading chart",
                text: "Loading chart…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
