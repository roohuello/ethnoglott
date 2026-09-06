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
A single `lat/lng + zoom` used ONLY as a display centroid for the map.
Not a territory claim. True boundaries are out of scope for v1.

## Distribution
`countries[]` (ISO 3166-1 English names) + `region` (continent enum:
Africa, Asia, Europe, North America, South America, Oceania, Middle East).
Homeland only in v1 — diaspora excluded.

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
