import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/db/database.types";
import type { EthnicGroup } from "@/lib/db/schema";

export interface GroupFilters {
  q?: string;
}

// Chip list needs names only; full rows (incl. geojson) stay on the detail query.
export interface GroupChip {
  slug: string;
  name: string;
  autonym: string | null;
}

const MAX_ROWS = 500;

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
if (!SUPABASE_URL) throw new Error("SUPABASE_URL is not set");
if (!SUPABASE_PUBLISHABLE_KEY)
  throw new Error("SUPABASE_PUBLISHABLE_KEY is not set");

// Reads via PostgREST (anon RLS SELECT); the Supavisor pooler path is stalled.
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export async function listGroups(
  filters: GroupFilters = {},
): Promise<GroupChip[]> {
  // Fully server-side (scalars + jsonb via ::text); limit applies post-filter.
  const { data, error } = await supabase.rpc("search_group_chips", {
    q: filters.q?.trim() ?? "",
    max_rows: MAX_ROWS,
  });
  if (error) throw new Error(`listGroups failed: ${error.message}`);
  return data ?? [];
}

function stringArray(value: Json): string[] {
  return Array.isArray(value)
    ? value.filter((e): e is string => typeof e === "string")
    : [];
}

function regionPoints(
  value: Json,
): { name: string; lat: number | null; lng: number | null }[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (e): e is { name: string; lat: number | null; lng: number | null } =>
      typeof e === "object" &&
      e !== null &&
      typeof (e as { name: unknown }).name === "string",
  );
}

function stringMap(value: Json): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export async function getGroupBySlug(
  slug: string,
): Promise<EthnicGroup | null> {
  const { data, error } = await supabase
    .from("ethnic_groups")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getGroupBySlug failed: ${error.message}`);
  if (!data) return null;
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    autonym: data.autonym,
    countries: stringArray(data.countries),
    continent: data.continent,
    regions: regionPoints(data.regions),
    cities: regionPoints(data.cities),
    languages: stringArray(data.languages),
    languageFamily: data.language_family,
    languageSubfamily: data.language_subfamily,
    glottologUrls: stringMap(data.glottolog_urls),
    summary: data.summary,
    lat: data.lat,
    lng: data.lng,
    geojson: data.geojson,
    imageUrl: data.image_url,
    updatedAt: data.updated_at,
  };
}
