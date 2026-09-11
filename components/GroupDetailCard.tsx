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
import type { EthnicGroup } from "@/lib/db/schema";

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
      <dd>{children}</dd>
    </div>
  );
}

// Region strings embed an admin designator matched against the base name; renders as a pill, "(alias)" muted.
function RegionName({ name }: { name: string }) {
  const designators = [
    "municipality",
    "hromada",
    "obshtina",
    "county",
    "județul",
    "district",
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
    "kommun",
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
  return (
    <Card className="lg:h-full lg:min-h-0">
      <CardHeader className="shrink-0">
        <CardTitle className="text-4xl font-bold tracking-tight">
          {group.autonym ?? group.name}
        </CardTitle>
        {group.autonym && group.autonym !== group.name && (
          <CardDescription className="font-mono text-xl">
            {group.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-8 lg:min-h-0 lg:flex-1">
        <dl className="min-h-0 overflow-hidden">
          {group.languages.length > 0 && (
            <Row
              label="Languages"
              hint="Spoken language(s); entries with a Glottolog page link out."
            >
              <ul className="flex flex-col gap-1">
                {group.languages.map((l) => (
                  <li key={l}>
                    {group.glottologUrls?.[l] ? (
                      <a
                        href={group.glottologUrls[l]}
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
          {group.languageFamily && (
            <Row
              label="Language Family"
              hint="One filter key for the primary language."
            >
              {group.languageFamily}{" "}
              {group.languageSubfamily && `> ${group.languageSubfamily}`}
            </Row>
          )}
          <Row label="Countries" hint="Homeland only — diaspora excluded.">
            {group.countries.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {group.countries.map((c) => {
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
          {group.regions.length > 0 && (
            <Row
              label="Region"
              hint="One marker per division; polygons show extent, not ownership."
            >
              <ul className="flex flex-col gap-1">
                {group.regions.map((d) => (
                  <li key={d.name}>
                    <RegionName name={d.name} />
                  </li>
                ))}
              </ul>
            </Row>
          )}
          {group.cities.length > 0 && (
            <Row
              label="Cities"
              hint="Major towns as dots, distinct from region pins."
            >
              {group.cities.map((c) => c.name).join(", ")}
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
