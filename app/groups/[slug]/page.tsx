import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupDetailCard } from "@/components/GroupDetailCard";
import { GroupMap } from "@/components/GroupMap";
import { getGroupBySlug } from "@/lib/data/groups";

// Reads SQLite at request time under the Bun runtime.
export const dynamic = "force-dynamic";

export default async function GroupPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = await getGroupBySlug(slug);
  if (!group) notFound();

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-8">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← All groups
      </Link>
      <div className="mt-4 grid flex-1 gap-6 lg:grid-cols-[40%_60%]">
        <GroupDetailCard group={group} />
        <div className="min-h-[320px] lg:sticky lg:top-6 lg:h-[calc(100vh-6rem)]">
          <GroupMap
            lat={group.lat}
            lng={group.lng}
            zoom={group.zoom}
            label={group.name}
          />
        </div>
      </div>
    </div>
  );
}
