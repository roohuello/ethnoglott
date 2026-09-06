// Sample-row seeder. Runs under Node (better-sqlite3 is Node-native),
// so invoke via `bun run db:seed` (spawns node) — never `bun scripts/seed.mjs`.
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const row = db
  .prepare("SELECT id FROM ethnic_groups WHERE slug = ?")
  .get("han-chinese");
if (!row) {
  db.prepare(
    `INSERT INTO ethnic_groups
      (slug, name, autonym, population, countries, region, languages,
       language_family, summary, lat, lng, zoom)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    "han-chinese",
    "Han Chinese",
    "Hànzú",
    1400000000,
    JSON.stringify(["China", "Taiwan", "Singapore"]),
    "Asia",
    JSON.stringify(["Mandarin", "Cantonese"]),
    "Sino-Tibetan",
    "The Han Chinese are the world's largest ethnic group, concentrated in China with significant communities across East and Southeast Asia.",
    35.0,
    105.0,
    3,
  );
  console.log("seeded han-chinese");
} else {
  console.log("han-chinese already present");
}
