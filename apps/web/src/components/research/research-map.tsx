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
}: {
  center: { latitude: number; longitude: number };
  radiusMeters: number;
  places: readonly MappablePlace[];
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
      const bounds = new maplibregl.LngLatBounds();
      bounds.extend([center.longitude, center.latitude]);
      for (const place of places) {
        new maplibregl.Marker({ color: "#67e8f9" })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(new maplibregl.Popup({ offset: 18 }).setText(place.name))
          .addTo(mapInstance);
        bounds.extend([place.longitude, place.latitude]);
      }
      if (places.length > 1)
        mapInstance.fitBounds(bounds, { padding: 56, maxZoom: 14 });
    });
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [center.latitude, center.longitude, places]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
      <div className="flex flex-wrap items-baseline justify-between gap-2 p-5">
        <div>
          <h2 className="font-semibold text-slate-100">Business map</h2>
          <p className="text-sm text-slate-400">
            {places.length} markers ·{" "}
            {Math.round((radiusMeters / 1_000) * 10) / 10} km research radius
          </p>
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
