# Ethnoglott — Ubiquitous Language

## EthnicGroup
A people sharing identity, language(s), and homeland. Canonical term.
Never `tribe` (pejorative) or `nationality` (citizenship ≠ ethnicity).

## Name
English exonym (e.g. `Han Chinese`). Source of the Slug; secondary
display under the heading.

## Autonym
The group's self-name in its own language (e.g. `Hànzú`). Nullable.
PRIMARY display heading; falls back to Name when NULL. Searched
alongside Name. When equal to Name, the subline is hidden as redundant.

## Slug
URL identity for a group (`/groups/[slug]`), derived from Name, unique.
Stays ASCII even when Autonym is non-Latin.

## HomelandCentroid
A group-level `lat/lng + zoom` used as the map marker anchor and as the
fallback view when a group has no DistrictEntries. Not a territory claim.

## DistrictEntry
One `{name, lat, lng}` presence of a group in a lowest-admin division
(municipality, district). Each entry gets a map marker. An entry without
a polygon feature renders marker-only.

## Districts
The group's `DistrictEntry[]` — the single source of truth for
sub-national presence (no separate singular column). The card lists all
entries one-per-line.

## DistrictBoundary
The stored per-group polygon set (one feature per DistrictEntry) shaded
on the map and framed via fit-all. An extent display, never an
exclusivity claim — overlapping district claims between groups are
allowed.

## Distribution
`countries[]` (ISO 3166-1 English names) + `region` (continent enum:
Africa, Asia, Europe, North America, South America, Oceania, Middle East).
Homeland only in v1 — diaspora excluded. Sync rule: every Districts
entry's country appears in `countries[]` (seed-time convention, no FK).

## Language
Spoken language(s), `languages[]`. A group may list many.

## LanguageFamily
Single filter key per group (e.g. `Sino-Tibetan`). Simplification for
filtering; multilingual edge cases collapse to one family in v1.

## Population
Estimated headcount (int, nullable, implicitly undated). No source/year
tracking in v1. NULL hides the row.

## Summary
Hand-written 1–3 sentence overview.
