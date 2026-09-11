# ADR-0005: Per-language Glottolog URLs

Date: 2026-09-08
Status: accepted
Supersedes: the single-`glottolog_url` primary-language column

## Context
The Languages row lists every language a group speaks, but only the
first entry linked out to Glottolog. Multilingual groups (Greenlandic
Inuit, Norman + French) left most of the row as plain text.

## Decision
Replace the `glottolog_url` text column with `glottolog_urls`, a JSON
text column holding `{ languageName: url }` (one entry per value in
`languages[]`), following the ADR-0001 single-table doctrine. The
detail card links every language that has a URL; languages without one
render as plain text (allowed, not an error).

## Consequences
- One-time manual migration (`ADD COLUMN` + reseed + `DROP COLUMN`),
  since `drizzle-kit push` needs an interactive TTY for the drop/add.
- Sync rule (every `languages[]` value has a URL) is enforced by seeder
  discipline, exactly like the country sync rule in ADR-0003.
