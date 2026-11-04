"use client";

/**
 * Day 09 — "Urban–rural". Population density by region (2024 Census), drawn as
 * a choropleth of the provinces that make up each region. The National Capital
 * Region towers over everything; the Cordillera and Mimaropa sit at the rural
 * floor — the whole urban-to-rural gradient in one ramp.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView, client child of
 * the day page (same skeleton as Days 02–08).
 *
 * Data: /days/day09/region-density.geojson (88 province polygons; each carries
 *   its region's population, area and density; fields: region, pop_2024,
 *   region_area_km2, density)
 *
 * AGENTS.md compliance: lazy imports, view destroyed on unmount, keyless
 * light-gray basemap, Philippine extent, themed source box.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

const CENTER: [number, number] = [122.8, 12.0];

// Class breaks for population density (persons / km²). An extra top class
// isolates the extreme NCR value from everyone else.
const DENSITY_CLASSES: { min: number; max: number; color: string; label: string }[] = [
  { min: -1, max: 150, color: "#fee5d9", label: "Under 150 (rural)" },
  { min: 150, max: 300, color: "#fcbba1", label: "150 – 300" },
  { min: 300, max: 600, color: "#fc9272", label: "300 – 600" },
  { min: 600, max: 1200, color: "#fb6a4a", label: "600 – 1,200" },
  { min: 1200, max: 5000, color: "#de2d26", label: "1,200 – 5,000" },
  { min: 5000, max: 1e9, color: "#a50f15", label: "Over 5,000 (NCR)" },
];

export function UrbanRuralMap() {
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
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/Legend"),
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

        const density = new GeoJSONLayer({
          url: "/days/day09/region-density.geojson",
          title: "Population density 2024 (persons/km²)",
          renderer: {
            type: "class-breaks",
            field: "density",
            legendOptions: { title: "Persons / km² (by region)" },
            defaultSymbol: {
              type: "simple-fill",
              color: "#dddddd",
              outline: { color: "rgba(255,255,255,0.7)", width: 0.3 },
            },
            classBreakInfos: DENSITY_CLASSES.map((c) => ({
              minValue: c.min,
              maxValue: c.max,
              label: c.label,
              symbol: {
                type: "simple-fill",
                color: c.color,
                outline: { color: "rgba(255,255,255,0.7)", width: 0.3 },
              },
            })),
          },
          popupTemplate: {
            title: "{region}",
            content:
              "Population (2024): <b>{pop_2024}</b><br/>Region area: {region_area_km2} km²<br/>Density: <b>{density}</b> persons/km²",
            fieldInfos: [
              { fieldName: "pop_2024", format: { digitSeparator: true, places: 0 } },
              { fieldName: "region_area_km2", format: { digitSeparator: true, places: 0 } },
              { fieldName: "density", format: { digitSeparator: true, places: 1 } },
            ],
          },
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: gray, layers: [density] }),
          center: CENTER,
          zoom: 5,
          constraints: { minZoom: 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        view.ui.add(new Legend({ view }), "bottom-right");
        view.ui.move("zoom", "top-right");

        const sourceBox = document.createElement("div");
        sourceBox.className = "map-source-box";
        sourceBox.innerHTML = `
          <span class="map-source-box-label">Data source</span>
          <dl>
            <div><dt>Population</dt><dd>PSA 2024 Census of Population and Housing</dd></div>
            <div><dt>Boundaries</dt><dd>PSGC regions/provinces (faeldon PH JSON maps)</dd></div>
            <div><dt>Measure</dt><dd>Regional population ÷ regional land area</dd></div>
            <div><dt>Range</dt><dd>NCR ≈ 23,500 vs. CAR ≈ 99 per km²</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        await density.when();
        if (!active || !view) return;
        if (density.fullExtent) {
          await view
            .goTo(density.fullExtent.clone().expand(1.1), { animate: false })
            .catch(() => {});
        }

        const densityLV = await view.whenLayerView(density);
        await reactiveUtils.whenOnce(() => !densityLV.updating);
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
      aria-label="Choropleth of Philippine population density by region, 2024 census"
    >
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading density",
                text: "Loading density…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
