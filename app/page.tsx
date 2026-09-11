import { Suspense } from "react";
import { GroupGridCard } from "@/components/GroupGridCard";
import { GroupSearch } from "@/components/GroupSearch";
import { listGroups } from "@/lib/data/groups";

interface HomeSearchParams {
  q?: string;
}

// Reads Supabase at request time; always dynamic.
export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const { q } = await searchParams;
  const groups = await listGroups({ q });

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 lg:min-h-0 lg:overflow-hidden">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">
          Ethnoglott
        </h1>
        <p className="text-muted-foreground">
          Saving the world's ethnic languages before they're lost
        </p>
      </header>

      <Suspense
        fallback={
          <div className="mx-auto flex h-12 w-full max-w-xl items-center justify-center text-sm text-muted-foreground">
            Loading search…
          </div>
        }
      >
        <GroupSearch />
      </Suspense>

      {groups.length === 0 && (
        <output className="text-sm text-muted-foreground">
          No groups match your search.
        </output>
      )}
      <div className="flex flex-wrap content-start gap-2 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pr-1">
        {groups.map((g) => (
          <GroupGridCard key={g.slug} group={g} />
        ))}
      </div>
    </div>
  );
}
