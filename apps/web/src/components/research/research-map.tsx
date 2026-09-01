"use client";

import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (!mapElement.current) return;

    // Cleanup previous map
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    mapRef.current?.remove();
    mapRef.current = null;

    let disposed = false;

    void import("maplibre-gl").then((maplibregl) => {
      if (disposed || !mapElement.current) return;

      // Simple OpenStreetMap raster tiles — no API key needed
      const mapInstance = new maplibregl.Map({
        container: mapElement.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: [
                "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
              ],
              tileSize: 256,
              attribution:
                '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
            },
          },
          layers: [
            {
              id: "osm",
              type: "raster",
              source: "osm",
            },
          ],
        },
        center: [center.longitude, center.latitude],
        zoom: 13,
      });

      mapRef.current = mapInstance;

      mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

      // Add research radius circle after tiles load
      mapInstance.on("load", () => {
        if (disposed) return;

        // Radius circle
        mapInstance.addSource("research-radius", {
          type: "geojson",
          data: circleFeature(center, radiusMeters),
        });
        mapInstance.addLayer({
          id: "radius-fill",
          type: "fill",
          source: "research-radius",
          paint: { "fill-color": "#476b50", "fill-opacity": 0.08 },
        });
        mapInstance.addLayer({
          id: "radius-line",
          type: "line",
          source: "research-radius",
          paint: {
            "line-color": "#476b50",
            "line-width": 2,
            "line-dasharray": [6, 3],
          },
        });

        // Center marker (research point)
        const centerEl = document.createElement("div");
        centerEl.style.cssText = `
          width: 20px; height: 20px;
          background: #476b50;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.35);
        `;
        const centerMarker = new maplibregl.Marker({ element: centerEl })
          .setLngLat([center.longitude, center.latitude])
          .setPopup(
            new maplibregl.Popup({ offset: 15 }).setDOMContent(
              createCenterPopupContent(),
            ),
          )
          .addTo(mapInstance);
        markersRef.current.push(centerMarker);

        // Business markers
        for (const place of places) {
          const rating = place.rating ?? 0;
          const isSelected = place.id === selectedPlaceId;

          // Color by rating
          let bgColor = "#8B9A8E";
          if (rating >= 4.8) bgColor = "#1a6b3c";
          else if (rating >= 4.5) bgColor = "#2d7a4f";
          else if (rating >= 4.0) bgColor = "#d97706";
          else if (rating > 0) bgColor = "#be123c";

          const el = document.createElement("div");
          el.style.cssText = `
            width: 30px; height: 30px;
            background: ${bgColor};
            color: white;
            border: 2.5px solid ${isSelected ? "#16201b" : "white"};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            font-family: 'DM Sans', sans-serif;
            box-shadow: 0 2px 8px rgba(0,0,0,${isSelected ? "0.5" : "0.3"});
            cursor: pointer;
            transform: scale(${isSelected ? 1.35 : 1});
            transition: transform 0.15s;
            z-index: ${isSelected ? 10 : 1};
          `;
          el.textContent = rating > 0 ? String(rating) : "•";

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([place.longitude, place.latitude])
            .setPopup(
              new maplibregl.Popup({ offset: 20 }).setDOMContent(
                createPlacePopupContent(place, rating),
              ),
            )
            .addTo(mapInstance);

          el.addEventListener("click", (e) => {
            e.stopPropagation();
            onPlaceSelect(place.id);
          });

          markersRef.current.push(marker);
        }

        // Fit bounds
        if (places.length > 1) {
          const bounds = new maplibregl.LngLatBounds();
          bounds.extend([center.longitude, center.latitude]);
          for (const place of places) {
            bounds.extend([place.longitude, place.latitude]);
          }
          mapInstance.fitBounds(bounds, { padding: 60, maxZoom: 14 });
        }
      });
    });

    return () => {
      disposed = true;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [center, onPlaceSelect, places, radiusMeters, selectedPlaceId]);

  return (
    <section className="paper-panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--rule)] p-5">
        <div>
          <p className="eyebrow">Spatial pattern</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--ink)]">
            Business map
          </h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {places.length} markers ·{" "}
            {Math.round((radiusMeters / 1_000) * 10) / 10} km research radius
          </p>
        </div>
        <div className="flex gap-3 text-xs text-[var(--ink-faint)]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#1a6b3c]"></span>{" "}
            ≥4.8
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#2d7a4f]"></span>{" "}
            ≥4.5
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#d97706]"></span>{" "}
            ≥4.0
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#8B9A8E]"></span>{" "}
            Other
          </span>
        </div>
      </div>
      <div
        aria-label="Interactive business map"
        className="h-80 w-full sm:h-105"
        ref={mapElement}
      />
    </section>
  );
}

function createCenterPopupContent() {
  const content = document.createElement("div");
  content.style.cssText = "padding:6px 10px;font-weight:600;font-size:12px;";
  content.textContent = "📍 Research Center";
  return content;
}

function createPlacePopupContent(place: MappablePlace, rating: number) {
  const content = document.createElement("div");
  content.style.cssText =
    "padding:8px 12px;min-width:180px;font-family:DM Sans,sans-serif;";

  const name = document.createElement("div");
  name.style.cssText = "font-weight:600;font-size:13px;margin-bottom:4px;";
  name.textContent = place.name;
  content.append(name);

  if (rating > 0 || place.phone) {
    const metadata = document.createElement("div");
    metadata.style.cssText =
      "display:flex;gap:10px;font-size:11px;color:#5a6b5f;flex-wrap:wrap;";

    if (rating > 0) {
      const ratingItem = document.createElement("span");
      ratingItem.textContent = `⭐ ${rating}`;
      metadata.append(ratingItem);
    }

    if (place.phone) {
      const phoneItem = document.createElement("span");
      phoneItem.textContent = `📞 ${place.phone}`;
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
        (radius * Math.cos(angle)) /
          Math.cos((center.latitude * Math.PI) / 180),
      center.latitude + radius * Math.sin(angle),
    ];
  });
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "Polygon" as const, coordinates: [coordinates] },
  };
}
