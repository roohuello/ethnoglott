import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// DDL/studio only; runtime reads go through PostgREST (lib/data/groups.ts)
// because the Supavisor pooler path is stalled.
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is not set");

const globalForDb = globalThis as unknown as {
  __pg?: ReturnType<typeof postgres>;
};

// Pooler (Supavisor transaction mode) lacks prepared statements; disable them.
const client =
  globalForDb.__pg ??
  postgres(DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });

if (process.env.NODE_ENV !== "production") globalForDb.__pg = client;

export const db = drizzle(client, { schema });
export { schema };
