# ADR-0003: Per-group district boundaries + districts JSON

Date: 2026-09-06
Status: accepted
Supersedes: ADR-0002 (boundaries were "out of scope"; they are now in)

## Context
The detail map must render the lowest admin division (municipality /
district), not just a point. A group may span several divisions and
countries (e.g. Mambwe in Zambia + Tanzania). Options: (a) per-group
boundary polygon stored in the `geojson` column as a FeatureCollection
(one feature per division) + a `districts` JSON array of
`{name, lat, lng}` marker anchors on the row, (b) normalized
`districts` + `group_districts` join tables with a geometry table,
(c) fetch boundaries at runtime from OSM/Nominatim.

## Decision
Option (a), extending the ADR-0001 doctrine: single table, JSON text
columns, seed-time discipline, no FKs.

## Rationale
- Read-only reference at sample scale; in-memory filtering needs no joins.
- Seed-time fetch + simplify (cap ~100KB) keeps renders fast and the app
  fully offline-capable — no runtime geo dependency to fail.
- One marker per entry + fit-all framing matches the map's job: showing
  where the group lives.
- Sync rule (every entry's country ∈ `countries[]`) is enforced by seeder
  discipline, exactly like country/language name conventions.

## Consequences
- Boundary freshness is frozen at seed time; re-seed to refresh.
- Entries without a polygon feature are marker-only (allowed, not an error).
- Overlapping claims between groups are allowed — boundaries are extent
  displays, never exclusivity claims.

## Alternatives considered
Normalized joins — rejected as over-engineering at this scale.
Runtime fetch — rejected: network dependency on the critical render path.
