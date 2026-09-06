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
        {group.region && <Row label="Region">{group.region}</Row>}
        {group.districts.length > 0 && (
          <Row label="District">
            <ul className="flex flex-col gap-1">
              {group.districts.map((d) => (
                <li key={d.name}>{d.name}</li>
              ))}
            </ul>
          </Row>
        )}
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
          <Row label="Language family">{group.languageFamily}</Row>
        )}
        {group.population != null && (
          <Row label="Population">{group.population.toLocaleString()}</Row>
        )}
      </dl>
      {group.summary && <p className="mt-4 leading-7">{group.summary}</p>}
    </article>
  );
}
