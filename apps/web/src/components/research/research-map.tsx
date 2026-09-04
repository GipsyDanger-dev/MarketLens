"use client";

import { LocateFixed } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface MappablePlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  rating?: number | null;
  phone?: string | null;
}

export function ResearchMap({
  center,
  radiusMeters,
  places,
  selectedPlaceId,
  onPlaceSelect,
}: {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  places: readonly MappablePlace[];
  selectedPlaceId: string | null;
  onPlaceSelect: (placeId: string) => void;
}) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const markersRef = useRef<{ remove: () => void }[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    if (!mapElement.current) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
    mapRef.current?.remove();
    mapRef.current = null;
    setMapReady(false);

    let disposed = false;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;

    void import("maplibre-gl").then((maplibregl) => {
      if (disposed || !mapElement.current) return;

      const mapInstance = new maplibregl.Map({
        container: mapElement.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [center.longitude, center.latitude],
        zoom: 13,
      });

      mapRef.current = mapInstance;
      mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

      let initialized = false;
      const populateMap = () => {
        if (disposed || initialized) return;
        if (!mapInstance.isStyleLoaded()) {
          readyTimer = setTimeout(populateMap, 200);
          return;
        }
        initialized = true;

        mapInstance.addSource("research-radius", {
          type: "geojson",
          data: circleFeature(center, radiusMeters),
        });
        mapInstance.addLayer({
          id: "radius-fill",
          type: "fill",
          source: "research-radius",
          paint: { "fill-color": "#315ef5", "fill-opacity": 0.1 },
        });
        mapInstance.addLayer({
          id: "radius-line",
          type: "line",
          source: "research-radius",
          paint: {
            "line-color": "#315ef5",
            "line-width": 2.2,
            "line-dasharray": [5, 3],
          },
        });

        const centerElement = document.createElement("div");
        centerElement.setAttribute("aria-label", "Research center");
        centerElement.style.cssText = `
          width: 20px; height: 20px; background: #0b1220;
          border: 3px solid white; border-radius: 50%;
          box-shadow: 0 3px 12px rgba(11,18,32,.42);
        `;
        const centerMarker = new maplibregl.Marker({ element: centerElement })
          .setLngLat([center.longitude, center.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 15 }).setDOMContent(createCenterPopupContent()),
          )
          .addTo(mapInstance);
        markersRef.current.push(centerMarker);

        for (const place of places) {
          const rating = place.rating ?? 0;
          const isSelected = place.id === selectedPlaceId;
          const color = markerColor(rating);
          const element = document.createElement("button");
          element.type = "button";
          element.setAttribute("aria-label", `Select ${place.name}${rating > 0 ? `, rated ${rating}` : ""}`);
          element.style.cssText = `
            width: 32px; height: 32px; padding: 0; background: ${color}; color: white;
            border: 2.5px solid ${isSelected ? "#0b1220" : "white"}; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: 800; font-family: Manrope, sans-serif;
            box-shadow: 0 4px 12px rgba(11,18,32,${isSelected ? ".42" : ".25"});
            cursor: pointer; transform: scale(${isSelected ? 1.3 : 1});
            transition: transform .18s ease, box-shadow .18s ease; z-index: ${isSelected ? 10 : 1};
          `;
          element.textContent = rating > 0 ? String(rating) : "·";
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            onPlaceSelect(place.id);
          });

          const marker = new maplibregl.Marker({ element })
            .setLngLat([place.longitude, place.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 20 }).setDOMContent(
                createPlacePopupContent(place, rating),
              ),
            )
            .addTo(mapInstance);
          markersRef.current.push(marker);
        }

        if (places.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([center.longitude, center.latitude]);
          for (const place of places) bounds.extend([place.longitude, place.latitude]);
          mapInstance.fitBounds(bounds, { padding: 64, maxZoom: 14 });
        }
        setMapReady(true);
      };

      mapInstance.once("load", populateMap);
      mapInstance.once("style.load", populateMap);
      readyTimer = setTimeout(populateMap, 800);
    });

    return () => {
      disposed = true;
      if (readyTimer) clearTimeout(readyTimer);
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, onPlaceSelect, places, radiusMeters, selectedPlaceId]);

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-[var(--rule-strong)] bg-white shadow-[var(--shadow-soft)]">
      <div className="grid gap-4 border-b border-[var(--rule)] p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
        <div>
          <p className="eyebrow">Spatial pattern</p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-[var(--ink)]">Business map</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {places.length} markers · {Math.round((radiusMeters / 1_000) * 10) / 10} km research radius
          </p>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 font-mono text-[0.62rem] text-[var(--ink-faint)]">
          <Legend color="#0b1220" label="4.8+" />
          <Legend color="#315ef5" label="4.5+" />
          <Legend color="#b7642a" label="4.0+" />
          <Legend color="#667085" label="Other" />
        </div>
      </div>
      <div className="relative h-[28rem] bg-[var(--paper-muted)] sm:h-[36rem]">
        <div
          aria-label="Interactive business map"
          className="h-full w-full [&_.maplibregl-canvas]:grayscale-[0.42] [&_.maplibregl-canvas]:saturate-[0.75]"
          ref={mapElement}
          style={{ height: "100%", width: "100%" }}
        />
        {!mapReady ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-[var(--paper-muted)]">
            <span className="font-mono text-[0.66rem] font-bold tracking-[0.12em] text-[var(--ink-faint)] uppercase">Loading market geography</span>
          </div>
        ) : null}
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-md border border-white/80 bg-[rgb(255_255_255/0.9)] px-3 py-2 text-xs font-bold text-[var(--ink)] shadow-[0_8px_24px_rgb(11_18_32/0.16)] backdrop-blur-md">
          <LocateFixed aria-hidden="true" className="text-[var(--accent)]" size={15} />
          Select a marker to inspect it
        </div>
      </div>
    </section>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2.5 rounded-full border border-white shadow-[0_0_0_1px_rgb(11_18_32/0.12)]" style={{ background: color }} />
      {label}
    </span>
  );
}

