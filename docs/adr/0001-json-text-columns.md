# ADR-0001: JSON text columns instead of normalized joins

Date: 2026-09-06
Status: accepted

## Context
`countries[]` and `languages[]` are multi-valued per
EthnicGroup. Options: (a) single `ethnic_groups` table with JSON text
columns, (b) normalized `countries` + `group_countries` join tables.

## Decision
Option (a): `text(mode: json)` columns in one table for v1.

## Rationale
- App is read-only reference, hand-seeded (dozens of rows, not thousands).
- Filtering by these fields is in-memory over ≤100 rows; no need for
  SQL-fast joins.
- Single table keeps seeding and Drizzle queries trivial.

## Consequences
- Revisit when row count or SQL-side filtering demands it.
- No referential integrity on country/language names (convention only).

## Alternatives considered
Normalized joins — rejected as over-engineering for v1 scale.
