# ADR-0004: Leaflet over MapLibre for rendering

Date: 2026-09-06
Status: accepted

## Context
The detail map rendered nothing but a blank pane in the browser while
every server check passed (see map debugging: Turbopack emits MapLibre's
`maplibre-gl-worker.*.mjs` without rewriting its sibling import of
`maplibre-gl-shared.mjs`, so the worker 404s at startup and dies
silently — reproduced byte-for-byte in our own `.next` output,
upstream `vercel/next.js#98137`). Vendoring the worker plus
`setWorkerUrl()` (the documented workaround) fixed worker loading, but
confidence in the GL stack under Turbopack was spent. Options: (a) keep
MapLibre GL (vector, GPU) with the vendored-worker workaround, (b) move
to Leaflet + react-leaflet (DOM raster, no WebGL, no worker).

## Decision
Option (b): `leaflet@1.9` + `react-leaflet@5` (React 19 line), Carto
`light_all` raster tiles (same positron look, keyless), boundary via
react-leaflet `GeoJSON`, framing via `MapContainer bounds`, client-only
boundary via `next/dynamic ssr:false` (required: Leaflet touches
`window`; Next 16 forbids `ssr:false` in Server Components, so the
dynamic call lives in a client loader).

## Rationale
- Leaflet has no WebGL context and no web worker — the entire observed
  failure class (worker 404, GL init) structurally cannot occur.
- Stored data is renderer-neutral: the ADR-0003 FeatureCollection feeds
  `<GeoJSON>` directly, `regions[]` feeds `<Marker>`s, `lat/lng`
  fallback and bounds-fit map 1:1.
- Verified first on an isolated `/map-test` probe before touching the
  detail page.

## Consequences
- No vector crispness or GL effects; raster tiles at high zoom instead.
- Leaflet default marker images break under bundlers — fixed once via
  `L.Icon.Default.mergeOptions` with version-pinned CDN URLs.
- MapLibre, its worker-vendoring script, and the `predev`/`prebuild`
  hooks are fully removed (no dead weight).

## Alternatives considered
Staying on MapLibre with the vendored worker — rejected: workaround
held at the HTTP level, but every remaining symptom would still be
debugged blind (silent worker, no console surface).
