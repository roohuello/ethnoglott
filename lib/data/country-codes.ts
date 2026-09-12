import type { ComponentProps } from "react";
import type Flag from "react-flagpack";

type CountryIsoCode = ComponentProps<typeof Flag>["code"];

const COUNTRY_CODES: Record<string, CountryIsoCode> = {
  Austria: "AT",
  Belgium: "BE",
  Bulgaria: "BG",
  China: "CN",
  Denmark: "DK",
  Estonia: "EE",
  Eswatini: "SZ",
  Ethiopia: "ET",
  France: "FR",
  Greenland: "GL",
  Hungary: "HU",
  Italy: "IT",
  Kazakhstan: "KZ",
  Mauritius: "MU",
  Mongolia: "MN",
  Norway: "NO",
  Portugal: "PT",
  Romania: "RO",
  Russia: "RU",
  Singapore: "SG",
  Slovenia: "SI",
  Somalia: "SO",
  "South Africa": "ZA",
  Sweden: "SE",
  Taiwan: "TW",
  Tanzania: "TZ",
  Ukraine: "UA",
  Vietnam: "VN",
  Zambia: "ZM",
};

export function countryCode(name: string): CountryIsoCode | null {
  return COUNTRY_CODES[name] ?? null;
}
