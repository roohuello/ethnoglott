--> statement-breakpoint
CREATE OR REPLACE FUNCTION ascii_fold(s text)
RETURNS text LANGUAGE sql IMMUTABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT regexp_replace(
    normalize(translate(s, 'łŁøØđĐıŋ', 'lLoOdDin'), NFD),
    '[^[:ascii:]]', '', 'g'
  );
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION ascii_fold(text) TO anon;
--> statement-breakpoint
DROP FUNCTION search_group_chips(text, integer);
--> statement-breakpoint
CREATE FUNCTION search_group_chips(q text DEFAULT '', max_rows int DEFAULT 500)
RETURNS TABLE (slug text, name text, endonym text)
LANGUAGE sql STABLE SECURITY INVOKER SET search_path = public AS $$
  SELECT e.slug, e.name, e.endonym FROM ethnic_groups e
  WHERE q = '' OR (
    ascii_fold(e.name) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.endonym) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.continent) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.language_family) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.countries::text) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.languages::text) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
    OR ascii_fold(e.subgroups::text) ILIKE '%' || ascii_fold(replace(replace(replace(q, '\', '\\'), '%', '\%'), '_', '\_')) || '%' ESCAPE '\'
  )
  ORDER BY e.updated_at DESC, e.name ASC
  LIMIT max_rows;
$$;
--> statement-breakpoint
GRANT EXECUTE ON FUNCTION search_group_chips(text, int) TO anon;
--> statement-breakpoint
NOTIFY pgrst, 'reload schema';
