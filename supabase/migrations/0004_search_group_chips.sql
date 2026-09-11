--> statement-breakpoint
CREATE OR REPLACE FUNCTION search_group_chips(q text DEFAULT '', max_rows int DEFAULT 500)
RETURNS TABLE (slug text, name text, autonym text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT e.slug, e.name, e.autonym FROM ethnic_groups e
  WHERE q = '' OR (
    e.name ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
    OR e.autonym ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
    OR e.continent ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
    OR e.language_family ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
    OR e.countries::text ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
    OR e.languages::text ILIKE '%' || replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_') || '%' ESCAPE '\'
  )
  ORDER BY e.updated_at DESC, e.name ASC
  LIMIT max_rows;
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION search_group_chips(text, int) TO anon;
