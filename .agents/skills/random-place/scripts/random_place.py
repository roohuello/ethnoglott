#!/usr/bin/env python3
"""
random_place.py — True random place finder with administrative hierarchy.

Generates cryptographically strong random coordinates (CSPRNG, sphere-uniform)
and reverse-geocodes via Nominatim to reveal the full admin hierarchy:
  Country → Province/State → District/County → City/Town → Locality

Usage:
  python3 random_place.py
  python3 random_place.py --count 3
  python3 random_place.py --lang ja --json
  python3 random_place.py --tries 20 --quick
  python3 random_place.py --no-deepen   # skip lowest-division deepen, keep raw Nominatim hit

Requirements: Python 3.8+, stdlib only (no pip needed). Needs internet for Nominatim.
Nominatim policy: 1 req/sec, identifiable User-Agent. We sleep 1.1s between calls.

Deepen policy: after a land hit, if the hierarchy stops at an upper division
(province/state/county, place_rank <= 12, no locality key), spend at most
DEEPEN_MAX_EXTRA_CALLS (1) extra call — a BigDataCloud nearest-settlement
lookup shown as context only (nearest != containing, so it never rewrites the
hierarchy). Heavy lookups (HDX shapefiles, Overpass bulk polygons) are out
of budget: the leaf falls back to the next upper division and says so.
"""

import argparse
import json
import math
import secrets
import sys
import time
import urllib.parse
import urllib.request
import urllib.error

UA = "random-place-skill/1.0"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"

# Ordered hierarchy keys — only those present are shown, in this order.
# Includes both generic and country-specific variants.
HIERARCHY_ORDER = [
    "country",
    "region",
    "state",
    "province",
    "state_district",
    "county",
    "district",
    "city",
    "town",
    "village",
    "municipality",
    "city_district",
    "borough",
    "suburb",
    "neighbourhood",
    "quarter",
    "hamlet",
    "isolated_dwelling",
    "island",
]

# Human labels for OSM keys (generic fallback)
LABELS = {
    "country": "Country",
    "region": "Region",
    "state": "State / Province",
    "province": "Province",
    "state_district": "State District / Département",
    "county": "County / District",
    "district": "District",
    "city": "City",
    "town": "Town",
    "village": "Village",
    "municipality": "Municipality",
    "city_district": "City District / Ward",
    "borough": "Borough",
    "suburb": "Suburb",
    "neighbourhood": "Neighbourhood",
    "quarter": "Quarter",
    "hamlet": "Hamlet",
    "isolated_dwelling": "Isolated Dwelling",
    "island": "Island",
    "postcode": "Postcode",
    "road": "Road",
}

# Per-country English-friendly admin terms (true parallel, not overly native).
# e.g. ID OSM county = Kabupaten = Regency; state = Provinsi = Province.
# Keeps generic LABELS as fallback for all other countries.
COUNTRY_TERMS = {
    "indonesia": {
        "state": "Province",
        "county": "Regency",
        "district": "District",
        "village": "Village",
        "state_district": "District",
        "city": "City",
        "town": "Town",
    },
    "japan": {
        "state": "Prefecture",
        "county": "District",
        "district": "District",
    },
    "united states": {
        "state": "State",
        "county": "County",
    },
    "usa": {
        "state": "State",
        "county": "County",
    },
}


def label_for(country: str, key: str) -> str:
    """English-friendly label for OSM key, localized per country."""
    terms = COUNTRY_TERMS.get((country or "").strip().lower())
    if terms and key in terms:
        return terms[key]
    return LABELS.get(key, key)


def detect_gaps(address: dict) -> list:
    """Annotate skipped OSM levels (never backfills — note only)."""
    notes = []
    has_county = bool(address.get("county"))
    has_district = bool(address.get("district"))
    has_below = any(
        address.get(k)
        for k in ("village", "hamlet", "isolated_dwelling", "quarter", "neighbourhood", "suburb")
    )
    if has_county and not has_district and has_below:
        notes.append(
            "OSM gap: district level not mapped (village present but district missing)"
            " — leaf falls back to next upper division"
        )
    return notes

