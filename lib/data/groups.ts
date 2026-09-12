import "server-only";
import type { EthnicGroup } from "@/lib/db/database.types";
import { supabase } from "@/lib/db/supabase";

export interface GroupFilters {
  q?: string;
}

export interface GroupChip {
  slug: string;
  name: string;
  endonym: string | null;
}

const MAX_ROWS = 500;

export async function listGroups(
  filters: GroupFilters = {},
): Promise<GroupChip[]> {
  const { data, error } = await supabase.rpc("search_group_chips", {
    q: filters.q?.trim() ?? "",
    max_rows: MAX_ROWS,
  });
  if (error) throw new Error(`listGroups failed: ${error.message}`);
  return data ?? [];
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
  return data;
}
