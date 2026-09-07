---
name: random-place
description: 'True random spot on Earth with Country → Locality hierarchy. Use for "random place", "surprise me", "geo roulette", /random-place.'
argument-hint: "[count] [--json] [--lang <code>]"
---

# Random Place

Pick a **true random** inhabited place, show `Country → Locality` hierarchy.

## When to Use

`/random-place`, `/geo-roulette`, or user says "random place", "surprise me", "pick a random city", "where should I travel?"

## Rules

- Never pick from memory. Always generate fresh CSPRNG coords + real reverse-geocode call.
- `secrets.SystemRandom()` with sphere-uniform: `lon = v*360-180`, `lat = degrees(asin(2*u-1))`.
- Nominatim: `User-Agent` required, ≤1 req/sec (`sleep 1.1`). Retry oceans up to 15x until `address.country` exists.
- Deepen to the lowest possible division **within budget**: if the hit stops at an upper division (only country/state/province/county, `place_rank <= 12`, no city/town/village/suburb-level key), spend **max 1 extra call** — a BigDataCloud nearest-settlement lookup shown as **context only** (`Nearest named place`, never merged into the hierarchy, since nearest ≠ containing). If nothing lower is mapped, fall back to the next upper division honestly and say so.
- Heavy lookups (HDX shapefiles, Overpass bulk polygons, multi-zoom sweeps) are out of budget — never do them inside this skill.

## Workflow

### 1. Generate + reverse-geocode

```bash
python3 .agents/skills/random-place/scripts/random_place.py --tries 15
# fallback if script missing:
python3 - << 'PY'
import secrets, math, time, json, urllib.request, urllib.parse
UA="random-place-skill/1.0"
sr = secrets.SystemRandom()
def reverse(lat, lon):
    q = urllib.parse.urlencode({"lat": lat, "lon": lon, "format":"json","addressdetails":1,"zoom":18,"accept-language":"en"})
    req = urllib.request.Request(f"https://nominatim.openstreetmap.org/reverse?{q}", headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=15) as r: return json.loads(r.read().decode())
for i in range(1, 16):
    lat = math.degrees(math.asin(2*sr.random()-1)); lon = sr.random()*360-180
    try: data = reverse(lat, lon)
    except Exception as e: print(f"! {e}"); time.sleep(1.5); continue
    addr = data.get("address") or {}
    if "country" not in addr: print(f"{i}: ocean, retry"); time.sleep(1.1); continue
    print(json.dumps({"lat":lat,"lon":lon,"display_name":data.get("display_name"),"address":addr}, ensure_ascii=False, indent=2)); break
    time.sleep(1.1)
PY
```

### 2. Deepen to lowest (bounded cascade)

The script does this automatically (`assess_depth` → one BigDataCloud nearest lookup → upper-division fallback). Manual equivalent:

```bash
# shallow = no city/town/village/municipality/city_district/borough/suburb/
# neighbourhood/quarter/hamlet/isolated_dwelling key, or place_rank <= 12
# → 1 extra call max: nearest named settlement, context only (never hierarchy)
python3 - << 'PY'
import json, urllib.request, urllib.parse
lat, lon = <hit_lat>, <hit_lon>  # from step 1
q = urllib.parse.urlencode({"latitude": f"{lat:.6f}", "longitude": f"{lon:.6f}", "localityLanguage": "en"})
req = urllib.request.Request(f"https://api.bigdatacloud.net/data/reverse-geocode-client?{q}", headers={"User-Agent": "random-place-skill/1.0"})
bdc = json.loads(urllib.request.urlopen(req, timeout=15).read().decode())
print(json.dumps({k: bdc.get(k) for k in ("city","locality","principalSubdivision","countryName")}, ensure_ascii=False, indent=2))
# report bdc.city/locality as "Nearest named place (context only)"; leaf stays at the upper division
PY
```

Cascade: Nominatim hit → (shallow? 1 BDC nearest lookup for context : done) → leaf = deepest Nominatim key present (upper-division fallback when shallow). Never invent a ward/village from centroid distance, nearest-town name, or memory.

### 3. Hierarchy

Include only keys that exist, top → bottom:
`country, region, state, province, state_district, county, district, city, town, village, municipality, city_district, borough, suburb, neighbourhood, quarter, hamlet, isolated_dwelling` + `postcode`/`road` as detail.

Labels are English-friendly per country via `label_for()` (`COUNTRY_TERMS` in script, generic `LABELS` fallback):
- Indonesia: `state→Province`, `county→Regency`, `district→District`, `village→Village`
- Japan: `state→Prefecture` · US: `state→State`, `county→County`
- Always show OSM key alongside: `**Regency** (`county`): Mimika`
- Gap rule: village present but `district` missing with `county` present → append `**⚠ Gap:** OSM gap: district level not mapped` (note only, never backfill).

### 4. Output both forms

A) Chain: `🌍 Japan → Kyushu → Fukuoka Prefecture → Fukuoka City → Hakata Ward → **Hakataekimae**`
B) Card:
```markdown
## 🎲 Random Place #1 (4 tries, secrets sphere-uniform)
**📍** `33.589, 130.401` — [OSM](https://www.openstreetmap.org/?mlat=33.589&mlon=130.401#map=14/33.589/130.401) · [Google](https://www.google.com/maps?q=33.589,130.401)
1. Country: Japan (日本) 2. Region: Kyushu 3. Prefecture: Fukuoka (福岡県) 4. City: Fukuoka 5. Ward: Hakata 6. Locality: Hakataekimae
**Raw:** <display_name> **What:** one-line locality description.
_Nearest (shallow hits only): nearest named settlement via BigDataCloud — context, not containing division._
_Depth: <no deepen needed | shallow, nearest = X → upper-division fallback>_
```
Leaf (`← **leaf locality**` in script output) = deepest Nominatim key after the deepen cascade. Report tries + randomness source + depth line.
If 15x ocean: report attempts + offer land-biased retry.

## Arguments

- `N` / `--count N`: N places, max 10, sequential with 1.1s spacing.
- `--json`: also dump raw `address` JSON. `--lang <code>`: Nominatim language, default `en`.
- `--no-deepen`: skip the deepen cascade, keep the raw Nominatim hit.

## Anti-Patterns

- No API call = no answer. No famous-city-from-memory.
- No hammering Nominatim. No country-only output.
- No HDX/Overpass/shapefile downloads or multi-zoom sweeps to force a lowest division — 1 nearest-lookup max, then upper-division fallback.
- No fake localities: never assign a ward/village from centroid distance, nearest-town name, or guesswork. If OSM maps nothing lower there (e.g. remote Isabel Province hit → province leaf, nearest Buala as context only), report the upper division + depth line.
