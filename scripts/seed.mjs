// Sample-row seeder. Runs under Node (better-sqlite3 is Node-native),
// so invoke via `bun run db:seed` (spawns node) — never `bun scripts/seed.mjs`.
import { readFileSync } from "node:fs";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const columns = `(slug, name, autonym, countries, continent,
  regions, cities, languages, language_family, language_subfamily, summary, lat, lng, zoom, geojson, updated_at)`;

// Bulgaria → Burgas Province: marker pins the Black Sea town of Primorsko
// (OSM relation 1937061); geojson frames Primorsko municipality.
// (Kept in the seeder permanently so a from-scratch reseed reproduces it.
// The Ukrainian row is still DB-only — re-add it here once its values are
// recovered.)
const primorskoBoundary = readFileSync(
  new URL("./geo/primorsko-municipality.geojson", import.meta.url),
  "utf8",
);
const bulgarians = [
  "bulgarian",
  "Bulgarian",
  "Bŭlgari",
  JSON.stringify(["Bulgaria"]),
  "Europe",
  JSON.stringify([
    { name: "Primorsko municipality", lat: 42.2698672, lng: 27.7506179 },
  ]),
  JSON.stringify([{ name: "Primorsko", lat: 42.2698672, lng: 27.7506179 }]),
  JSON.stringify(["Bulgarian"]),
  "Indo-European",
  "Balto-Slavic",
  "The Bulgarians are a South Slavic ethnic group native to Bulgaria, forming the majority in Burgas Province including the Black Sea town of Primorsko. They speak Bulgarian, an Eastern South Slavic language written in Cyrillic. This entry maps their presence at Primorsko.",
  42.2698672,
  27.7506179,
  null,
  primorskoBoundary,
  Math.floor(Date.now() / 1000),
];

// Romania → Iași County: marker pins Trifești village (OSM way 75400532),
// the mapped presence inside the county; geojson frames the whole of Iași
// County (OSM relation 2256747, simplified at seed time per ADR-0003).
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
  Math.floor(Date.now() / 1000),
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(bulgarians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...bulgarians);
console.log("seeded bulgarian (Primorsko municipality)");

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(romanians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...romanians);
console.log("seeded romanian (Iași County)");
