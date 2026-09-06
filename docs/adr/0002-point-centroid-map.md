# ADR-0002: Point centroid map instead of polygons

Date: 2026-09-06
Status: superseded by ADR-0003; render stack since moved MapLibre →
Leaflet, see ADR-0004.

## Context
Detail page needs a MapLibre view of "where the group lives". Options:
(a) territory polygons, (b) point centroid (`lat/lng + zoom`) marker.

## Decision
Option (b) for v1. Schema reserves nullable `geojson` text for future
polygons but nothing renders it yet.

## Rationale
- No open-licensed ethnic-boundary polygon dataset available at seed time.
- Per-group geometry decided at seed time; most rows will only have a
  point. A marker + zoom is honest and shippable.
- NULL geo falls back to world view + "approximate location" badge, so
  the map never breaks.

## Consequences
- Points for transnational groups (e.g. Kurds) are approximate by design.
- Polygon rendering is a later, additive change (read `geojson` when set).

## Alternatives considered
Polygons now — rejected: blocked on data licensing and scope.