# Keys that count as "reached a locality" (vs stopping at an upper division).
# If none of these are present after reverse-geocode, the hit is shallow and
# worth one bounded deepen attempt before falling back to the upper division.
LOCALITY_KEYS = [
    "city",
    "town",
    "village",
    "municipality",
    "city_district",
    "borough",
    "suburb",
    "neighbourhood",
    "quarter",
    "hamlet",
    "isolated_dwelling",
]

# Deepen budget: max EXTRA network calls per place to chase a lower division.
# Keep at 1 (BigDataCloud nearest-place lookup, different host, no Nominatim
# quota impact). Its result is NEAREST-settlement context only — never merged
# into the hierarchy, because "nearest town" is not "containing division"
# (proven: Isabel-province point → nearest "Buala" ~100km away; listing Buala
# as the leaf would falsely place the point inside that town).
# Heavy options (HDX shapefile downloads, Overpass bulk polygon lookups) are
# explicitly OUT of budget — fall back to the next upper division instead.
DEEPEN_MAX_EXTRA_CALLS = 1

FLAG_BY_COUNTRY = {
    "japan": "🇯🇵", "thailand": "🇹🇭", "germany": "🇩🇪", "france": "🇫🇷",
    "united states": "🇺🇸", "usa": "🇺🇸", "united kingdom": "🇬🇧", "uk": "🇬🇧",
    "brazil": "🇧🇷", "china": "🇨🇳", "india": "🇮🇳", "canada": "🇨🇦",
    "australia": "🇦🇺", "russia": "🇷🇺", "italy": "🇮🇹", "spain": "🇪🇸",
    "mexico": "🇲🇽", "indonesia": "🇮🇩", "south korea": "🇰🇷", "north korea": "🇰🇵",
    "turkey": "🇹🇷", "iran": "🇮🇷", "egypt": "🇪🇬", "south africa": "🇿🇦",
    "nigeria": "🇳🇬", "argentina": "🇦🇷", "poland": "🇵🇱", "ukraine": "🇺🇦",
    "netherlands": "🇳🇱", "switzerland": "🇨🇭", "sweden": "🇸🇪", "norway": "🇳🇴",
    "denmark": "🇩🇰", "finland": "🇫🇮", "greece": "🇬🇷", "portugal": "🇵🇹",
    "belgium": "🇧🇪", "austria": "🇦🇹", "philippines": "🇵🇭", "vietnam": "🇻🇳",
    "pakistan": "🇵🇰", "bangladesh": "🇧🇩", "colombia": "🇨🇴", "chile": "🇨🇱",
    "peru": "🇵🇪", "venezuela": "🇻🇪", "new zealand": "🇳🇿",
}


def rand_coord_sphere_uniform():
    """True random via OS CSPRNG, uniform on sphere (no pole bias)."""
    sr = secrets.SystemRandom()
    u = sr.random()  # [0,1)
    v = sr.random()
    lon = v * 360.0 - 180.0
    lat = math.degrees(math.asin(2 * u - 1))
    return lat, lon


def rand_coord_simple():
    """True random simple uniform lat/lon (pole-biased but simpler)."""
    sr = secrets.SystemRandom()
    lat = sr.uniform(-90, 90)
    lon = sr.uniform(-180, 180)
    return lat, lon


def reverse_geocode(lat, lon, lang="en", zoom=18):
    # Try Nominatim first
    params = {
        "lat": f"{lat:.6f}",
        "lon": f"{lon:.6f}",
        "format": "json",
        "addressdetails": "1",
        "zoom": str(zoom),
        "accept-language": lang,
    }
    url = f"{NOMINATIM_URL}?{urllib.parse.urlencode(params)}"
    headers = {
        "User-Agent": UA,
        "Accept": "application/json",
        "Accept-Language": lang,
        "Referer": "https://github.com/random-place-skill",
    }
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=20) as r:
            body = r.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as e:
        # Fallback to BigDataCloud on 403/429 (Nominatim rate-limit or block)
        if e.code in (403, 429):
            raise  # let caller handle sleep/retry, fallback handled there
        raise

