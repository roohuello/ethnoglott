"use client";

import type { FeatureCollection, Geometry } from "geojson";
import L from "leaflet";
import {
  CircleMarker,
  GeoJSON,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
} from "react-leaflet";

// Keyless tile source. Carto's endpoints started demanding API keys inside
// rendered tiles for some traffic — OSM standard needs no account. Swap
// this one line if providers change again.
const TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Leaflet's default marker images use relative paths that break under
// bundlers — point them at the version-pinned CDN instead.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
  ._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface RegionPoint {
  name: string;
  lat: number | null;
  lng: number | null;
}

interface GroupMapViewProps {
  lat: number | null;
  lng: number | null;
  zoom: number | null;
  label: string;
  regions?: RegionPoint[];
  cities?: RegionPoint[];
  geojson?: string | null;
}

function parseBoundary(
  raw: string | null | undefined,
): FeatureCollection | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      (parsed as { type?: unknown }).type === "FeatureCollection"
    ) {
      return parsed as FeatureCollection;
    }
    return null;
  } catch {
    return null;
  }
}

type LatLng = [number, number];

function collectPositions(geometry: Geometry, out: LatLng[]): void {
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates)
      for (const pos of ring) out.push([pos[1], pos[0]]);
  } else if (geometry.type === "MultiPolygon") {
    for (const poly of geometry.coordinates)
      for (const ring of poly)
        for (const pos of ring) out.push([pos[1], pos[0]]);
  }
}

function boundsOf(collection: FeatureCollection): LatLng[] | null {
  const positions: LatLng[] = [];
  for (const feature of collection.features) {
    if (feature.geometry) collectPositions(feature.geometry, positions);
  }
  if (positions.length === 0) return null;
  let south = positions[0][0];
  let north = positions[0][0];
  let west = positions[0][1];
  let east = positions[0][1];
  for (const [la, ln] of positions) {
    if (la < south) south = la;
    if (la > north) north = la;
    if (ln < west) west = ln;
    if (ln > east) east = ln;
  }
  return [
    [south, west],
    [north, east],
  ];
}

export function GroupMapView({
  lat,
  lng,
  zoom,
  label,
  regions = [],
  cities = [],
  geojson,
}: GroupMapViewProps) {
  const markers = regions.filter((d) => d.lat != null && d.lng != null);
  const cityMarkers = cities.filter((d) => d.lat != null && d.lng != null);
  const hasMarkers = markers.length > 0 || cityMarkers.length > 0;
  const approximate = !hasMarkers && (lat == null || lng == null);
  const boundary = parseBoundary(geojson);
  const bounds = boundary ? boundsOf(boundary) : null;

  const center: LatLng =
    markers.length > 0
      ? [markers[0].lat as number, markers[0].lng as number]
      : cityMarkers.length > 0
        ? [cityMarkers[0].lat as number, cityMarkers[0].lng as number]
        : lat != null && lng != null
          ? [lat, lng]
          : [20, 20];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border">
      <MapContainer
        bounds={bounds ?? undefined}
        boundsOptions={bounds ? { padding: [20, 20] } : undefined}
        center={bounds ? undefined : center}
        zoom={bounds ? undefined : (zoom ?? (approximate ? 1 : 4))}
        style={{ height: "100%", width: "100%", minHeight: 320 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={TILE_URL}
        />
        {boundary && (
          <GeoJSON
            data={boundary}
            style={{
              color: "#525252",
              weight: 2,
              opacity: 0.7,
              fillColor: "#525252",
              fillOpacity: 0.15,
            }}
          />
        )}
        {markers.map((m) => (
          <Marker key={m.name} position={[m.lat as number, m.lng as number]}>
            <Popup>{m.name}</Popup>
          </Marker>
        ))}
        {cityMarkers.map((m) => (
          <CircleMarker
            key={`city-${m.name}`}
            center={[m.lat as number, m.lng as number]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#0e7490",
              fillOpacity: 1,
            }}
          >
            <Popup>{m.name}</Popup>
          </CircleMarker>
        ))}
        {!hasMarkers && !approximate && (
          <Marker position={[lat as number, lng as number]}>
            <Popup>{label}</Popup>
          </Marker>
        )}
      </MapContainer>
      {approximate && (
        <span className="absolute top-3 left-3 z-[500] rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          Approximate location
        </span>
      )}
    </div>
  );
}
