"use client";

/**
 * Day 08 — "Utopia". A map of something which could be: the Philippines run on
 * clean power. It plots the renewable generation already on the ground—hydro,
 * geothermal, solar, wind, biomass—as the seed of that future, each plant a
 * point coloured by fuel and sized by capacity.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView, client child of
 * the day page (same skeleton as Days 02–07).
 *
 * Data: /days/day08/renewables.geojson (78 plants; fields: name, fuel,
 *   capacity_mw, year)
 *
 * AGENTS.md compliance: lazy imports, view destroyed on unmount, keyless
 * light-gray basemap, Philippine extent, themed source box. The "utopia" is in
 * the framing only — every plotted plant is real, measured capacity.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

const CENTER: [number, number] = [122.8, 12.0];

// Conventional energy colours — distinct, legible categories.
const FUEL_STYLE: Record<string, string> = {
  Geothermal: "#e4322b",
  Hydro: "#2b6cb0",
  Solar: "#f6b511",
  Wind: "#17a2a2",
  Biomass: "#4c9a2a",
};

export function RenewablesUtopiaMap() {
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
          { default: Fullscreen },
          { default: Legend },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/Fullscreen"),
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

        const plants = new GeoJSONLayer({
          url: "/days/day08/renewables.geojson",
          title: "Renewable power plants",
          renderer: {
            type: "unique-value",
            field: "fuel",
            legendOptions: { title: "Fuel" },
            uniqueValueInfos: Object.entries(FUEL_STYLE).map(([fuel, color]) => ({
              value: fuel,
              label: fuel,
              symbol: {
                type: "simple-marker",
                style: "circle",
                color,
                outline: { color: "rgba(255,255,255,0.85)", width: 0.6 },
              },
            })),
            visualVariables: [
              {
                type: "size",
                field: "capacity_mw",
                legendOptions: { title: "Capacity (MW)" },
                minDataValue: 1,
                maxDataValue: 700,
                minSize: 6,
                maxSize: 34,
              } as __esri.SizeVariableProperties,
            ],
          },
          popupTemplate: {
            title: "{name}",
            content:
              "Fuel: {fuel}<br/>Capacity: {capacity_mw} MW<br/>Commissioned: {year}",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: gray, layers: [plants] }),
          center: CENTER,
          zoom: 5,
          constraints: { minZoom: 5, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;

        view.ui.add(new Legend({ view }), "bottom-right");
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        const sourceBox = document.createElement("div");
        sourceBox.className = "map-source-box";
        sourceBox.innerHTML = `
          <span class="map-source-box-label">Data source</span>
          <dl>
            <div><dt>Plants</dt><dd>WRI Global Power Plant Database (renewables, PH)</dd></div>
            <div><dt>Count</dt><dd>78 plants · sized by MW capacity</dd></div>
            <div><dt>Vintage</dt><dd>GPPD v1.3.0 snapshot (≤2021)</dd></div>
            <div><dt>Utopia</dt><dd>The future is a question of scaling these up.</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        await plants.when();
        if (!active || !view) return;
        if (plants.fullExtent) {
          await view
            .goTo(plants.fullExtent.clone().expand(1.15), { animate: false })
            .catch(() => {});
        }

        const plantsLV = await view.whenLayerView(plants);
        await reactiveUtils.whenOnce(() => !plantsLV.updating);
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
      aria-label="Map of renewable power plants in the Philippines, coloured by fuel and sized by capacity"
    >
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading power plants",
                text: "Loading power plants…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
