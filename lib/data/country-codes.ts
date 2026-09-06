import type { ComponentProps } from "react";
import type Flag from "react-flagpack";

export type CountryIsoCode = ComponentProps<typeof Flag>["code"];

// English display name → ISO 3166-1 alpha-2 code for react-flagpack.
// Extend this map as new countries are seeded; unmapped names render
// text-only (no flag) rather than breaking.
const COUNTRY_CODES: Record<string, CountryIsoCode> = {
  China: "CN",
  Singapore: "SG",
  Taiwan: "TW",
  Zambia: "ZM",
};

export function countryCode(name: string): CountryIsoCode | null {
  return COUNTRY_CODES[name] ?? null;
}