def reverse_geocode_bigdatacloud(lat, lon, lang="en"):
    """Fallback provider — BigDataCloud free reverse geocode (no key, CORS-friendly)."""
    # localityLanguage controls language, requires ISO 639-1
    params = {
        "latitude": f"{lat:.6f}",
        "longitude": f"{lon:.6f}",
        "localityLanguage": lang if len(lang) == 2 else "en",
    }
    url = f"https://api.bigdatacloud.net/data/reverse-geocode-client?{urllib.parse.urlencode(params)}"
    headers = {"User-Agent": UA, "Accept": "application/json"}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=15) as r:
        body = r.read().decode("utf-8")
        data = json.loads(body)
        # Map BigDataCloud response to Nominatim-like structure
        # BigDataCloud keys: countryName, principalSubdivision (state/province), city, locality, etc.
        address = {}
        if data.get("countryName"):
            address["country"] = data["countryName"]
        if data.get("countryCode"):
            address["country_code"] = data["countryCode"].lower()
        if data.get("principalSubdivision"):
            address["state"] = data["principalSubdivision"]
        if data.get("principalSubdivisionCode"):
            address["ISO3166-2-lvl4"] = data["principalSubdivisionCode"]
        if data.get("city"):
            address["city"] = data["city"]
        if data.get("locality"):
            # locality is often district/suburb
            if "city" not in address:
                address["city"] = data["locality"]
            else:
                address["suburb"] = data["locality"]
        if data.get("postcode"):
            address["postcode"] = data["postcode"]
        # Build display_name-like string
        parts = [v for v in [data.get("locality"), data.get("city"), data.get("principalSubdivision"), data.get("countryName")] if v]
        display = ", ".join(parts) if parts else f"{lat:.4f}, {lon:.4f}"
        return {
            "display_name": display,
            "address": address,
            "osm_type": "node",
            "osm_id": 0,
            "place_rank": 22,
            "category": "place",
            "type": "village" if data.get("locality") else "administrative",
            "_provider": "bigdatacloud",
            "_raw": data,
        }


def assess_depth(address: dict, data: dict, hierarchy: list):
    """Decide if a hit is shallow (upper division only) and worth deepening.

    Returns (is_shallow, reason). Shallow = no LOCALITY_KEYS present, or
    Nominatim place_rank <= 12 (country/state/province/county level).
    """
    has_locality = any(address.get(k) for k in LOCALITY_KEYS)
    rank = data.get("place_rank")
    try:
        rank = int(rank) if rank not in (None, "?", "") else None
    except (TypeError, ValueError):
        rank = None
    if has_locality:
        return False, "already at locality level"
    if rank is not None and rank <= 12:
        return True, f"place_rank {rank} <= 12 (upper division)"
    if len(hierarchy) <= 2:
        return True, f"only {len(hierarchy)} hierarchy level(s)"
    return True, "no locality key present"


def fetch_nearest_context(lat, lon, lang="en", verbose=True):
    """One bounded deepen attempt: BigDataCloud nearest-settlement lookup.

    Costs max 1 extra call (different provider, no Nominatim quota impact).
    Returns (nearest_name_or_None, note). The name is CONTEXT ONLY — the
    caller must NOT merge it into the hierarchy, because BigDataCloud returns
    the nearest named settlement, not the containing division.
    """
    try:
        bdc = reverse_geocode_bigdatacloud(lat, lon, lang=lang)
    except Exception as e:
        if verbose:
            print(f"  -> deepen: nearest lookup failed ({e}), keeping upper division", file=sys.stderr)
        return None, f"deepen attempted (BigDataCloud), failed: {e}"
    raw = bdc.get("_raw") or {}
    nearest = raw.get("locality") or raw.get("city") or None
    if nearest:
        if verbose:
            print(f"  -> deepen: nearest named place is {nearest} (context only, not containing division)", file=sys.stderr)
        return nearest, f"nearest named place via BigDataCloud: {nearest} (context only)"
    if verbose:
        print(f"  -> deepen: no lower division found, keeping upper division", file=sys.stderr)
    return None, "BigDataCloud: nothing lower mapped"


