"use client";

import { IconSearch } from "@tabler/icons-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";

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
    <div className="mx-auto w-full max-w-xl">
      <InputGroup className="h-12 gap-2 rounded-3xl border-border bg-background">
        <InputGroupAddon>
          <IconSearch aria-hidden />
        </InputGroupAddon>
        <InputGroupInput
          id="group-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search groups…"
          aria-label="Search groups"
        />
      </InputGroup>
      {isPending && (
        <output className="mt-2 block text-center text-xs text-muted-foreground">
          Searching…
        </output>
      )}
    </div>
  );
}
