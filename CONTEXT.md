# Ethnoglott — Ubiquitous Language

## EthnicGroup
A people sharing identity, language(s), and homeland. Canonical term.
Never `tribe` (pejorative) or `nationality` (citizenship ≠ ethnicity).

## Name
English exonym in singular form (e.g. `Bulgarian`, not `Bulgarians`).
Source of the Slug; secondary display under the heading.

## Autonym
The group's self-name in its own language, singular form (e.g. `Hànzú`).
Nullable. Romanized Latin-script form, proper case (e.g. `Bŭlgarin`, not
`българин` or `bŭlgarin`). PRIMARY display heading; falls back to Name
when NULL.
Searched alongside Name. When equal to Name, the subline is hidden as
redundant.

## Slug
URL identity for a group (`/groups/[slug]`), derived from Name, unique.
Stays ASCII even when Autonym carries diacritics.

## HomelandCentroid
A group-level `lat/lng + zoom` used as the map marker anchor and as the
fallback view when a group has no RegionEntries. Not a territory claim.

## RegionEntry
One `{name, lat, lng}` presence of a group in an admin division
(municipality, district, county, arrondissement). Each entry gets a map marker. An entry without
a polygon feature renders marker-only.

## Regions
The group's `RegionEntry[]` — the single source of truth for
sub-national presence (no separate singular column). The card lists all
entries one-per-line.

## RegionBoundary
The stored per-group polygon set (one feature per RegionEntry) shaded
on the map and framed via fit-all. An extent display, never an
exclusivity claim — overlapping region claims between groups are
allowed.

## CityEntry
One `{name, lat, lng}` major town or city for a group. Each entry gets
a map dot marker (distinct from RegionEntry pins) and a card list row.

## Cities
The group's `CityEntry[]` — the single source of truth for major
settlements (no separate singular column). The card lists all entries
one-per-line; empty hides the row.

## Distribution
`countries[]` (ISO 3166-1 English names) + `continent` (enum:
Africa, Asia, Europe, North America, South America, Oceania, Middle East).
Homeland only in v1 — diaspora excluded. Sync rule: every Regions
entry's country appears in `countries[]` (seed-time convention, no FK).

## Language
Spoken language(s), `languages[]`. A group may list many.

## LanguageFamily
Single filter key per group (e.g. `Sino-Tibetan`). Simplification for
filtering; multilingual edge cases collapse to one family in v1.

## GlottologUrls
Map of language name → Glottolog page URL, one entry per value in
`languages[]` (e.g. `{ Kalaallisut:
`https://glottolog.org/resource/languoid/id/kala1399` }`). Every language
with a URL renders as a link in the UI; languages without one render as
plain text.

## Summary
Hand-written 1–3 sentence overview.
