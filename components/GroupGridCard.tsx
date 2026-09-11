import Link from "next/link";
import type { EthnicGroup } from "@/lib/db/schema";

export function GroupGridCard({ group }: { group: EthnicGroup }) {
  return (
    <Link
      href={`/groups/${group.slug}`}
      className="glass block rounded-lg border border-white/30 p-5 text-center text-card-foreground shadow-xl transition-colors hover:border-foreground/30 dark:border-white/10"
    >
      <h2 className="font-heading text-xl font-semibold">
        {group.autonym ?? group.name}
      </h2>
      {group.autonym && group.autonym !== group.name && (
        <p className="font-mono text-sm text-muted-foreground italic">
          {group.name}
        </p>
      )}
      <p className="mt-2 text-sm text-muted-foreground">
        {[group.continent, group.languageFamily].filter(Boolean).join(" · ") ||
          "—"}
      </p>
    </Link>
  );
}
