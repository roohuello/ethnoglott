import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { GroupChip } from "@/lib/data/groups";

export function GroupGridCard({ group }: { group: GroupChip }) {
  return (
    <Button
      variant="outline"
      size="lg"
      render={<Link href={`/groups/${group.slug}`} />}
      nativeButton={false}
    >
      {group.endonym ?? group.name}
    </Button>
  );
}
