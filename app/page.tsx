import { Suspense } from "react";
import { GroupGridCard } from "@/components/GroupGridCard";
import { GroupSearch } from "@/components/GroupSearch";
import { listGroups } from "@/lib/data/groups";

interface HomeSearchParams {
  q?: string;
}

// Reads SQLite at request time under the Bun runtime.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { q } = await searchParams;
  const groups = await listGroups({ q });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-12">
      <h1 className="text-center font-heading text-4xl font-semibold tracking-tight">
        Ethnoglott
      </h1>
      <p className="mt-2 text-center text-muted-foreground">
        Saving the world's ethnic languages before they're lost
      </p>

      <Suspense
        fallback={
          <div className="mx-auto mt-6 flex h-12 w-full max-w-xl items-center justify-center text-sm text-muted-foreground">
            Loading search…
          </div>
        }
      >
        <GroupSearch />
      </Suspense>

      <output className="mt-6 text-sm text-muted-foreground">
        {groups.length === 0
          ? "No groups match your search."
          : `${groups.length} group${groups.length === 1 ? "" : "s"}`}
      </output>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => (
          <GroupGridCard key={g.slug} group={g} />
        ))}
      </div>
    </div>
  );
}
