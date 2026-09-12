import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/db/database.types";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
if (!SUPABASE_PUBLISHABLE_KEY)
  throw new Error("SUPABASE_PUBLISHABLE_KEY is not set");

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
);
