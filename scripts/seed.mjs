// Sample-row seeder. Runs under Node (better-sqlite3 is Node-native),
// so invoke via `bun run db:seed` (spawns node) — never `bun scripts/seed.mjs`.
import { readFileSync } from "node:fs";
import Database from "better-sqlite3";

const DB_PATH = process.env.DATABASE_URL ?? "./data/local.db";
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const columns = `(slug, name, autonym, countries, continent,
  regions, cities, languages, language_family, language_subfamily, glottolog_urls, summary, lat, lng, zoom, geojson, updated_at)`;

// Staggered seed timestamps so `ORDER BY updated_at DESC` (the home grid
// order) is meaningful: without offsets every row lands in the same
// second and the grid degrades to name order. Oldest → newest follows
// the insert order below; re-running the seed preserves the ranking.
const seedNow = Math.floor(Date.now() / 1000);

// Bulgaria → Burgas Province: pin-less region entry (city dot pins the
// Black Sea town of Primorsko); geojson frames Obshtina Primorsko
// (OSM relation 1937061).
// (Kept in the seeder permanently so a from-scratch reseed reproduces it.
// The Ukrainian row is still DB-only — re-add it here once its values are
// recovered.)
const primorskoBoundary = readFileSync(
  new URL("./geo/bulgarian.geojson", import.meta.url),
  "utf8",
);
const bulgarians = [
  "bulgarian",
  "Bulgarian",
  "Bŭlgarin",
  JSON.stringify(["Bulgaria"]),
  "Europe",
  JSON.stringify([
    { name: "Obshtina Primorsko", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Primorsko", lat: 42.2698672, lng: 27.7506179 }]),
  JSON.stringify(["Bulgarian"]),
  "Indo-European",
  "Eastern South Slavic",
  JSON.stringify({
    Bulgarian: "https://glottolog.org/resource/languoid/id/bulg1262",
  }),
  "The Bulgarians are a South Slavic ethnic group native to Bulgaria, forming the majority in Burgas Province including the Black Sea town of Primorsko. They speak Bulgarian, an Eastern South Slavic language written in Cyrillic.",
  42.2698672,
  27.7506179,
  null,
  primorskoBoundary,
  seedNow - 4,
];

// Romania → Județul Iași: pin-less region entry (the mapped presence is
// Trifești village, OSM way 75400532, inside the județ); city dot pins
// Iași (47.1615598, 27.5837814, OSM relation 1207838), the județ capital.
// Geojson frames the whole of Județul Iași
// (OSM relation 2256747, simplified at seed time per ADR-0003).
const iasiBoundary = readFileSync(
  new URL("./geo/romanian.geojson", import.meta.url),
  "utf8",
);
const romanians = [
  "romanian",
  "Romanian",
  "Român",
  JSON.stringify(["Romania"]),
  "Europe",
  JSON.stringify([{ name: "Județul Iași", lat: null, lng: null }]),
  JSON.stringify([{ name: "Iași", lat: 47.1615598, lng: 27.5837814 }]),
  JSON.stringify(["Romanian"]),
  "Indo-European",
  "Eastern Romance",
  JSON.stringify({
    Romanian: "https://glottolog.org/resource/languoid/id/roma1327",
  }),
  "The Romanians are a Romance ethnic group native to Romania, forming the majority in Județul Iași including the commune of Trifești. They speak Romanian, an Eastern Romance language written in Latin script.",
  47.4584008,
  27.5055793,
  null,
  iasiBoundary,
  seedNow - 3,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(bulgarians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...bulgarians);
console.log("seeded bulgarian (Obshtina Primorsko)");

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(romanians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...romanians);
console.log("seeded romanian (Județul Iași)");

// Ukraine → Zaporizhzhia Oblast: pin-less region entry (city dot pins
// Sofiivka village, OSM way 229265934); geojson frames Kolarivska hromada
// (OSM relation 12313142).
// The hromada is named for its center's former name: Sofiivka was Kolarivka
// (1933–2016), then Bolharka (2016–2021).
const kolarivkaBoundary = readFileSync(
  new URL("./geo/ukrainian.geojson", import.meta.url),
  "utf8",
);
const ukrainians = [
  "ukrainian",
  "Ukrainian",
  "Ukraїnets",
  JSON.stringify(["Ukraine"]),
  "Europe",
  JSON.stringify([
    { name: "Kolarivska hromada", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Sofiivka", lat: 46.904072, lng: 36.33041 }]),
  JSON.stringify(["Ukrainian"]),
  "Indo-European",
  "East Slavic",
  JSON.stringify({
    Ukrainian: "https://glottolog.org/resource/languoid/id/ukra1253",
  }),
  "The Ukrainians are an East Slavic ethnic group native to Ukraine, forming the majority in Zaporizhzhia Oblast including Kolarivska hromada. They speak Ukrainian, an East Slavic language written in Cyrillic.",
  46.904072,
  36.33041,
  null,
  kolarivkaBoundary,
  seedNow - 2,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(ukrainians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...ukrainians);
console.log("seeded ukrainian (Kolarivska hromada)");

// Russia → Karelia: pin-less region entry (city dot pins the hamlet of
// Kriitinä — Karelian name; Russian Gridino; OSM way 124269401);
// geojson frames Kemin piiri
// (Karelian; Russian Kemsk; OSM relation 1020359, coarse
// admin geometry at 2.2KB — no simplification needed under the ADR-0003
// ~100KB cap).
const kemskyBoundary = readFileSync(
  new URL("./geo/karelian.geojson", import.meta.url),
  "utf8",
);
const karelians = [
  "karelian",
  "Karelian",
  "Karjalaini",
  JSON.stringify(["Russia"]),
  "Europe",
  JSON.stringify([
    { name: "Kemin piiri (Kemsk)", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Kriitinä (Gridino)", lat: 65.9201947, lng: 34.6703557 }]),
  JSON.stringify(["Karelian"]),
  "Uralic",
  "Finnic",
  JSON.stringify({
    Karelian: "https://glottolog.org/resource/languoid/id/kare1335",
  }),
  "The Karelians are a Finnic ethnic group native to Karelia, with communities along the White Sea coast in Kemin piiri (Kemsk) including the hamlet of Kriitinä (Russian Gridino). They speak Karelian, a Finnic language written in Latin script.",
  65.9201947,
  34.6703557,
  null,
  kemskyBoundary,
  seedNow - 1,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(karelians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...karelians);
console.log("seeded karelian (Kemin piiri)");

// France → Normandy: pin-less region entry for the arrondîment of Rouen
// (Norman spelling; French arrondissement)
// (OSM relation 3018659; the random-place hit 49.610412, 1.223136 was the
// hamlet of Touffreville in Esteville commune, OSM way 417588504);
// city dot pins Rouen (49.44278, 1.08861), historic capital of the Duchy
// of Normandy. Geojson frames the arrondîment
// (raw ~141KB → Douglas-Peucker eps 0.0006 ≈ 24KB, under the ADR-0003
// ~100KB cap).
const rouenBoundary = readFileSync(
  new URL("./geo/norman.geojson", import.meta.url),
  "utf8",
);
const normans = [
  "norman",
  "Norman",
  "Normaund",
  JSON.stringify(["France"]),
  "Europe",
  JSON.stringify([
    { name: "Rouen arrondîment", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Rouen", lat: 49.44278, lng: 1.08861 }]),
  JSON.stringify(["Norman", "French"]),
  "Indo-European",
  "Gallo-Romance",
  JSON.stringify({
    Norman: "https://glottolog.org/resource/languoid/id/norm1245",
    French: "https://glottolog.org/resource/languoid/id/stan1290",
  }),
  "The Normans are a Romance ethnic group native to Normandy in northern France, descending from Norse Viking settlers and local Gallo-Romance Franks, centered on Rouen as the historic capital of the Duchy of Normandy. They speak Norman, an Oïl Romance language, alongside French.",
  49.610412,
  1.223136,
  null,
  rouenBoundary,
  seedNow,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(normans[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...normans);
console.log("seeded norman (Rouen arrondîment)");

// Eswatini → Lubombo: pin-less region entry for Inkhundla Lugongolweni
// (OSM relation 1253005; the random-place hit -26.452038, 32.072588 was a
// shallow place_rank 12 hit, nearest named place Lugongolweni as context
// only); city dot pins Siteki (-26.4536442, 31.9463149, OSM node
// 2330307546), the Lubombo district capital inside the same inkhundla.
// Geojson frames the inkhundla (~11KB raw, under the ADR-0003 ~100KB cap,
// no simplification needed).
const lugongolweniBoundary = readFileSync(
  new URL("./geo/swazi.geojson", import.meta.url),
  "utf8",
);
const swazis = [
  "swazi",
  "Swazi",
  "Liswati",
  JSON.stringify(["Eswatini"]),
  "Africa",
  JSON.stringify([
    { name: "Inkhundla Lugongolweni", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Siteki", lat: -26.4536442, lng: 31.9463149 }]),
  JSON.stringify(["Swati"]),
  "Atlantic-Congo",
  "Nguni",
  JSON.stringify({
    Swati: "https://glottolog.org/resource/languoid/id/swat1243",
  }),
  "The Swazi are a Nguni Bantu ethnic group native to Eswatini, forming the majority in Lubombo region including Inkhundla Lugongolweni. They speak Swati (siSwati), a Nguni Bantu language written in Latin script.",
  -26.452038,
  32.072588,
  null,
  lugongolweniBoundary,
  seedNow + 1,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(swazis[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...swazis);
console.log("seeded swazi (Inkhundla Lugongolweni)");

// Greenland → Sermersooq (OSM relation 8515166): the region entry is
// pin-less (null coords) — the random-place hit 63.069863, -45.517441 sits
// on uninhabited inland ice, so no pin is rendered for it; the shaded
// boundary + city dots carry the map instead. City dots pin Nuuk
// (64.1767049, -51.7361444, OSM node 992046822), the municipal + national
// capital, and Tasiilaq (65.6140754, -37.6392199, OSM way 880311526),
// the east-coast hub. Geojson frames the municipality
// (Nominatim polygon_geojson at threshold 0.001, 424-pt outline spanning
// both coasts, ~11KB — no simplification needed under the ADR-0003
// ~100KB cap). Languages are the group's Inuit varieties: Kalaallisut
// (primary, sole official), Tunumiisiut (east coast, incl. Tasiilaq in
// Sermersooq), Inuktun (northern Inughuit variety of the wider group).
const sermersooqBoundary = readFileSync(
  new URL("./geo/greenlandic-inuit.geojson", import.meta.url),
  "utf8",
);
const greenlandicInuit = [
  "greenlandic-inuit",
  "Greenlandic Inuit",
  "Kalaaleq",
  JSON.stringify(["Greenland"]),
  "North America",
  JSON.stringify([
    { name: "Sermersooq municipality", lat: null, lng: null },
  ]),
  JSON.stringify([{ name: "Nuuk", lat: 64.1767049, lng: -51.7361444 }, { name: "Tasiilaq", lat: 65.6140754, lng: -37.6392199 }]),
  JSON.stringify(["Kalaallisut", "Tunumiisiut", "Inuktun"]),
  "Eskimo-Aleut",
  "Inuit",
  JSON.stringify({
    Kalaallisut: "https://glottolog.org/resource/languoid/id/kala1399",
    Tunumiisiut: "https://glottolog.org/resource/languoid/id/tunu1234",
    Inuktun: "https://glottolog.org/resource/languoid/id/pola1254",
  }),
  "The Greenlandic Inuit (Kalaallit) are the Indigenous Inuit people of Greenland, forming the majority in Sermersooq municipality on both the west coast including Nuuk and the east coast around Tasiilaq. They speak Kalaallisut (West Greenlandic, the sole official language), Tunumiisiut in the east and Inuktun in the north.",
  63.069863,
  -45.517441,
  null,
  sermersooqBoundary,
  seedNow + 2,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(
  greenlandicInuit[0],
);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...greenlandicInuit);
console.log("seeded greenlandic-inuit (Sermersooq municipality)");

// Estonia → Hiiu County (OSM relation 350340): pin-less region entry for
// Hiiumaa vald, the island municipality (OSM relation 7821150; the
// random-place hit 58.716995, 22.088516 was a shallow place_rank 12 hit,
// nearest named place Hiiumaa as context only); city dot pins Kärdla
// (58.9988376, 22.7478094, town, OSM relation 2133232), the island
// capital inside the same vald. Geojson frames the municipality
// (Nominatim polygon_geojson at threshold 0.001, 1988-pt outline over
// the main island + islets, ~52KB — no simplification needed under the
// ADR-0003 ~100KB cap).
const hiiumaaBoundary = readFileSync(
  new URL("./geo/estonian.geojson", import.meta.url),
  "utf8",
);
const estonians = [
  "estonian",
  "Estonian",
  "Eestlane",
  JSON.stringify(["Estonia"]),
  "Europe",
  JSON.stringify([{ name: "Hiiumaa vald", lat: null, lng: null }]),
  JSON.stringify([{ name: "Kärdla", lat: 58.9988376, lng: 22.7478094 }]),
  JSON.stringify(["Estonian"]),
  "Uralic",
  "Finnic",
  JSON.stringify({
    Estonian: "https://glottolog.org/resource/languoid/id/esto1258",
  }),
  "The Estonians are a Finnic ethnic group native to Estonia, forming the majority on the Baltic island of Hiiumaa including Hiiumaa vald. They speak Estonian, a Finnic language written in Latin script.",
  58.716995,
  22.088516,
  null,
  hiiumaaBoundary,
  seedNow + 3,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(estonians[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...estonians);
console.log("seeded estonian (Hiiumaa vald)");

// Ethiopia → Somali Region → Gobolka Faafan / Fafan Zone (OSM relation 3293963):
// pin-less region entry for the zone (the random-place hit 8.871566,
// 43.132166 at Jerer Bota was a shallow hit with no locality key,
// nearest named place Qabribayax (Kebri Beyah) as context only); city dot pins
// Qabribayax (9.1000628, 43.1786727, town, OSM node 9238775007).
// Geojson frames the zone (Nominatim polygon_geojson at threshold
// 0.001, 210-pt Polygon, ~5KB — no simplification needed under the
// ADR-0003 ~100KB cap).
const fafanBoundary = readFileSync(
  new URL("./geo/somali.geojson", import.meta.url),
  "utf8",
);
const somalis = [
  "somali",
  "Somali",
  "Soomaali",
  JSON.stringify(["Ethiopia"]),
  "Africa",
  JSON.stringify([{ name: "Gobolka Faafan", lat: null, lng: null }]),
  JSON.stringify([{ name: "Qabribayax (Kebri Beyah)", lat: 9.1000628, lng: 43.1786727 }]),
  JSON.stringify(["Somali"]),
  "Afro-Asiatic",
  "Cushitic",
  JSON.stringify({
    Somali: "https://glottolog.org/resource/languoid/id/soma1255",
  }),
  "The Somalis are a Cushitic ethnic group native to the Horn of Africa, forming the majority in Ethiopia's Somali Region including Gobolka Faafan. They speak Somali (Af Soomaali), an Afro-Asiatic Cushitic language written in Latin script.",
  8.871566,
  43.132166,
  null,
  fafanBoundary,
  seedNow + 4,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(somalis[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...somalis);
console.log("seeded somali (Gobolka Faafan)");

// Mongolia → Bayan-Ölgii → Tolbo sum (OSM relation 7305004):
// pin-less region entry for the sum (the random-place hit 48.399948,
// 90.447101 sits in the sum by Tolbo Lake); city dot pins Tolbo
// (48.4127085, 90.2870237, district centroid, OSM relation 7305004).
// The Kazakhs form ~93% of Bayan-Ölgii everywhere except Tuvan-majority
// Tsengel sum (overlapping extent displays allowed per ADR-0003).
// Geojson frames the sum (Nominatim polygon_geojson at threshold 0.001,
// ~1KB — no simplification needed under the ADR-0003 ~100KB cap).
const tolboBoundary = readFileSync(
  new URL("./geo/kazakh.geojson", import.meta.url),
  "utf8",
);
const kazakhs = [
  "kazakh",
  "Kazakh",
  "Qazaq",
  JSON.stringify(["Mongolia"]),
  "Asia",
  JSON.stringify([{ name: "Tolbo sum", lat: null, lng: null }]),
  JSON.stringify([{ name: "Tolbo", lat: 48.4127085, lng: 90.2870237 }]),
  JSON.stringify(["Kazakh"]),
  "Turkic",
  "Kipchak",
  JSON.stringify({
    Kazakh: "https://glottolog.org/resource/languoid/id/kaza1248",
  }),
  "The Kazakhs are a Turkic Sunni Muslim ethnic group forming about 93% of Mongolia's western Bayan-Ölgii Province, including Tolbo sum on Tolbo Lake; only Tsengel sum is Tuvan-majority. They speak Kazakh, a Kipchak Turkic language.",
  48.399948,
  90.447101,
  null,
  tolboBoundary,
  seedNow + 6,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(kazakhs[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...kazakhs);
console.log("seeded kazakh (Tolbo sum)");

// Mongolia → Bayan-Ölgii → Tsengel sum (OSM relation 7305002),
// Tuvan Ak-Sayan (Ак-Саян, 'white Sayan'):
// pin-less region entry for the sum — the only non-Kazakh-majority
// district of the province, inhabited mainly by Tsengel Tuvans;
// city dot pins Khushoot (48.94083, 89.13833), the sum
// capital in the west of the district. Geojson frames the sum
// (Nominatim polygon_geojson at threshold 0.001, ~18KB — no
// simplification needed under the ADR-0003 ~100KB cap).
const tsengelBoundary = readFileSync(
  new URL("./geo/tuvan.geojson", import.meta.url),
  "utf8",
);
const tuvans = [
  "tuvan",
  "Tuvan",
  "Tyva",
  JSON.stringify(["Mongolia"]),
  "Asia",
  JSON.stringify([{ name: "Ak-Sayan sum (Tsengel)", lat: null, lng: null }]),
  JSON.stringify([{ name: "Khushoot", lat: 48.94083, lng: 89.13833 }]),
  JSON.stringify(["Tuvan"]),
  "Turkic",
  "Sayan Turkic",
  JSON.stringify({
    Tuvan: "https://glottolog.org/resource/languoid/id/tuvi1240",
  }),
  "The Tuvans (Tsengel Tuvans, Ak-Sayan) are a Turkic ethnic group forming the majority in Ak-Sayan sum (Tsengel) — the only non-Kazakh-majority district of Bayan-Ölgii Province in western Mongolia — centered on Khushoot. They speak Tuvan, a Sayan Turkic language.",
  48.94083,
  89.13833,
  null,
  tsengelBoundary,
  seedNow + 7,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(tuvans[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...tuvans);
console.log("seeded tuvan (Tsengel sum)");

// Sweden → Kalmar County → Mörbylånga kommun, Öland (OSM relation 935518):
// pin-less region entry for the kommun (the random-place hit 56.266857,
// 16.862520 sits in the kommun on southern Öland, 3 tries, secrets
// Europe-bbox); city dot pins Mörbylånga (56.5249607, 16.3802337, town,
// OSM node 33224860), the kommun seat. Geojson frames the kommun
// (Nominatim polygon_geojson at threshold 0.001, ~12KB — no
// simplification needed under the ADR-0003 ~100KB cap).
const morbylangaBoundary = readFileSync(
  new URL("./geo/swede.geojson", import.meta.url),
  "utf8",
);
const swedes = [
  "swede",
  "Swede",
  "Svensk",
  JSON.stringify(["Sweden"]),
  "Europe",
  JSON.stringify([{ name: "Mörbylånga kommun", lat: null, lng: null }]),
  JSON.stringify([{ name: "Mörbylånga", lat: 56.5249607, lng: 16.3802337 }]),
  JSON.stringify(["Swedish"]),
  "Indo-European",
  "North Germanic",
  JSON.stringify({
    Swedish: "https://glottolog.org/resource/languoid/id/swed1254",
  }),
  "The Swedes are a North Germanic ethnic group native to Sweden, forming the majority on the Baltic island of Öland including Mörbylånga kommun. They speak Swedish, a North Germanic language written in Latin script.",
  56.266857,
  16.86252,
  null,
  morbylangaBoundary,
  seedNow + 8,
];

db.prepare("DELETE FROM ethnic_groups WHERE slug = ?").run(swedes[0]);
db.prepare(
  `INSERT INTO ethnic_groups ${columns} VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
).run(...swedes);
console.log("seeded swede (Mörbylånga kommun)");