def build_hierarchy(address: dict):
    """Return ordered list of (key, label, value) for hierarchy."""
    # Deduplicate: OSM sometimes has same value under different keys; keep first occurrence
    country = address.get("country", "")
    seen_values = set()
    hierarchy = []
    for key in HIERARCHY_ORDER:
        val = address.get(key)
        if not val:
            continue
        norm = val.strip().lower()
        if norm in seen_values:
            continue
        seen_values.add(norm)
        hierarchy.append((key, label_for(country, key), val))
    return hierarchy


def compact_chain(hierarchy):
    """Compact chain like Country → Province → District → Place"""
    parts = [v for _, _, v in hierarchy]
    return " → ".join(parts) if parts else "(no hierarchy)"


def format_card(place_idx, tries, lat, lon, data, address, hierarchy, lang, deepen_info=None):
    display = data.get("display_name", "")
    osm_type = data.get("osm_type", "?")
    osm_id = data.get("osm_id", "?")
    place_rank = data.get("place_rank", "?")
    category = data.get("category", "?")
    typ = data.get("type", "?")
    country_name = address.get("country", "Unknown")
    flag = FLAG_BY_COUNTRY.get(country_name.strip().lower(), "🌍")

    # map links
    osm_link = f"https://www.openstreetmap.org/?mlat={lat:.6f}&mlon={lon:.6f}#map=14/{lat:.6f}/{lon:.6f}"
    gmaps_link = f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}"

    lines = []
    lines.append(f"## 🎲 Random Place #{place_idx} (found in {tries} {'try' if tries==1 else 'tries'})")
    lines.append(f"**📍 Coordinates:** `{lat:.6f}, {lon:.6f}` — [OpenStreetMap]({osm_link}) · [Google Maps]({gmaps_link})")
    lines.append("")
    lines.append(f"**Compact hierarchy:**")
    lines.append(f"> {flag} " + compact_chain(hierarchy))
    lines.append("")
    lines.append(f"**Hierarchy (Country → Locality):**")
    for i, (key, label, val) in enumerate(hierarchy, 1):
        # mark leaf
        leaf_mark = " ← **leaf locality**" if i == len(hierarchy) else ""
        lines.append(f"{i}. **{label}** (`{key}`): {val}{leaf_mark}")
    lines.append("")
    if display:
        lines.append(f"**Raw address:** {display}")
    if address.get("postcode"):
        lines.append(f"**Postcode:** {address['postcode']}")
    if address.get("road"):
        lines.append(f"**Road/Street:** {address['road']}")
    lines.append(f"**OSM:** `type={osm_type}` `id={osm_id}` `rank={place_rank}` `category={category}` `type={typ}`")
    if data.get("_nearest_place"):
        lines.append(f"**Nearest named place (context only, not containing division):** {data['_nearest_place']}")
    for gap in detect_gaps(address):
        lines.append(f"**⚠ Gap:** {gap}")
    # one-line description
    if typ and typ not in ("yes", "administrative"):
        lines.append(f"**What is this place?** OSM classifies it as **{typ}** ({category}) — {display.split(',')[0] if display else 'locality'}.")
    lines.append("")
    lines.append(f"_Randomness: CSPRNG (`secrets.SystemRandom`, OS entropy, sphere-uniform) · Lang: `{lang}` · Reverse: Nominatim OSM (zoom 18, addressdetails=1)_")
    if deepen_info:
        lines.append(f"_Depth: {deepen_info}_")
    return "\n".join(lines)


