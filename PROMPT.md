# Ethnoglott continuation prompt (v3)

Add exactly 1 group from 1 pure-random `countries-admin1.csv` row.
Fresh seed each round, no backlog. Log draw idx/seed.

## Selection

Honor the draw — never re-draw. Slug exists → EXPAND it (`UPDATE
regions[]/cities[]`, append GeoJSON feature, regression-check old
features + 250KB cap). Only a stop-request skips; remove only
stopped-work artifacts.

## CSV reading

`subdivision` may be the district center, not the district
(Dylym → Kazbekovsky raion). Boundary target = parent district.

## Indigeneity gate (evidence BEFORE write)

Census/ethnographic source for autochthonous majority IN THAT
DIVISION (2010: Kazbekovsky 85.9% Avar). Country-majority
inference ≠ proof. Note minorities; abort if contradicted.

## Names (group's language, not admin's)

- ASCII slug ← English singular exonym. `summary=''`.
- Endonym: native singular, romanized Latin proper case,
  dictionary-grade source (магӀарулав → `Magharulav`). Subgroups
  `[]` unless sourced.
- Region/city: prefer OSM `name:<group-lang>` over `:ru`/`:en`
  (Казбек мухъ, Дилим). Romanize, document mapping (мухъ→mukh).
  New admin term → add lowercase pill to `GroupDetailCard`.
- ISO countries; continent follows same-country precedent.
  Extend `country-codes.ts` only if missing.
- `languages[]` ↔ `glottolog_urls` 1:1, every URL HTTP-200
  (ids retire: bela1252, ava1243–45). Family/subfamily ←
  Glottolog tree path.

## GeoJSON

`scripts/geo/<slug>.geojson`: FeatureCollection <250KB,
`[lng,lat]`, `{stem, admin, © OSM ODbL, osm_relation}`, smallest
tolerance ≥0.0001° that fits.
- `outer` may hide far exclaves (kutans). Verify each:
  reverse-geocode admin + resident ethnicity. Keep verified
  district land (extent, never exclusivity — ADR-0003). Drop
  only with stated cause.
- Appends keep old features intact (check multi-feature path).

## Markers

Pins render iff coords set. Marker-less = null region lat/lng
(precedent: polish, croatian). "Boundary ⇒ no pins" globally is
out of scope (vs ADR-0003).

## Write + verify

`DATABASE_URL` + psycopg2 upsert only.
Matrix: SELECT-back, sync rules, REST row + chips
(name/endonym/ASCII-fold), shape / bbox / rings-preserved /
bytes, city point-in-polygon, CSV grep, pill split, biome.
No builds unless asked. Retry flaky edge once.

## Ship

Commit + push after every successful round (`feat:` style).
Stage intended files only (never secrets); inspect
`status`/`diff`/`log` first. Leave foreign diffs uncommitted.
