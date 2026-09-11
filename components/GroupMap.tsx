"use client";

import dynamic from "next/dynamic";
import type { RegionPoint } from "./GroupMapView";

const GroupMapView = dynamic(
  () => import("./GroupMapView").then((m) => m.GroupMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-80 w-full items-center justify-center rounded-3xl border text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

interface GroupMapProps {
  lat: number | null;
  lng: number | null;
  label: string;
  regions?: RegionPoint[];
  cities?: RegionPoint[];
  geojson?: string | null;
}

// Client-only boundary: Leaflet needs window.
export function GroupMap(props: GroupMapProps) {
  return <GroupMapView {...props} />;
}
