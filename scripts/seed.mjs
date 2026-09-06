// Sample-row seeder. Runs under Node (better-sqlite3 is Node-native),
// so invoke via `bun run db:seed` (spawns node) — never `bun scripts/seed.mjs`.
import { readFileSync } from "node:fs";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Sample only (Mporokoso District drill-down): verifies the district
// boundary map feature. Figures are approximate — see summary.
const geojson = readFileSync(
  "./scripts/geo/mporokoso-district.geojson",
  "utf8",
);

const row = db
  .prepare("SELECT id FROM ethnic_groups WHERE slug = ?")
  .get("mambwe");
if (!row) {
  db.prepare(
    `INSERT INTO ethnic_groups
      (slug, name, autonym, population, countries, region, districts,
       languages, language_family, summary, lat, lng, zoom, geojson)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    "mambwe",
    "Mambwe",
    "Mambwe",
    692939,
    JSON.stringify(["Zambia"]),
    "Africa",
    JSON.stringify([
      { name: "Mporokoso District", lat: -9.610159, lng: 29.766642 },
    ]),
    JSON.stringify(["Mambwe (Cimambwe)", "Bemba"]),
    "Niger-Congo",
    "Sample entry: the Mambwe of Northern Province, Zambia, mapped here at Mporokoso District. Mambwe children are schooled in Bemba, the regional lingua franca. Population figures vary widely by source (1993 and 2010 estimates differ); treat this headcount as approximate.",
    -9.610159,
    29.766642,
    null,
    geojson,
  );
  console.log("seeded mambwe");
} else {
  console.log("mambwe already present");
}
