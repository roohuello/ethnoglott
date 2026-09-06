import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Canonical term: EthnicGroup (see CONTEXT.md). Single table, JSON text
// columns per ADR-0001. Point centroid per ADR-0002; `geojson` reserved.
export const ethnicGroups = sqliteTable("ethnic_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  autonym: text("autonym"),
  population: integer("population"),
  countries: text("countries", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .$defaultFn(() => []),
  region: text("region").notNull().default(""),
  districts: text("districts", { mode: "json" })
    .notNull()
    .$type<{ name: string; lat: number | null; lng: number | null }[]>()
    .$defaultFn(() => []),
  languages: text("languages", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .$defaultFn(() => []),
  languageFamily: text("language_family"),
  summary: text("summary").notNull().default(""),
  lat: real("lat"),
  lng: real("lng"),
  zoom: integer("zoom"),
  geojson: text("geojson"),
  imageUrl: text("image_url"),
});

export type EthnicGroup = typeof ethnicGroups.$inferSelect;
export type NewEthnicGroup = typeof ethnicGroups.$inferInsert;
