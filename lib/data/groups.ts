import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import type { EthnicGroup } from "@/lib/db/schema";

export interface GroupFilters {
  q?: string;
}

const MAX_ROWS = 500;

export async function listGroups(
  filters: GroupFilters = {},
): Promise<EthnicGroup[]> {
  const rows = await db
    .select()
    .from(schema.ethnicGroups)
    .orderBy(asc(schema.ethnicGroups.name))
    .limit(MAX_ROWS);

  const q = filters.q?.trim().toLowerCase();
  return rows.filter((g) => {
    if (!q) return true;
    const haystack = [
      g.name,
      g.autonym ?? "",
      g.region,
      g.languageFamily ?? "",
      ...g.countries,
      ...g.languages,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export async function getGroupBySlug(
  slug: string,
): Promise<EthnicGroup | null> {
  const rows = await db
    .select()
    .from(schema.ethnicGroups)
    .where(eq(schema.ethnicGroups.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}
