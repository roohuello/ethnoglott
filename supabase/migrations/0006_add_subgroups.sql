--> statement-breakpoint
ALTER TABLE ethnic_groups ADD COLUMN subgroups jsonb NOT NULL DEFAULT '[]'::jsonb;
--> statement-breakpoint
NOTIFY pgrst;
