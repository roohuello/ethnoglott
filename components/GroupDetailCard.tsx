import { IconInfoCircle } from "@tabler/icons-react";
import Flag from "react-flagpack";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/Tooltip";
import { countryCode } from "@/lib/data/country-codes";
import type { EthnicGroup } from "@/lib/db/schema";

// Info icon beside a row label: hover or keyboard-focus reveals a short
// explanation of the row's purpose.
function RowHint({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger className="ml-1 inline-flex align-middle">
        <IconInfoCircle size={14} stroke={1.75} aria-hidden />
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
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
        {hint && <RowHint text={hint} />}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}

// Region names carry their lowest-admin designator in the stored string
// (e.g. "Kolarivska hromada", "Kemsky District", "Rouen arrondîment",
// or with a leading designator: "Obshtina Primorsko", "Județul Iași",
// "Inkhundla Lugongolweni"). A trailing "(...)" alias — e.g. the Russian
// exonym alongside the Karelian name in "Kemin piiri (Kemsk)" —
// is display-only: the designator is matched against the base name, and the
// alias re-appends muted. The designator renders as a small pill to
// distinguish the admin level from the place name.
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

// Uniform detail card — every group renders the same row structure;
// NULL fields hide their row (see CONTEXT.md).
export function GroupDetailCard({ group }: { group: EthnicGroup }) {
  return (
    <article className="glass rounded-lg border border-white/30 p-6 text-card-foreground shadow-xl dark:border-white/10">
      <h1 className="font-heading text-4xl font-semibold tracking-tight">
        {group.autonym ?? group.name}
      </h1>
      {group.autonym && group.autonym !== group.name && (
        <p className="mt-1 font-mono text-xl text-muted-foreground italic">
          {group.name}
        </p>
      )}
      <dl className="mt-4">
        {group.languages.length > 0 && (
          <Row
            label="Languages"
            hint="Spoken language(s); entries with a Glottolog page link out."
          >
            <ul className="flex flex-col gap-1">
              {/* glottologUrls maps language name → Glottolog page —
                  every entry with a URL renders as a link. */}
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
        <Row
          label="Countries"
          hint="Homeland only — diaspora excluded."
        >
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
          <Row
            label="Continent"
            hint="Homeland continent."
          >
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
      {group.summary && <p className="mt-4 leading-7">{group.summary}</p>}
    </article>
  );
}
