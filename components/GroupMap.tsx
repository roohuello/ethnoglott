"use client";

import dynamic from "next/dynamic";
import type { RegionPoint } from "./GroupMapView";

const GroupMapView = dynamic(
  () => import("./GroupMapView").then((m) => m.GroupMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[320px] w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Loading map…
      </div>
    ),
  },
);

interface GroupMapProps {
  lat: number | null;
  lng: number | null;
  zoom: number | null;
  label: string;
  regions?: RegionPoint[];
  cities?: RegionPoint[];
  geojson?: string | null;
}

// Client-only boundary: Leaflet touches `window`, and Next 16 forbids
// `ssr: false` in Server Components — so the dynamic import lives here.
export function GroupMap(props: GroupMapProps) {
  return <GroupMapView {...props} />;
}

export type { RegionPoint };
