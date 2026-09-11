import type { ComponentProps } from "react";
import type Flag from "react-flagpack";

export type CountryIsoCode = ComponentProps<typeof Flag>["code"];

// English display name → ISO 3166-1 alpha-2 code for react-flagpack.
// Extend this map as new countries are seeded; unmapped names render
// text-only (no flag) rather than breaking.
const COUNTRY_CODES: Record<string, CountryIsoCode> = {
  Bulgaria: "BG",
  China: "CN",
  Estonia: "EE",
  Eswatini: "SZ",
  Ethiopia: "ET",
  France: "FR",
  Greenland: "GL",
  Mongolia: "MN",
  Romania: "RO",
  Russia: "RU",
  Singapore: "SG",
  "South Africa": "ZA",
  Sweden: "SE",
  Taiwan: "TW",
  Tanzania: "TZ",
  Ukraine: "UA",
  Zambia: "ZM",
};

export function countryCode(name: string): CountryIsoCode | null {
  return COUNTRY_CODES[name] ?? null;
}
