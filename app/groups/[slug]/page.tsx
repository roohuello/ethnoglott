import Link from "next/link";
import { notFound } from "next/navigation";
import { GroupDetailCard } from "@/components/GroupDetailCard";
import { GroupMap } from "@/components/GroupMap";
import type { RegionPoint } from "@/components/GroupMapView";
import { getGroupBySlug } from "@/lib/data/groups";

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
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col lg:min-h-0 lg:overflow-hidden">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← All groups
      </Link>
      <div className="mt-4 grid flex-1 gap-6 lg:min-h-0 lg:grid-cols-[4fr_6fr]">
        <div className="lg:min-h-0 lg:overflow-hidden lg:p-px">
          <GroupDetailCard group={group} />
        </div>
        <div className="h-full">
          <GroupMap
            lat={group.lat}
            lng={group.lng}
            label={group.name}
            regions={group.regions as unknown as RegionPoint[]}
            cities={group.cities as unknown as RegionPoint[]}
            geojson={group.geojson}
          />
        </div>
      </div>
    </div>
  );
}