def find_one_place(max_tries=15, lang="en", quick=False, verbose=True, deepen=True):
    rand_fn = rand_coord_simple if quick else rand_coord_sphere_uniform
    method = "simple uniform lat/lon (CSPRNG)" if quick else "sphere-uniform (asin, CSPRNG)"

    for attempt in range(1, max_tries + 1):
        lat, lon = rand_fn()
        if verbose:
            print(f"[{attempt}/{max_tries}] Trying {lat:.6f}, {lon:.6f} ...", file=sys.stderr, flush=True)
        data = None
        try:
            data = reverse_geocode(lat, lon, lang=lang)
        except urllib.error.HTTPError as e:
            msg = f"HTTP {e.code}: {e.reason}"
            print(f"  ! Nominatim {msg} — trying fallback provider...", file=sys.stderr)
            # Respect rate limit
            wait = 2.5 if e.code == 429 else 1.5
            time.sleep(wait)
            try:
                data = reverse_geocode_bigdatacloud(lat, lon, lang=lang)
                print(f"  -> fallback BigDataCloud used", file=sys.stderr)
            except Exception as be:
                print(f"  ! Fallback also failed: {be} — retrying with new coords in 1.1s", file=sys.stderr)
                time.sleep(1.1)
                continue
        except Exception as e:
            print(f"  ! Geocode error: {e} — trying fallback...", file=sys.stderr)
            try:
                data = reverse_geocode_bigdatacloud(lat, lon, lang=lang)
                print(f"  -> fallback BigDataCloud used", file=sys.stderr)
            except Exception as be:
                print(f"  ! Fallback also failed: {be} — sleeping 1.1s", file=sys.stderr)
                time.sleep(1.1)
                continue

        if data is None:
            time.sleep(1.1)
            continue

        addr = data.get("address") or {}
        err = data.get("error")
        # Nominatim returns {"error":"Unable to geocode"} for ocean
        if err or not addr or "country" not in addr:
            print(f"  -> ocean/unmapped ({err or 'no country'}), retrying...", file=sys.stderr)
            time.sleep(1.1)
            continue

        hierarchy = build_hierarchy(addr)
        if not hierarchy:
            print(f"  -> no hierarchy parsed, retrying...", file=sys.stderr)
            time.sleep(1.1)
            continue

        # Deepen: chase the lowest possible division within budget, else
        # fall back to the next upper division honestly (no fake localities).
        # The 1-call deepen only fetches NEAREST-settlement context — it never
        # rewrites the hierarchy, since nearest != containing.
        deepen_info = "no deepen needed (locality reached)"
        if deepen:
            shallow, reason = assess_depth(addr, data, hierarchy)
            if shallow:
                if verbose:
                    print(f"  -> shallow ({reason}), deepening within budget (max {DEEPEN_MAX_EXTRA_CALLS} extra call)...", file=sys.stderr)
                nearest, note = fetch_nearest_context(lat, lon, lang=lang, verbose=verbose)
                if nearest:
                    data = dict(data)
                    data["_nearest_place"] = nearest
                deepen_info = f"shallow ({reason}) → {note}; leaf falls back to next upper division"

        # success
        if verbose:
            print(f"  ✓ Found: {compact_chain(hierarchy)}", file=sys.stderr)
        return {
            "attempt": attempt,
            "lat": lat,
            "lon": lon,
            "data": data,
            "address": addr,
            "hierarchy": hierarchy,
            "method": method,
            "deepen_info": deepen_info,
        }
        # sleep not needed on success for single, but for batch we sleep between places

    return None


