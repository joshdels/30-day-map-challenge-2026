"use client";

/**
 * Day 27 — "New tool". A tool this gallery hasn't used yet: the ArcGIS
 * TimeSlider. The same 8,027 epicenters from Day 04, but now played through
 * time — press play and watch a quarter-century of Philippine seismicity
 * accumulate year by year.
 *
 * Keyless gray basemap, lazy imports, destroyed on unmount, Fullscreen control.
 * The GeoJSON carries an epoch-ms `date` field driving the layer's timeInfo.
 */

import "@arcgis/core/assets/esri/themes/light/main.css";
import { createElement, useEffect, useRef, useState } from "react";

export function QuakesTimeSliderMap() {
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
          { default: GeoJSONLayer },
          { default: Basemap },
          { default: TileLayer },
          { default: TimeSlider },
          { default: Fullscreen },
          { default: TimeInterval },
          reactiveUtils,
        ] = await Promise.all([
          import("@arcgis/core/config"),
          import("@arcgis/core/Map"),
          import("@arcgis/core/views/MapView"),
          import("@arcgis/core/layers/GeoJSONLayer"),
          import("@arcgis/core/Basemap"),
          import("@arcgis/core/layers/TileLayer"),
          import("@arcgis/core/widgets/TimeSlider"),
          import("@arcgis/core/widgets/Fullscreen"),
          import("@arcgis/core/time/TimeInterval"),
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

        const quakes = new GeoJSONLayer({
          url: "/days/day27/quakes-time.geojson",
          title: "Earthquakes through time",
          fields: [
            { name: "date", type: "date" },
            { name: "mag", type: "double" },
            { name: "year", type: "integer" },
          ],
          timeInfo: { startField: "date", interval: { unit: "years", value: 1 } },
          renderer: {
            type: "simple",
            symbol: { type: "simple-marker", style: "circle", color: "rgba(228,50,43,0.6)", outline: { color: "rgba(165,15,21,0.8)", width: 0.4 } },
            visualVariables: [
              {
                type: "size",
                field: "mag",
                legendOptions: { title: "Magnitude" },
                stops: [
                  { value: 4.5, size: 4 },
                  { value: 6, size: 12 },
                  { value: 7.8, size: 26 },
                ],
              } as __esri.SizeVariableProperties,
            ],
          },
          popupTemplate: { title: "M{mag} earthquake", content: "Year: {year}" },
        });

        view = new MapView({
          container: el,
          map: new Map({ basemap: gray, layers: [quakes] }),
          center: [123.5, 12.2],
          zoom: 5,
          constraints: { minZoom: 4, snapToZoom: false },
          ui: { components: ["attribution", "zoom"] },
        });

        await view.when();
        if (!active) return;
        view.ui.move("zoom", "top-right");
        view.ui.add(new Fullscreen({ view }), "top-right");

        await quakes.when();
        if (!active || !view) return;

        const slider = new TimeSlider({
          view,
          mode: "cumulative-from-start",
          fullTimeExtent: quakes.timeInfo?.fullTimeExtent ?? undefined,
          stops: { interval: new TimeInterval({ unit: "years", value: 1 }) },
          playRate: 700,
        });
        view.ui.add(slider, "manual");
        if (slider.container) {
          (slider.container as HTMLElement).classList.add("day-timeslider");
        }

        const box = document.createElement("div");
        box.className = "map-source-box";
        box.innerHTML = `<span class="map-source-box-label">Data source</span><dl>
          <div><dt>Tool</dt><dd>ArcGIS TimeSlider — new to this gallery</dd></div>
          <div><dt>Events</dt><dd>8,027 quakes M4.5+, 2000–2026 (USGS)</dd></div>
          <div><dt>Play</dt><dd>Epicenters accumulate year by year</dd></div></dl>`;
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
    <div className="embedded-map arcgis-map" role="application" aria-label="Time-animated map of Philippine earthquakes from 2000 to 2026">
      <div ref={mapNodeRef} className="arcgis-map-node" />
      {status !== "ready" && (
        <div className="embedded-map-status" role="status" aria-live="polite">
          {status === "error" ? <span>Map failed to load.</span> : createElement("calcite-loader", { label: "Loading timeline", text: "Loading timeline…", scale: "l", style: { "--calcite-color-brand": "var(--red)" } })}
        </div>
      )}
    </div>
  );
}
