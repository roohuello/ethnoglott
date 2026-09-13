import type { ComponentProps } from "react";
import type Flag from "react-flagpack";

type CountryIsoCode = ComponentProps<typeof Flag>["code"];

const COUNTRY_CODES: Record<string, CountryIsoCode> = {
  "American Samoa": "AS",
  Austria: "AT",
  Belgium: "BE",
  Bulgaria: "BG",
  Chile: "CL",
  China: "CN",
  Denmark: "DK",
  Estonia: "EE",
  Eswatini: "SZ",
  Ethiopia: "ET",
  Fiji: "FJ",
  France: "FR",
  Georgia: "GE",
  Greenland: "GL",
  Guam: "GU",
  Hungary: "HU",
  Honduras: "HN",
  India: "IN",
  Italy: "IT",
  Japan: "JP",
  Kazakhstan: "KZ",
  Maldives: "MV",
  Mauritius: "MU",
  Mongolia: "MN",
  "New Zealand": "NZ",
  Norway: "NO",
  Pakistan: "PK",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Russia: "RU",
  Singapore: "SG",
  Slovenia: "SI",
  Somalia: "SO",
  "South Africa": "ZA",
  Spain: "ES",
  Samoa: "WS",
  Sudan: "SD",
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
