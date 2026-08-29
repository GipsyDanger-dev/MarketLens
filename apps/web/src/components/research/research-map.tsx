"use client";

import { useEffect, useRef } from "react";

interface MappablePlace {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
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

  useEffect(() => {
    if (!mapElement.current) return;
    let disposed = false;
    let map: { remove: () => void } | null = null;

    void import("maplibre-gl").then((maplibregl) => {
      if (disposed || !mapElement.current) return;
      const mapInstance = new maplibregl.Map({
        container: mapElement.current,
        style: "https://demotiles.maplibre.org/style.json",
        center: [center.longitude, center.latitude],
        zoom: places.length > 1 ? 12 : 13,
      });
      map = mapInstance;
      mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");
      mapInstance.on("load", () => {
        mapInstance.addSource("research-radius", {
          type: "geojson",
          data: circleFeature(center, radiusMeters),
        });
        mapInstance.addLayer({
          id: "research-radius-fill",
          type: "fill",
          source: "research-radius",
          paint: { "fill-color": "#476b50", "fill-opacity": 0.13 },
        });
        mapInstance.addLayer({
          id: "research-radius-line",
          type: "line",
          source: "research-radius",
          paint: { "line-color": "#476b50", "line-width": 2 },
        });
        mapInstance.addSource("places", {
          type: "geojson",
          cluster: true,
          clusterRadius: 50,
          data: {
            type: "FeatureCollection",
            features: places.map((place) => ({
              type: "Feature" as const,
              properties: { id: place.id, name: place.name },
              geometry: {
                type: "Point" as const,
                coordinates: [place.longitude, place.latitude],
              },
            })),
          },
        });
        mapInstance.addLayer({
          id: "clusters",
          type: "circle",
          source: "places",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": "#476b50",
            "circle-radius": [
              "step",
              ["get", "point_count"],
              18,
              10,
              22,
              30,
              28,
            ],
          },
        });
        mapInstance.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "places",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-font": ["Open Sans Bold"],
            "text-size": 12,
          },
        });
        mapInstance.addLayer({
          id: "unclustered-place",
          type: "circle",
          source: "places",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": "#d5e0bf",
            "circle-radius": 8,
            "circle-stroke-width": 2,
            "circle-stroke-color": "#16201b",
          },
        });
        mapInstance.on("click", "unclustered-place", (event) => {
          const id = event.features?.[0]?.properties?.id;
          if (typeof id === "string") onPlaceSelect(id);
        });
      });
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([center.longitude, center.latitude]);
      for (const place of places) {
        bounds.extend([place.longitude, place.latitude]);
      }
      if (places.length > 1)
        mapInstance.fitBounds(bounds, { padding: 56, maxZoom: 14 });
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [center, onPlaceSelect, places, radiusMeters, selectedPlaceId]);

  return (
    <section className="paper-panel overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-[var(--rule)] p-5">
        <div>
          <p className="eyebrow">Spatial pattern</p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.025em] text-[var(--ink)]">Business map</h2>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            {places.length} markers ·{" "}
            {Math.round((radiusMeters / 1_000) * 10) / 10} km research radius
          </p>
        </div>
      </div>
      <div
        aria-label="Interactive business map"
        className="h-80 w-full grayscale-[0.25] contrast-[0.95] sm:h-105"
        ref={mapElement}
      />
    </section>
  );
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
