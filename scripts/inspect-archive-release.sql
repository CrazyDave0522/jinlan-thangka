-- Read-only release inspection through an authorized dashboard or CLI context.
-- This is not a migration and must never be installed as an application RPC.
WITH counts AS (
  SELECT 'artists' AS table_name, count(*) AS row_count FROM thangka.artists
  UNION ALL SELECT 'artworks', count(*) FROM thangka.artworks
  UNION ALL SELECT 'sources', count(*) FROM thangka.sources
  UNION ALL SELECT 'images', count(*) FROM thangka.images
  UNION ALL SELECT 'artwork_artists', count(*) FROM thangka.artwork_artists
  UNION ALL SELECT 'artist_sources', count(*) FROM thangka.artist_sources
  UNION ALL SELECT 'artwork_sources', count(*) FROM thangka.artwork_sources
  UNION ALL SELECT 'image_sources', count(*) FROM thangka.image_sources
), tables AS (
  SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled,
         c.relforcerowsecurity AS rls_forced,
         pg_get_userbyid(c.relowner) AS owner,
         has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
         has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
         has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
         has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete,
         has_table_privilege('anon', c.oid, 'TRUNCATE') AS anon_truncate
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'thangka' AND c.relkind IN ('r', 'p')
), functions AS (
  SELECT p.proname AS name, pg_get_function_identity_arguments(p.oid) AS arguments,
         pg_get_function_result(p.oid) AS result, p.provolatile AS volatility,
         p.prosecdef AS security_definer, p.proconfig AS configuration,
         has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
         EXISTS (
           SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
           WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
         ) AS public_execute
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'thangka' AND p.proname = 'search_archive_candidates'
)
SELECT jsonb_build_object(
  'inspection_role', current_user,
  'role_superuser', (SELECT rolsuper FROM pg_roles WHERE rolname = current_user),
  'role_bypass_rls', (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user),
  'anon_schema_usage', has_schema_privilege('anon', 'thangka', 'USAGE'),
  'counts', (SELECT jsonb_object_agg(table_name, row_count) FROM counts),
  'tables', (SELECT jsonb_agg(to_jsonb(t) ORDER BY table_name) FROM tables t),
  'policies', (
    SELECT jsonb_agg(to_jsonb(p) ORDER BY tablename, policyname)
    FROM (SELECT tablename, policyname, roles, cmd, qual, with_check
          FROM pg_policies WHERE schemaname = 'thangka') p
  ),
  'functions', (SELECT jsonb_agg(to_jsonb(f) ORDER BY arguments) FROM functions f)
) AS release_inspection;