function markerColor(rating: number) {
  if (rating >= 4.8) return "#0b1220";
  if (rating >= 4.5) return "#315ef5";
  if (rating >= 4) return "#b7642a";
  if (rating > 0) return "#a7352b";
  return "#667085";
}

function createCenterPopupContent() {
  const content = document.createElement("div");
  content.style.cssText = "padding:7px 10px;font-weight:700;font-size:12px;color:#121826;";
  content.textContent = "Research center";
  return content;
}

function createPlacePopupContent(place: MappablePlace, rating: number) {
  const content = document.createElement("div");
  content.style.cssText = "padding:9px 12px;min-width:180px;font-family:Manrope,sans-serif;color:#121826;";
  const name = document.createElement("div");
  name.style.cssText = "font-weight:800;font-size:13px;margin-bottom:5px;";
  name.textContent = place.name;
  content.append(name);

  if (rating > 0 || place.phone) {
    const metadata = document.createElement("div");
    metadata.style.cssText = "display:grid;gap:3px;font-size:11px;color:#596579;";
    if (rating > 0) {
      const ratingItem = document.createElement("span");
      ratingItem.textContent = `Rating · ${rating}`;
      metadata.append(ratingItem);
    }
    if (place.phone) {
      const phoneItem = document.createElement("span");
      phoneItem.textContent = `Phone · ${place.phone}`;
      metadata.append(phoneItem);
    }
    content.append(metadata);
  }
  return content;
}

function circleFeature(
  center: { latitude: number; longitude: number },
  radiusMeters: number,
) {
  const radius = Math.max(0, radiusMeters) / 111_320;
  const coordinates = Array.from({ length: 65 }, (_, index) => {
    const angle = (index / 64) * Math.PI * 2;
    return [
      center.longitude +
        (radius * Math.cos(angle)) / Math.cos((center.latitude * Math.PI) / 180),
      center.latitude + radius * Math.sin(angle),
    ];
  });
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coordinates] },
  };
}
