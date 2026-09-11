import type { ComponentProps } from "react";
import type Flag from "react-flagpack";

type CountryIsoCode = ComponentProps<typeof Flag>["code"];

// Display name → ISO alpha-2 for react-flagpack; unmapped names render text-only.
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
