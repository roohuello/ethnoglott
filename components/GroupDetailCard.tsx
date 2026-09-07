import Flag from "react-flagpack";
import { countryCode } from "@/lib/data/country-codes";
import type { EthnicGroup } from "@/lib/db/schema";

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 border-b border-foreground/10 py-2 text-base last:border-0">
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// Region names carry their lowest-admin designator in the stored string
// (e.g. "Primorsko municipality", "Kolarivska municipality" — Ukraine's
// rural hromada is stored under the same municipality term — or "Iași
// County"). The designator renders as a small pill to distinguish the
// admin level from the place name.
function RegionName({ name }: { name: string }) {
  const designators = ["municipality", "county"];
  const lower = name.toLowerCase();
  for (const designator of designators) {
    if (lower.endsWith(` ${designator}`)) {
      return (
        <>
          {name.slice(0, -designator.length - 1)}
          <span className="ml-2 inline-block rounded-full bg-secondary px-2 py-0.5 align-middle font-mono text-xs font-medium text-secondary-foreground">
            {designator}
          </span>
        </>
      );
    }
  }
  return <>{name}</>;
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
        <p className="mt-1 text-xl text-muted-foreground">{group.name}</p>
      )}
      <dl className="mt-4">
        {group.languages.length > 0 && (
          <Row label="Languages">
            <ul className="flex flex-col gap-1">
              {group.languages.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </Row>
        )}
        {group.languageFamily && (
          <Row label="Language Family">
            {group.languageFamily}{" "}
            {group.languageSubfamily && `> ${group.languageSubfamily}`}
          </Row>
        )}
        <Row label="Countries">
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
        {group.continent && <Row label="Continent">{group.continent}</Row>}
        {group.regions.length > 0 && (
          <Row label="Region">
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
          <Row label="Cities">
            <ul className="flex flex-col gap-1">
              {group.cities.map((c) => (
                <li key={c.name}>{c.name}</li>
              ))}
            </ul>
          </Row>
        )}
      </dl>
      {group.summary && <p className="mt-4 leading-7">{group.summary}</p>}
    </article>
  );
}
