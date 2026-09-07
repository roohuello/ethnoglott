import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Canonical term: EthnicGroup (see CONTEXT.md). Single table, JSON text
// columns per ADR-0001. Point centroid per ADR-0002; `geojson` reserved.
export const ethnicGroups = sqliteTable("ethnic_groups", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  autonym: text("autonym"),
  countries: text("countries", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .$defaultFn(() => []),
  continent: text("continent").notNull().default(""),
  regions: text("regions", { mode: "json" })
    .notNull()
    .$type<{ name: string; lat: number | null; lng: number | null }[]>()
    .$defaultFn(() => []),
  cities: text("cities", { mode: "json" })
    .notNull()
    .$type<{ name: string; lat: number | null; lng: number | null }[]>()
    .$defaultFn(() => []),
  languages: text("languages", { mode: "json" })
    .notNull()
    .$type<string[]>()
    .$defaultFn(() => []),
  languageFamily: text("language_family"),
  languageSubfamily: text("language_subfamily"),
  summary: text("summary").notNull().default(""),
  lat: real("lat"),
  lng: real("lng"),
  zoom: integer("zoom"),
  geojson: text("geojson"),
  imageUrl: text("image_url"),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`(unixepoch())`)
    .$defaultFn(() => Math.floor(Date.now() / 1000))
    .$onUpdateFn(() => Math.floor(Date.now() / 1000)),
});

export type EthnicGroup = typeof ethnicGroups.$inferSelect;
export type NewEthnicGroup = typeof ethnicGroups.$inferInsert;
