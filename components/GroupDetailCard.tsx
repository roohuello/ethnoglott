import { IconInfoCircle } from "@tabler/icons-react";
import Flag from "react-flagpack";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { ScrollArea } from "@/components/ui/ScrollArea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { countryCode } from "@/lib/data/country-codes";
import type { EthnicGroup, Json } from "@/lib/db/database.types";
import type { RegionPoint } from "./GroupMapView";

function asStrings(value: Json): string[] {
  return Array.isArray(value)
    ? value.filter((e): e is string => typeof e === "string")
    : [];
}

function asPoints(value: Json): RegionPoint[] {
  if (!Array.isArray(value)) return [];
  const out: RegionPoint[] = [];
  for (const e of value) {
    if (typeof e !== "object" || e === null || Array.isArray(e)) continue;
    if (typeof e.name !== "string") continue;
    out.push({
      name: e.name,
      lat: typeof e.lat === "number" ? e.lat : null,
      lng: typeof e.lng === "number" ? e.lng : null,
    });
  }
  return out;
}

function asStringMap(value: Json): Record<string, string> {
  if (typeof value !== "object" || value === null || Array.isArray(value))
    return {};
  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-foreground/10 py-2 text-base last:border-0">
      <dt className="font-medium text-muted-foreground">
        {label}
        {hint && (
          <Tooltip>
            <TooltipTrigger className="ml-1 inline-flex align-middle">
              <IconInfoCircle size={14} stroke={1.75} aria-hidden />
            </TooltipTrigger>
            <TooltipContent>{hint}</TooltipContent>
          </Tooltip>
        )}
      </dt>
      <dd className="leading-snug">{children}</dd>
    </div>
  );
}

// Region strings embed an admin designator matched against the base name; renders as a pill, "(alias)" muted.
function RegionName({ name }: { name: string }) {
  const designators = [
    "municipality",
    "kommunia",
    "audany",
    "hromada",
    "obshtina",
    "município",
    "comene",
    "občina",
    "comune",
    "county",
    "distrito",
    "județul",
    "district",
    "ضلع",
    "район",
    "rajon",
    "arrondissement",
    "arrondîment",
    "inkhundla",
    "piiri",
    "vald",
    "zone",
    "sum",
    "soum",
    "aimag",
    "gobol",
    "gobolka",
    "degmada",
    "bezirk",
    "megye",
    "járás",
    "kommune",
    "kommun",
    "kabupaten",
    "phường",
    "tỉnh",
    "nahiyisi",
    "island",
    "mahalliyya",
    "zil",
    "zila",
    "fu",
    "região",
    "rohe",
    "rdzong",
    "region",
  ];
  const aliasMatch = name.match(/^(.*?)\s+(\([^()]*\))$/);
  const base = aliasMatch ? aliasMatch[1] : name;
  const alias = aliasMatch ? aliasMatch[2] : null;
  const lower = base.toLowerCase();
  let stem: string | null = null;
  let matched = "";
  for (const designator of designators) {
    if (lower.endsWith(` ${designator}`)) {
      stem = base.slice(0, -designator.length - 1);
      matched = designator;
      break;
    }
    if (lower.startsWith(`${designator} `)) {
      stem = base.slice(designator.length + 1);
      matched = designator;
      break;
    }
    // Hyphenated romanizations (e.g. Kyoto-fu); space forms take precedence.
    if (lower.endsWith(`-${designator}`)) {
      stem = base.slice(0, -designator.length - 1);
      matched = designator;
      break;
    }
  }
  if (stem === null) return <>{name}</>;
  return (
    <>
      {stem}
      <span className="ml-2 inline-block rounded-full bg-secondary px-2 py-0.5 align-middle font-mono text-xs font-medium text-secondary-foreground">
        {matched}
      </span>
      {alias && <span className="ml-2 text-muted-foreground">{alias}</span>}
    </>
  );
}

// Uniform detail card; NULL fields hide their row (see CONTEXT.md).
export function GroupDetailCard({ group }: { group: EthnicGroup }) {
  const languages = asStrings(group.languages);
  const subgroups = asStrings(group.subgroups);
  const countries = asStrings(group.countries);
  const regions = asPoints(group.regions);
  const cities = asPoints(group.cities);
  const glottologUrls = asStringMap(group.glottolog_urls);
  return (
    <Card className="lg:h-full lg:min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle className="text-4xl font-bold tracking-tight">
          {group.endonym ?? group.name}
        </CardTitle>
        {group.endonym && (
          <CardDescription className="font-mono text-xl">
            {group.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-8 lg:min-h-0 lg:flex-1">
        <dl className="min-h-0 overflow-hidden">
          {languages.length > 0 && (
            <Row
              label="Languages"
              hint="Spoken language(s); entries with a Glottolog page link out."
            >
              <ul className="flex flex-col gap-1">
                {languages.map((l) => (
                  <li key={l}>
                    {glottologUrls?.[l] ? (
                      <a
                        href={glottologUrls[l]}
                        target="_blank"
                        rel="noreferrer"
                        className="underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
                      >
                        {l}
                      </a>
                    ) : (
                      l
                    )}
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {group.language_family && (
            <Row
              label="Language Family"
              hint="One filter key for the primary language."
            >
              {group.language_family}{" "}
              {group.language_subfamily && `> ${group.language_subfamily}`}
            </Row>
          )}
          {subgroups.length > 0 && (
            <Row
              label="Subgroups"
              hint="Named subdivisions of the group; searchable."
            >
              <ul className="flex flex-col gap-1">
                {subgroups.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Row>
          )}
          <Row label="Countries" hint="Homeland only — diaspora excluded.">
            {countries.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {countries.map((c) => {
                  const code = countryCode(c);
                  return (
                    <li key={c} className="flex items-center gap-2">
                      {code && (
                        <Flag
                          code={code}
                          size="m"
                          hasBorder={false}
                          hasBorderRadius
                        />
                      )}
                      <span>{c}</span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              "—"
            )}
          </Row>
          {group.continent && (
            <Row label="Continent" hint="Homeland continent.">
              {group.continent}
            </Row>
          )}
          {regions.length > 0 && (
            <Row
              label="Region"
              hint="One marker per division; polygons show extent, not ownership."
            >
              <ul className="flex flex-col gap-1">
                {regions.map((d) => (
                  <li key={d.name}>
                    <RegionName name={d.name} />
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {cities.length > 0 && (
            <Row
              label="Cities"
              hint="Major towns as dots, distinct from region pins."
            >
              {cities.map((c) => c.name).join(", ")}
            </Row>
          )}
        </dl>
        {group.summary && (
          <ScrollArea className="min-h-0 lg:min-h-[25%] lg:flex-1">
            <p className="text-base">{group.summary}</p>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
