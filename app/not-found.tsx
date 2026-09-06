import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-start justify-center px-6 py-24">
      <h1 className="font-heading text-3xl font-semibold">Not found</h1>
      <p className="mt-2 text-muted-foreground">
        This group does not exist in the database.
      </p>
      <Link href="/" className="mt-4 text-sm underline">
        ← Back to all groups
      </Link>
    </div>
  );
}
