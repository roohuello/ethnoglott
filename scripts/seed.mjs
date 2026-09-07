// Sample-row seeder. Runs under Node (better-sqlite3 is Node-native),
// so invoke via `bun run db:seed` (spawns node) — never `bun scripts/seed.mjs`.
import { readFileSync } from "node:fs";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const columns = `(slug, name, autonym, countries, continent,
  regions, cities, languages, language_family, language_subfamily, summary, lat, lng, zoom, geojson)`;

// Romania → Iași County: marker pins Trifești village (OSM way 75400532),
// the mapped presence inside the county; geojson frames the whole of Iași
// County (OSM relation 2256747, simplified at seed time per ADR-0003).
// (Bulgarian + Ukrainian rows were removed once seeded — they live in the
// DB now; re-add them here if you ever need a from-scratch reseed.)
const iasiBoundary = readFileSync(
  new URL("./geo/iasi-county.geojson", import.meta.url),
  "utf8",
);
const romanians = [
  "romanian",
  "Romanian",
  "Români",
  JSON.stringify(["Romania"]),
  "Europe",
  JSON.stringify([{ name: "Iași County", lat: 47.4584008, lng: 27.5055793 }]),
  JSON.stringify([{ name: "Trifești", lat: 47.4584008, lng: 27.5055793 }]),
  JSON.stringify(["Romanian"]),
  "Indo-European",
  "Romance",
  "The Romanians are a Romance ethnic group native to Romania, forming the majority in Iași County including the commune of Trifești. They speak Romanian, an Eastern Romance language written in Latin script. This entry maps their presence at Trifești.",
  47.4584008,
  27.5055793,
  null,
  iasiBoundary,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(romanians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...romanians);
console.log("seeded romanian (Iași County)");
