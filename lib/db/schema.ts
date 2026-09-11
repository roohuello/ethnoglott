import { sql } from "drizzle-orm";
import {
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
} from "drizzle-orm/pg-core";

// EthnicGroup: single table, JSONB cols (ADR-0001), centroid (ADR-0002), epoch-int updatedAt.
export const ethnicGroups = pgTable("ethnic_groups", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  autonym: text("autonym"),
  countries: jsonb("countries").$type<string[]>().notNull().default([]),
  continent: text("continent").notNull().default(""),
  regions: jsonb("regions")
    .$type<{ name: string; lat: number | null; lng: number | null }[]>()
    .notNull()
    .default([]),
  cities: jsonb("cities")
    .$type<{ name: string; lat: number | null; lng: number | null }[]>()
    .notNull()
    .default([]),
  languages: jsonb("languages").$type<string[]>().notNull().default([]),
  languageFamily: text("language_family"),
  languageSubfamily: text("language_subfamily"),
  glottologUrls: jsonb("glottolog_urls")
    .$type<Record<string, string>>()
    .notNull()
    .default({}),
  summary: text("summary").notNull().default(""),
  lat: doublePrecision("lat"),
  lng: doublePrecision("lng"),
  geojson: text("geojson"),
  imageUrl: text("image_url"),
  updatedAt: integer("updated_at")
    .notNull()
    .default(sql`extract(epoch from now())::integer`)
    .$defaultFn(() => Math.floor(Date.now() / 1000))
    .$onUpdateFn(() => Math.floor(Date.now() / 1000)),
});

export type EthnicGroup = typeof ethnicGroups.$inferSelect;