def main():
    p = argparse.ArgumentParser(description="True random place finder — administrative hierarchy")
    p.add_argument("--count", "-c", type=int, default=1, help="How many random places (1-10, default 1)")
    p.add_argument("--tries", type=int, default=15, help="Max tries per place before giving up (default 15)")
    p.add_argument("--lang", default="en", help="Accept-language for Nominatim (default en, e.g., ja, th, de)")
    p.add_argument("--json", action="store_true", help="Also dump raw JSON for each place")
    p.add_argument("--quick", action="store_true", help="Use simple uniform lat/lon instead of sphere-uniform")
    p.add_argument("--raw", action="store_true", help="Only output raw JSON (no markdown card)")
    p.add_argument("--no-deepen", action="store_true", help="Skip lowest-division deepen (keep raw Nominatim hit)")
    args = p.parse_args()

    count = max(1, min(args.count, 10))
    results = []

    for i in range(1, count + 1):
        res = find_one_place(max_tries=args.tries, lang=args.lang, quick=args.quick, verbose=not args.raw, deepen=not args.no_deepen)
        if not res:
            print(f"\n❌ Place #{i}: failed after {args.tries} tries (all ocean/unmapped). Try again — ~71% of Earth is ocean, so ~3-4 tries average is normal.", file=sys.stderr)
            if not args.raw:
                print(f"\n## ❌ Random Place #{i} — not found after {args.tries} tries\nAll {args.tries} random coordinates landed in ocean/unmapped areas. This is statistically normal. Run again.\n")
            continue

        results.append(res)
        lat, lon, data, addr, hierarchy = res["lat"], res["lon"], res["data"], res["address"], res["hierarchy"]

        if args.raw:
            out = {
                "place_idx": i,
                "tries": res["attempt"],
                "lat": lat, "lon": lon,
                "compact_hierarchy": compact_chain(hierarchy),
                "hierarchy": [{"key": k, "label": lab, "value": v} for k, lab, v in hierarchy],
                "display_name": data.get("display_name"),
                "address": addr,
                "osm": {"osm_type": data.get("osm_type"), "osm_id": data.get("osm_id"), "place_rank": data.get("place_rank"), "category": data.get("category"), "type": data.get("type")},
                "method": res["method"],
                "deepen_info": res.get("deepen_info"),
                "map": {
                    "osm": f"https://www.openstreetmap.org/?mlat={lat:.6f}&mlon={lon:.6f}#map=14/{lat:.6f}/{lon:.6f}",
                    "google": f"https://www.google.com/maps?q={lat:.6f},{lon:.6f}",
                },
            }
            print(json.dumps(out, ensure_ascii=False, indent=2))
        else:
            card = format_card(i, res["attempt"], lat, lon, data, addr, hierarchy, args.lang, deepen_info=res.get("deepen_info"))
            print(card)
            if args.json:
                print("\n<details><summary>Raw JSON</summary>\n\n```json")
                dump = {
                    "lat": lat, "lon": lon,
                    "compact_hierarchy": compact_chain(hierarchy),
                    "hierarchy": [{"key": k, "label": lab, "value": v} for k, lab, v in hierarchy],
                    "display_name": data.get("display_name"),
                    "address": addr,
                    "osm_type": data.get("osm_type"),
                    "osm_id": data.get("osm_id"),
                    "method": res["method"],
                    "deepen_info": res.get("deepen_info"),
                }
                print(json.dumps(dump, ensure_ascii=False, indent=2))
                print("```\n</details>")
            # separator for multiple
            if i < count:
                print("\n---\n")

        # Nominatim policy: 1 req/sec. Sleep between places (and tries already sleep, but need gap between successes too)
        if i < count:
            time.sleep(1.1)

    if args.raw:
        return
    # summary
    if len(results) == 0 and count > 0:
        print(f"> _No land found. Tip: retry — randomness means sometimes several oceans in a row. Increase --tries if needed._")
    elif len(results) < count:
        print(f"\n> Found {len(results)}/{count} places. Re-run for more.")

if __name__ == "__main__":
    main()
