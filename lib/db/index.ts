import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";

mkdirSync(dirname(DB_PATH), { recursive: true });

const globalForDb = globalThis as unknown as {
  __sqlite?: Database.Database;
};

const sqlite =
  globalForDb.__sqlite ??
  (() => {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    return db;
  })();

if (process.env.NODE_ENV !== "production") globalForDb.__sqlite = sqlite;

export const db = drizzle(sqlite, { schema });
export { schema };
