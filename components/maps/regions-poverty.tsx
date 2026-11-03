"use client";

/**
 * Day 03 — Regional poverty incidence, 2023 (PSA), drawn as polygons.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView built as a
 * client child of the day page — the same pattern as Day 02's watershed map
 * (see components/maps/tagum-watershed.tsx and docs/ADDING-DAYS.md).
 *
 * Each of the Philippines' 17 regions is represented by one of its provinces,
 * shaded by that region's 2023 full-year poverty incidence (PSA). The data is
 * served statically from /public as WGS 84 GeoJSON:
 *   - /days/day03/regions-poverty.geojson  (17 polygons, field: pov_incidence_2023)
 *
 * AGENTS.md compliance:
 *   - Heavy ArcGIS modules are lazy-imported inside the effect so the gallery
 *     homepage stays fast.
 *   - The view is destroyed on unmount.
 *   - Keyless light-gray basemap (Esri World Light Gray Base) — no API key.
 *   - View is centred/constrained on the Philippine study area.
 *   - A themed "data source" panel docks bottom-left, reusing the site tokens.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Philippine archipelago centroid (WGS 84) — the initial view centre.
const CENTER: [number, number] = [122.5, 11.8];

// Sequential class breaks for 2023 poverty incidence (% of population).
// Light → deep red: a sequential ramp built around the site --red accent, so
// darker = poorer. Five classes keep the legend readable at a glance.
const POVERTY_CLASSES: { min: number; max: number; color: string; label: string }[] = [
  { min: -1, max: 5, color: "#fee5d9", label: "Under 5%" },
  { min: 5, max: 10, color: "#fcae91", label: "5 – 10%" },
  { min: 10, max: 15, color: "#fb6a4a", label: "10 – 15%" },
  { min: 15, max: 20, color: "#de2d26", label: "15 – 20%" },
  { min: 20, max: 100, color: "#a50f15", label: "20% and over" },
];

export function RegionsPovertyMap() {
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
        // cached tile service — no API key). Its muted ground lets the red
        // poverty ramp read as the only saturated marks.
        const gray = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
            }),
          ],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        const regions = new GeoJSONLayer({
          url: "/days/day03/regions-poverty.geojson",
          title: "Poverty incidence 2023 (%)",
          renderer: {
            type: "class-breaks",
            field: "pov_incidence_2023",
            legendOptions: { title: "Poverty incidence, 2023 (%)" },
            defaultSymbol: {
              type: "simple-fill",
              color: "#dddddd",
              outline: { color: "#ffffff", width: 0.6 },
            },
            classBreakInfos: POVERTY_CLASSES.map((c) => ({
              minValue: c.min,
              maxValue: c.max,
              label: c.label,
              symbol: {
                type: "simple-fill",
                color: c.color,
                outline: { color: "#ffffff", width: 0.6 },
              },
            })),
          },
          popupTemplate: {
            title: "{adm1_name}",
            content:
              "Poverty incidence (2023): <b>{pov_incidence_2023}%</b><br/>Shown via representative province: {adm2_name}",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({
            basemap: gray,
            layers: [regions],
          }),
          center: CENTER,
          zoom: 6,
          constraints: { minZoom: 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        view.ui.add(new Legend({ view }), "bottom-right");
        // Zoom + fullscreen grouped together, top-right.
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        // Themed "data source" panel, docked bottom-left (a child box of the
        // map). Reuses the site tokens via the .map-source-box class.
        const sourceBox = document.createElement("div");
        sourceBox.className = "map-source-box";
        sourceBox.innerHTML = `
          <span class="map-source-box-label">Data source</span>
          <dl>
            <div><dt>Poverty</dt><dd>PSA — 2023 Full Year Official Poverty Statistics</dd></div>
            <div><dt>Boundaries</dt><dd>PH admin boundaries (OCHA/HDX COD-AB, v03)</dd></div>
            <div><dt>Measure</dt><dd>Poverty incidence among population (%)</dd></div>
            <div><dt>Note</dt><dd>Each region drawn as one representative province.</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        // Frame the archipelago once the layer has loaded.
        await regions.when();
        if (!active || !view) return;
        if (regions.fullExtent) {
          await view
            .goTo(regions.fullExtent.clone().expand(1.1), { animate: false })
            .catch(() => {});
        }

        // Keep the spinner up until the polygons have actually drawn (their
        // layer view has finished its first update), not just downloaded.
        const regionsLV = await view.whenLayerView(regions);
        await reactiveUtils.whenOnce(() => !regionsLV.updating);
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
      aria-label="Interactive choropleth of Philippine regional poverty incidence in 2023"
    >
      {/* Dedicated, child-free node that ArcGIS owns and mutates. */}
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading poverty map",
                text: "Loading poverty map…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
