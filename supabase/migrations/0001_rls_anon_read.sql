--> statement-breakpoint
ALTER TABLE "ethnic_groups" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "anon read" ON "ethnic_groups" FOR SELECT TO anon USING (true);
