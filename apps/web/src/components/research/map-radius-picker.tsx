"use client";

import { CircleDot, LocateFixed, MousePointer2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
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
  const centerHandleRef = useRef<HTMLButtonElement>(null);
  const edgeHandleRef = useRef<HTMLButtonElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);

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
      center[0] + r / 111_320 / Math.cos((center[1] * Math.PI) / 180),
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
  const fitMapToCircle = useCallback((center: [number, number], r: number) => {
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
  }, []);

  // Initialize map
  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return;
    let disposed = false;
    let readyTimer: ReturnType<typeof setTimeout> | null = null;

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

        let initialized = false;
        const initializeInteractiveMap = () => {
          if (disposed || initialized) return;
          initialized = true;

          fitMapToCircle(stateRef.current.center, stateRef.current.radius);
          setMapReady(true);

          map.on("move", updateOverlay);
          map.on("zoom", updateOverlay);

          map.on("click", (e: MapMouseEvent) => {
            if (stateRef.current.dragging) return;
            const ll = e.lngLat;
            stateRef.current.center = [ll.lng, ll.lat];
            setLatitude(Math.round(ll.lat * 1e6) / 1e6);
            setLongitude(Math.round(ll.lng * 1e6) / 1e6);
            updateOverlay();
            onCenterChange?.(ll.lat, ll.lng);
          });
        };

        map.once("load", initializeInteractiveMap);
        map.once("style.load", initializeInteractiveMap);
        readyTimer = setTimeout(initializeInteractiveMap, 800);
      });
    }, 100);

    return () => {
      disposed = true;
      clearTimeout(timer);
      if (readyTimer) clearTimeout(readyTimer);
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
        Math.min(100_000, stateRef.current.startRadius + deltaX * 10),
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

  function handleHandleKeyDown(
    which: "center" | "edge",
    event: KeyboardEvent<HTMLButtonElement>,
  ) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      return;
    }
    event.preventDefault();

    if (which === "center") {
      const coordinateStep = event.shiftKey ? 0.005 : 0.001;
      const [currentLng, currentLat] = stateRef.current.center;
      const nextLat =
        currentLat +
        (event.key === "ArrowUp" ? coordinateStep : event.key === "ArrowDown" ? -coordinateStep : 0);
      const nextLng =
        currentLng +
        (event.key === "ArrowRight" ? coordinateStep : event.key === "ArrowLeft" ? -coordinateStep : 0);
      stateRef.current.center = [nextLng, nextLat];
      setLatitude(Math.round(nextLat * 1e6) / 1e6);
      setLongitude(Math.round(nextLng * 1e6) / 1e6);
      updateOverlay();
      onCenterChange?.(nextLat, nextLng);
      return;
    }

    const radiusStep = event.shiftKey ? 1000 : 250;
    const direction = ["ArrowUp", "ArrowRight"].includes(event.key) ? 1 : -1;
    const nextRadius = Math.max(
      100,
      Math.min(100_000, stateRef.current.radius + radiusStep * direction),
    );
    stateRef.current.radius = nextRadius;
    setRadius(nextRadius);
    updateOverlay();
    onRadiusChange?.(nextRadius);
    fitMapToCircle(stateRef.current.center, nextRadius);
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
    <div>
      <div className="relative h-[360px] w-full overflow-hidden rounded-lg border border-[var(--rule-strong)] bg-[var(--paper-muted)] shadow-[var(--shadow-inset)] sm:h-[480px] lg:h-[540px]">
        {/* Map canvas */}
        <div
          ref={wrapperRef}
          className="absolute inset-0 [&_.maplibregl-canvas]:grayscale-[0.45] [&_.maplibregl-canvas]:saturate-[0.7]"
          style={{ height: "100%", width: "100%" }}
        />

        {!mapReady ? (
          <div className="absolute inset-0 z-40 grid place-items-center bg-[var(--paper-muted)]">
            <span className="font-mono text-[0.68rem] font-bold tracking-[0.12em] text-[var(--ink-faint)] uppercase">
              Loading geographic canvas
            </span>
          </div>
        ) : null}

        <div className="pointer-events-none absolute top-3 left-3 z-30 flex items-center gap-2 rounded-md border border-white/80 bg-[rgb(255_255_255/0.9)] px-3 py-2 shadow-[0_8px_24px_rgb(11_18_32/0.14)] backdrop-blur-md">
          <LocateFixed aria-hidden="true" className="text-[var(--accent)]" size={15} />
          <span className="font-mono text-[0.63rem] font-bold tracking-[0.08em] text-[var(--ink)] uppercase">
            Live boundary editor
          </span>
        </div>

        {/* Overlay container */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ zIndex: 10 }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div
            ref={circleRef}
            className="pointer-events-none absolute"
            style={{
              borderRadius: "50%",
              background: "rgba(49, 94, 245, 0.2)",
              border: "3px solid rgba(49, 94, 245, 0.9)",
              boxShadow:
                "0 0 0 1px rgba(255, 255, 255, 0.65), inset 0 0 36px rgba(49, 94, 245, 0.14)",
              zIndex: 5,
              transform: "translate(-50%, -50%)",
              transition: "none",
            }}
          />

          <div
            ref={lineRef}
            className="pointer-events-none absolute"
            style={{
              height: "2.5px",
              backgroundImage:
                "repeating-linear-gradient(to right, #315ef5 0, #315ef5 8px, transparent 8px, transparent 14px)",
              transformOrigin: "0 0",
              zIndex: 6,
            }}
          />

          <div
            ref={labelRef}
            className="pointer-events-none absolute z-30"
            style={{ transform: "translateX(-50%)" }}
          >
            <span className="rounded-md border border-[#8da6ff] bg-[var(--graphite)] px-2.5 py-1 font-mono text-[10px] font-bold text-white shadow-[0_6px_18px_rgb(11_18_32/0.28)]">
              {radiusKm} km
            </span>
          </div>

          <button
            aria-label="Move research area center. Use arrow keys to reposition."
            ref={centerHandleRef}
            className="handle-center pointer-events-auto absolute z-20 rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
            onKeyDown={(event) => handleHandleKeyDown("center", event)}
            onPointerDown={(e) => handlePointerDown("center", e)}
            type="button"
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: 0,
              cursor: "grab",
              padding: 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "#315ef5",
                border: "3px solid white",
                borderRadius: "50%",
                boxShadow: "0 2px 12px rgba(0,0,0,0.5)",
                pointerEvents: "none",
              }}
            />
          </button>

          <button
            aria-label="Resize research area. Use arrow keys to change radius."
            ref={edgeHandleRef}
            className="handle-edge pointer-events-auto absolute z-20 rounded-full focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]"
            onKeyDown={(event) => handleHandleKeyDown("edge", event)}
            onPointerDown={(e) => handlePointerDown("edge", e)}
            type="button"
            style={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: 0,
              cursor: "ew-resize",
              padding: 0,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div
              style={{
                width: 22,
                height: 22,
                background: "white",
                border: "3px solid #315ef5",
                borderRadius: "50%",
                boxShadow: "0 2px 10px rgba(0,0,0,0.4)",
                pointerEvents: "none",
              }}
            />
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3 rounded-md border border-[var(--rule)] bg-[var(--paper-subtle)] px-4 py-3 text-xs text-[var(--ink-soft)] sm:grid-cols-[1fr_auto_auto] sm:items-center">
        <span className="flex items-center gap-2">
          <LocateFixed aria-hidden="true" className="text-[var(--accent)]" size={15} />
          Center <strong className="font-mono text-[var(--ink)]">{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong>
        </span>
        <span className="flex items-center gap-2">
          <CircleDot aria-hidden="true" className="text-[var(--copper)]" size={15} />
          Radius <strong className="font-mono text-[var(--ink)]">{radiusKm} km</strong>
        </span>
        <span className="flex items-center gap-2 text-[var(--ink-faint)]">
          <MousePointer2 aria-hidden="true" size={14} />
          Drag or use arrow keys
        </span>
      </div>
    </div>
  );
}
