"use client";

/**
 * Day 04 — Philippine seismicity, 2000–2026, as clustered epicenters.
 *
 * In-repo WebGIS: an ArcGIS Maps SDK for JavaScript 2D MapView built as a
 * client child of the day page — same pattern as Days 02–03 (see
 * components/maps/tagum-watershed.tsx and docs/ADDING-DAYS.md).
 *
 * Uses the SDK's built-in point clustering (FeatureReductionCluster): 8,027
 * M4.5+ epicenters collapse into sized, counted bubbles that reveal the
 * seismic hotspots strung along the country's trenches and fault zones.
 *
 * Data is served statically from /public as WGS 84 GeoJSON:
 *   - /days/day04/earthquakes.geojson  (8,027 points; fields: mag, place,
 *     depth_km, year)
 *
 * AGENTS.md compliance:
 *   - Heavy ArcGIS modules are lazy-imported inside the effect.
 *   - The view is destroyed on unmount.
 *   - Keyless light-gray basemap (Esri World Light Gray Base) — no API key.
 *   - View is centred/constrained on the Philippine study area.
 *   - A themed "data source" panel docks bottom-left, reusing the site tokens.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

// Philippine archipelago centroid (WGS 84) — the initial view centre.
const CENTER: [number, number] = [123.5, 12.2];

// Magnitude → fill colour (light→deep red), a sequential ramp around the site
// --red accent. Used as colour stops on the single-quake symbol; clusters take
// their fill from the same ramp via the mean magnitude of their members.
const MAG_STOPS: { value: number; color: string }[] = [
  { value: 4.5, color: "#fcae91" },
  { value: 5.5, color: "#fb6a4a" },
  { value: 6.5, color: "#de2d26" },
  { value: 7.5, color: "#a50f15" },
];

export function PhEarthquakesMap() {
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
        // epicenter clusters read as the only saturated marks.
        const gray = new Basemap({
          baseLayers: [
            new TileLayer({
              url: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer",
            }),
          ],
          title: "Light Gray Canvas",
          id: "esri-light-gray",
        });

        const quakes = new GeoJSONLayer({
          url: "/days/day04/earthquakes.geojson",
          title: "Earthquakes M4.5+ (2000–2026)",
          // Single epicenter: a red circle sized and shaded by magnitude.
          renderer: {
            type: "simple",
            symbol: {
              type: "simple-marker",
              style: "circle",
              color: "#de2d26",
              outline: { color: "rgba(255,255,255,0.75)", width: 0.5 },
            },
            visualVariables: [
              {
                type: "size",
                field: "mag",
                legendOptions: { title: "Magnitude" },
                stops: [
                  { value: 4.5, size: 4 },
                  { value: 5.5, size: 8 },
                  { value: 6.5, size: 16 },
                  { value: 7.8, size: 28 },
                ],
              } as __esri.SizeVariableProperties,
              {
                type: "color",
                field: "mag",
                stops: MAG_STOPS,
              } as __esri.ColorVariableProperties,
            ],
          },
          // Built-in clustering: aggregate nearby epicenters into counted
          // bubbles that take their fill from the members' mean magnitude.
          featureReduction: {
            type: "cluster",
            clusterRadius: "90px",
            clusterMinSize: "18px",
            clusterMaxSize: "54px",
            // Aggregate statistics the cluster popup can reference.
            fields: [
              { name: "avg_mag", statisticType: "avg", onStatisticField: "mag" },
              { name: "max_mag", statisticType: "max", onStatisticField: "mag" },
            ],
            labelingInfo: [
              {
                deconflictionStrategy: "none",
                labelExpressionInfo: {
                  expression: "Text($feature.cluster_count, '#,###')",
                },
                symbol: {
                  type: "text",
                  color: "#ffffff",
                  haloColor: "#a50f15",
                  haloSize: 1,
                  font: { weight: "bold", family: "monospace", size: 11 },
                },
                labelPlacement: "center-center",
              },
            ],
            popupTemplate: {
              title: "Cluster of earthquakes",
              content:
                "This cluster contains <b>{cluster_count}</b> epicenters (M4.5+).<br/>Average magnitude: <b>{avg_mag}</b><br/>Strongest in cluster: <b>M{max_mag}</b>",
              fieldInfos: [
                { fieldName: "cluster_count", format: { digitSeparator: true, places: 0 } },
                { fieldName: "avg_mag", format: { places: 1 } },
                { fieldName: "max_mag", format: { places: 1 } },
              ],
            },
          },
          // Single epicenter popup (shown when zoomed in past clustering).
          popupTemplate: {
            title: "M{mag} earthquake",
            content:
              "Location: {place}<br/>Depth: {depth_km} km<br/>Year: {year}",
          },
        });

        view = new MapView({
          container: el,
          map: new Map({
            basemap: gray,
            layers: [quakes],
          }),
          center: CENTER,
          zoom: 5,
          constraints: { minZoom: 4, snapToZoom: false },
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
            <div><dt>Catalog</dt><dd>USGS ANSS ComCat (FDSN event API)</dd></div>
            <div><dt>Scope</dt><dd>M4.5+ epicenters, 2000–2026, PH region</dd></div>
            <div><dt>Count</dt><dd>8,027 earthquakes</dd></div>
            <div><dt>Authority</dt><dd>National monitoring: DOST-PHIVOLCS</dd></div>
          </dl>`;
        view.ui.add(sourceBox, "bottom-left");

        // Frame the archipelago once the layer has loaded.
        await quakes.when();
        if (!active || !view) return;
        if (quakes.fullExtent) {
          await view
            .goTo(quakes.fullExtent.clone().expand(1.05), { animate: false })
            .catch(() => {});
        }

        // Keep the spinner up until the clusters have actually drawn (their
        // layer view has finished its first update), not just downloaded.
        const quakesLV = await view.whenLayerView(quakes);
        await reactiveUtils.whenOnce(() => !quakesLV.updating);
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
      aria-label="Interactive clustered map of Philippine earthquake epicenters, magnitude 4.5 and above, 2000 to 2026"
    >
      {/* Dedicated, child-free node that ArcGIS owns and mutates. */}
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error"
            ? <span>Map failed to load.</span>
            : createElement("calcite-loader", {
                label: "Loading seismicity",
                text: "Loading seismicity…",
                scale: "l",
                style: { "--calcite-color-brand": "var(--red)" },
              })}
        </div>
      )}
    </div>
  );
}
