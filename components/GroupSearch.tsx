"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

// Standalone search bar. Typing updates the URL (debounced), which
// re-renders the server grid.
export function GroupSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const [q, setQ] = useState(urlQuery);

  // Keep the input in sync with back/forward navigation (unless typing).
  useEffect(() => {
    if (document.activeElement?.id !== "group-search") setQ(urlQuery);
  }, [urlQuery]);

  const apply = useCallback(
    (nextQuery: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (!nextQuery) params.delete("q");
      else params.set("q", nextQuery);
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname);
      });
    },
    [searchParams, pathname, router],
  );

  // Debounce text search so each keystroke isn't a navigation.
  useEffect(() => {
    if (q === urlQuery) return;
    const t = setTimeout(() => apply(q), 300);
    return () => clearTimeout(t);
  }, [q, urlQuery, apply]);

  return (
    <div className="mx-auto mt-6 w-full max-w-xl">
      <input
        id="group-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search groups…"
        aria-label="Search groups"
        className="glass glass-input h-12 w-full rounded-lg border border-white/30 px-4 text-base outline-none focus-visible:border-ring dark:border-white/10"
      />
      {isPending && (
        <output className="mt-2 block text-center text-xs text-muted-foreground">
          Searching…
        </output>
      )}
    </div>
  );
}
