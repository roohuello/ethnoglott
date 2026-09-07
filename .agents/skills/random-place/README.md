# random-place

True random world explorer — picks a cryptographically random spot on Earth and shows its full administrative hierarchy.

## What it does

Generates **true random coordinates** via OS CSPRNG (`secrets.SystemRandom`, sphere-uniform math — no pole bias) and reverse-geocodes with OpenStreetMap Nominatim (fallback: BigDataCloud) to reveal the complete chain:

```
Country → Province/State → District/County → City/Town → Locality
```

- Retries automatically when a random point lands in the ocean (~71% of Earth)
- Deepens to the lowest division within budget: shallow hits (province/state only) get max 1 extra nearest-settlement lookup as context; the leaf honestly falls back to the next upper division (nearest ≠ containing, so it never rewrites the hierarchy)
- Shows compact chain + detailed hierarchy card + map links + raw JSON on request
- Handles any country — Japan prefectures, Thai changwat/amphoe/tambon, German Bundesländer, French départements, US counties, Indonesia regencies, etc.
- Uses English-friendly local terms (true parallel): Indonesia `county→Regency`, `state→Province`; Japan `state→Prefecture`; OSM key always shown alongside (e.g. `**Regency** (`county`): Mimika`)
- Annotates skipped OSM levels (e.g. village present but district missing → `⚠ Gap` note, never backfilled)
- Respects Nominatim policy: identifiable `User-Agent`, ≤1 req/sec, 1.1s spacing

Example:

> 🌍 Papua New Guinea → Southern Region → Western → Middle Fly District
> 📍 `-7.747065, 143.094270` — [OSM](https://www.openstreetmap.org/?mlat=-7.747065&mlon=143.094270#map=14/-7.747065/143.094270)

## How to invoke

```
/random-place              # one random place (en)
/random-place 3            # three random places
/random-place --lang ja    # hierarchy in Japanese
/random-place --json       # plus raw address JSON
/random-place --quick      # simple uniform RNG (faster)
/random-place --no-deepen  # skip lowest-division deepen
```

Also triggers on: "random place", "random location", "surprise me", "pick a random city", "geo roulette", "take me somewhere random"

## Programmatic use

```bash
python3 .agents/skills/random-place/scripts/random_place.py --count 1
python3 .agents/skills/random-place/scripts/random_place.py --count 5 --lang th --json
python3 .agents/skills/random-place/scripts/random_place.py --raw  # JSON only for piping
```

## Output

- **Compact hierarchy:** `Country → Province → District → Place` with flag emoji
- **Detailed card:** coordinates + OSM/Google links + level-by-level hierarchy + raw `display_name` + OSM metadata + randomness provenance + depth line (deepened vs upper-division fallback)
- **Retries & source:** tries taken, CSPRNG method noted

## Files

- [`SKILL.md`](./SKILL.md) — agent instructions (hierarchy rules, workflow, anti-patterns)
- [`scripts/random_place.py`](./scripts/random_place.py) — runnable implementation, stdlib only
- `README.md` — this file

## Requirements

- Python 3.8+ (stdlib only, no pip)
- Internet for Nominatim / BigDataCloud

## See also

- Nominatim policy: https://operations.osmfoundation.org/policies/nominatim/
- OSM Reverse API: https://nominatim.org/release-docs/develop/api/Reverse/
