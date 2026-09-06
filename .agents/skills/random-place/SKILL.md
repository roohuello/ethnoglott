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
- Never stop at country — always drill to district + locality. Report tries + randomness source.

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

### 2. Hierarchy

Include only keys that exist, top → bottom:
`country, region, state, province, state_district, county, district, city, town, village, municipality, city_district, borough, suburb, neighbourhood, quarter, hamlet, isolated_dwelling` + `postcode`/`road` as detail.

### 3. Output both forms

A) Chain: `🌍 Japan → Kyushu → Fukuoka Prefecture → Fukuoka City → Hakata Ward → **Hakataekimae**`
B) Card:
```markdown
## 🎲 Random Place #1 (4 tries, secrets sphere-uniform)
**📍** `33.589, 130.401` — [OSM](https://www.openstreetmap.org/?mlat=33.589&mlon=130.401#map=14/33.589/130.401) · [Google](https://www.google.com/maps?q=33.589,130.401)
1. Country: Japan (日本) 2. Region: Kyushu 3. Prefecture: Fukuoka (福岡県) 4. City: Fukuoka 5. Ward: Hakata 6. Locality: Hakataekimae
**Raw:** <display_name> **What:** one-line locality description.
```
If 15x ocean: report attempts + offer land-biased retry.

## Arguments

- `N` / `--count N`: N places, max 10, sequential with 1.1s spacing.
- `--json`: also dump raw `address` JSON. `--lang <code>`: Nominatim language, default `en`.

## Anti-Patterns

- No API call = no answer. No famous-city-from-memory.
- No hammering Nominatim. No country-only output.
