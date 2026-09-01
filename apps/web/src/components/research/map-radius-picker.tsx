"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as MaplibreMap, MapMouseEvent } from "maplibre-gl";

interface MapRadiusPickerProps {
  initialLatitude?: number;
  initialLongitude?: number;
  initialRadius?: number;
  onCenterChange?: (lat: number, lng: number) => void;
  onRadiusChange?: (meters: number) => void;
}

export function MapRadiusPicker({
  initialLatitude = -7.977,
  initialLongitude = 112.634,
  initialRadius = 5000,
  onCenterChange,
  onRadiusChange,
}: MapRadiusPickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const centerHandleRef = useRef<HTMLDivElement>(null);
  const edgeHandleRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const mapInitRef = useRef(false);

  const stateRef = useRef({
    center: [initialLongitude, initialLatitude] as [number, number],
    radius: initialRadius,
    dragging: null as "center" | "edge" | null,
    startRadius: 0,
    startClientX: 0,
  });

  const [latitude, setLatitude] = useState(initialLatitude);
  const [longitude, setLongitude] = useState(initialLongitude);
  const [radius, setRadius] = useState(initialRadius);
  const [mapReady, setMapReady] = useState(false);

  // Update ALL overlay elements: circle, line, handles, label
  const updateOverlay = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const center = stateRef.current.center;
    const r = stateRef.current.radius;

    const centerPt = map.project(center as [number, number]);
    const edgeLngLat: [number, number] = [
      center[0] + (r / 111_320) / Math.cos((center[1] * Math.PI) / 180),
      center[1],
    ];
    const edgePt = map.project(edgeLngLat);

    // Pixel radius
    const dx = edgePt.x - centerPt.x;
    const dy = edgePt.y - centerPt.y;
    const pixelRadius = Math.sqrt(dx * dx + dy * dy);

    // CSS circle
    if (circleRef.current) {
      const el = circleRef.current;
      el.style.left = `${centerPt.x}px`;
      el.style.top = `${centerPt.y}px`;
      el.style.width = `${pixelRadius * 2}px`;
      el.style.height = `${pixelRadius * 2}px`;
    }

    // Dashed line
    if (lineRef.current) {
      const el = lineRef.current;
      const angle = Math.atan2(dy, dx);
      el.style.left = `${centerPt.x}px`;
      el.style.top = `${centerPt.y}px`;
      el.style.width = `${pixelRadius}px`;
      el.style.transform = `rotate(${angle}rad)`;
    }

    // Center handle
    if (centerHandleRef.current) {
      centerHandleRef.current.style.left = `${centerPt.x}px`;
      centerHandleRef.current.style.top = `${centerPt.y}px`;
    }

    // Edge handle
    if (edgeHandleRef.current) {
      edgeHandleRef.current.style.left = `${edgePt.x}px`;
      edgeHandleRef.current.style.top = `${edgePt.y}px`;
    }

    // Label
    if (labelRef.current) {
      labelRef.current.style.left = `${edgePt.x}px`;
      labelRef.current.style.top = `${edgePt.y - 28}px`;
    }
  }, []);

  // Fit map to show the entire circle
  const fitMapToCircle = useCallback(
    (center: [number, number], r: number) => {
      const map = mapRef.current;
      if (!map) return;
      const latDelta = r / 111_320;
      const lngDelta = latDelta / Math.cos((center[1] * Math.PI) / 180);
      map.fitBounds(
        [
          [center[0] - lngDelta, center[1] - latDelta],
          [center[0] + lngDelta, center[1] + latDelta],
        ],
        { padding: 80, maxZoom: 16, duration: 0 },
      );
    },
    [],
  );

  // Initialize map
  useEffect(() => {
    if (mapInitRef.current) return;
    mapInitRef.current = true;

    const container = wrapperRef.current;
    if (!container) return;
    let disposed = false;

    const timer = setTimeout(() => {
      if (disposed || !container) return;

      import("maplibre-gl").then((maplibregl) => {
        if (disposed || !container) return;

        const map = new maplibregl.Map({
          container,
          style: {
            version: 8,
            sources: {
              osm: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution:
                  '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
                maxzoom: 19,
              },
            },
            layers: [{ id: "osm", type: "raster", source: "osm" }],
          },
          center: stateRef.current.center,
          zoom: 12,
        });

        mapRef.current = map;

        map.on("load", () => {
          if (disposed) return;

          // Fit map to circle bounds
          fitMapToCircle(stateRef.current.center, stateRef.current.radius);

          // Set ready immediately — overlay will update on every move event
          setMapReady(true);

          map.on("move", updateOverlay);
          map.on("zoom", updateOverlay);

          // Click map to set center
          map.on("click", (e: MapMouseEvent) => {
            if (stateRef.current.dragging) return;
            const ll = e.lngLat;
            stateRef.current.center = [ll.lng, ll.lat];
            setLatitude(Math.round(ll.lat * 1e6) / 1e6);
            setLongitude(Math.round(ll.lng * 1e6) / 1e6);
            updateOverlay();
            onCenterChange?.(ll.lat, ll.lng);
          });
        });
      });
    }, 100);

    return () => {
      disposed = true;
      clearTimeout(timer);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-update overlay whenever mapReady changes (after fitBounds completes)
  useEffect(() => {
    if (mapReady) {
      // Small delay to ensure fitBounds has settled
      const id = requestAnimationFrame(() => updateOverlay());
      return () => cancelAnimationFrame(id);
    }
  }, [mapReady, updateOverlay]);

  function handlePointerDown(which: "center" | "edge", e: React.PointerEvent) {
    e.preventDefault();
    e.stopPropagation();
    const map = mapRef.current;
    if (!map) return;

    stateRef.current.dragging = which;
    stateRef.current.startClientX = e.clientX;
    stateRef.current.startRadius = stateRef.current.radius;

    map.dragPan.disable();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    const dragging = stateRef.current.dragging;
    if (!dragging) return;
    const map = mapRef.current;
    if (!map) return;

    if (dragging === "center") {
      const rect = wrapperRef.current!.getBoundingClientRect();
      const ll = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
      stateRef.current.center = [ll.lng, ll.lat];
      setLatitude(Math.round(ll.lat * 1e6) / 1e6);
      setLongitude(Math.round(ll.lng * 1e6) / 1e6);
      updateOverlay();
    } else if (dragging === "edge") {
      const deltaX = e.clientX - stateRef.current.startClientX;
      const newRadius = Math.max(
        100,
        Math.min(50000, stateRef.current.startRadius + deltaX * 10),
      );
      stateRef.current.radius = newRadius;
      setRadius(newRadius);
      updateOverlay();
    }
  }

  function handlePointerUp() {
    const dragging = stateRef.current.dragging;
    stateRef.current.dragging = null;
    mapRef.current?.dragPan.enable();
    if (dragging === "center")
      onCenterChange?.(stateRef.current.center[1], stateRef.current.center[0]);
    if (dragging === "edge") {
      onRadiusChange?.(stateRef.current.radius);
      fitMapToCircle(stateRef.current.center, stateRef.current.radius);
    }
  }

  // Sync radius from parent (preset buttons)
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (stateRef.current.dragging) return;
    if (initialRadius !== stateRef.current.radius) {
      stateRef.current.radius = initialRadius;
      setRadius(initialRadius);
      fitMapToCircle(stateRef.current.center, initialRadius);
      // Update overlay after fitBounds settles
      setTimeout(updateOverlay, 50);
    }
  }, [initialRadius, mapReady, updateOverlay, fitMapToCircle]);

  const radiusKm = (radius / 1000).toFixed(1);

  return (
    <div className="space-y-3">
      <div className="relative h-[380px] w-full overflow-hidden rounded-lg border border-[var(--rule)] sm:h-[480px]">
        {/* Map canvas */}
        <div
          ref={wrapperRef}
          className="absolute inset-0"
          style={{ width: "100%", height: "100%" }}
        />

        {/* Overlay container */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 10 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* GREEN CIRCLE */}
          <div
            ref={circleRef}
            className="pointer-events-none absolute"
            style={{
              borderRadius: "50%",
              background: "rgba(55, 140, 85, 0.25)",
              border: "3px solid rgba(45, 107, 66, 0.8)",
              boxShadow:
                "0 0 0 1px rgba(45, 107, 66, 0.15), inset 0 0 30px rgba(55, 140, 85, 0.1)",
              zIndex: 5,
              transform: "translate(-50%, -50%)",
              transition: "none",
            }}
          />

          {/* DASHED LINE */}
          <div
            ref={lineRef}
            className="pointer-events-none absolute"
            style={{
              height: "2.5px",
              backgroundImage:
                "repeating-linear-gradient(to right, #2d6b42 0, #2d6b42 8px, transparent 8px, transparent 14px)",
              transformOrigin: "0 0",
              zIndex: 6,
            }}
          />

          {/* RADIUS LABEL */}
          <div
            ref={labelRef}
            className="pointer-events-none absolute z-30"
            style={{ transform: "translateX(-50%)" }}
          >
            <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
              {radiusKm} km
            </span>
          </div>

          {/* CENTER HANDLE */}
          <div
            ref={centerHandleRef}
            className="handle-center pointer-events-auto absolute z-20"
            onPointerDown={(e) => handlePointerDown("center", e)}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "#3d8b5a",
                border: "3px solid white",
                borderRadius: "50%",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* EDGE HANDLE */}
          <div
            ref={edgeHandleRef}
            className="handle-edge pointer-events-auto absolute z-20"
            onPointerDown={(e) => handlePointerDown("edge", e)}
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "ew-resize",
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "white",
                border: "3px solid #2d6b42",
                borderRadius: "50%",
                boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                pointerEvents: "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Info bar */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--ink-soft)]">
        <span>
          <strong>Center:</strong>{" "}
          <span className="font-mono">
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </span>
        </span>
        <span>
          <strong>Radius:</strong>{" "}
          <span className="font-mono font-semibold text-[var(--accent)]">
            {radiusKm} km
          </span>
        </span>
      </div>
      <p className="text-[11px] text-[var(--ink-faint)]">
        🟢 Drag green = move &nbsp;|&nbsp; ⚪ Drag white = resize
        &nbsp;|&nbsp; Click map = set center
      </p>
    </div>
  );
}
