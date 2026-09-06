"use client";

import * as maplibregl from "maplibre-gl";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";

const STYLE_URL =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

interface GroupMapProps {
  lat: number | null;
  lng: number | null;
  zoom: number | null;
  label: string;
}

export function GroupMap({ lat, lng, zoom, label }: GroupMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const approximate = lat == null || lng == null;

  useEffect(() => {
    if (!containerRef.current) return;
    const center: [number, number] =
      lat != null && lng != null ? [lng, lat] : [20, 20];
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center,
      zoom: zoom ?? (approximate ? 1 : 4),
    });
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    if (!approximate) {
      new maplibregl.Marker()
        .setLngLat(center)
        .setPopup(new maplibregl.Popup({ offset: 24 }).setText(label))
        .addTo(map);
    }
    return () => map.remove();
  }, [lat, lng, zoom, label, approximate]);

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden rounded-lg border">
      <div ref={containerRef} className="absolute inset-0" />
      {approximate && (
        <span className="absolute top-3 left-3 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Approximate location
        </span>
      )}
    </div>
  );
}
