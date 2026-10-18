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
         has_table_privilege('anon', c.oid, 'TRUNCATE') AS anon_truncate,
         CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
              THEN has_table_privilege('authenticated', c.oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE') ELSE false END AS authenticated_access
  FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'thangka' AND c.relkind IN ('r', 'p')
), functions AS (
  SELECT p.proname AS name, pg_get_function_identity_arguments(p.oid) AS arguments,
         pg_get_function_result(p.oid) AS result, p.provolatile AS volatility,
         p.prosecdef AS security_definer, p.proconfig AS configuration,
         has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
         CASE WHEN EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
              THEN has_function_privilege('authenticated', p.oid, 'EXECUTE') ELSE false END AS authenticated_execute,
         COALESCE(p.oid IN (
           to_regprocedure('thangka.search_archive_candidates(text,jsonb,integer)'), to_regprocedure('thangka.set_updated_at()'),
           to_regprocedure('thangka.guard_archive_content()'), to_regprocedure('thangka.prepare_archive_review()'),
           to_regprocedure('thangka.apply_archive_review()'), to_regprocedure('thangka.protect_archive_reviews()'),
           to_regprocedure('thangka.record_archive_review(text,uuid,integer,uuid,text,text,text)')
         ), false) AS expected_signature,
         EXISTS (
           SELECT 1 FROM aclexplode(COALESCE(p.proacl, acldefault('f', p.proowner))) a
           WHERE a.grantee = 0 AND a.privilege_type = 'EXECUTE'
         ) AS public_execute
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'thangka'
)
SELECT jsonb_build_object(
  'inspection_role', current_user,
  'role_superuser', (SELECT rolsuper FROM pg_roles WHERE rolname = current_user),
  'role_bypass_rls', (SELECT rolbypassrls FROM pg_roles WHERE rolname = current_user),
  'anon_schema_usage', has_schema_privilege('anon', 'thangka', 'USAGE'),
  'counts', (SELECT jsonb_object_agg(table_name, row_count) FROM counts),
  'tables', (SELECT jsonb_agg(to_jsonb(t) ORDER BY table_name) FROM tables t WHERE table_name IN ('artists','artworks','images','sources','artwork_artists','artist_sources','artwork_sources','image_sources')),
  'operational_tables', COALESCE((SELECT jsonb_agg(to_jsonb(t) ORDER BY table_name) FROM tables t WHERE table_name = 'archive_reviews'), '[]'::jsonb),
  'unexpected_tables', COALESCE((SELECT jsonb_agg(table_name ORDER BY table_name) FROM tables WHERE table_name NOT IN ('artists','artworks','images','sources','artwork_artists','artist_sources','artwork_sources','image_sources','archive_reviews')), '[]'::jsonb),
  'policies', (
    SELECT jsonb_agg(to_jsonb(p) ORDER BY tablename, policyname)
    FROM (SELECT tablename, policyname, roles, cmd, qual, with_check
          FROM pg_policies WHERE schemaname = 'thangka') p
  ),
  'functions', (SELECT jsonb_agg(to_jsonb(f) ORDER BY arguments) FROM functions f WHERE name = 'search_archive_candidates'),
  'maintenance_functions', COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY name,arguments) FROM functions f WHERE name IN ('guard_archive_content','prepare_archive_review','apply_archive_review','protect_archive_reviews','record_archive_review')), '[]'::jsonb),
  'unexpected_functions', COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY name,arguments) FROM functions f WHERE NOT expected_signature), '[]'::jsonb),
  'review_sequences', COALESCE((SELECT jsonb_agg(jsonb_build_object('name',c.relname,'anon_access',has_sequence_privilege('anon',c.oid,'USAGE,SELECT,UPDATE')) ORDER BY c.relname) FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='thangka' AND c.relkind='S'), '[]'::jsonb)
) AS release_inspection;
