-- Apply only after metadata inspection; stop rather than overwrite existing policy intent.
-- This artifact is intentionally conservative. Resolve preflight failures separately.
BEGIN;
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'thangka') THEN
        RAISE EXCEPTION 'Review existing thangka policies before applying archive read setup';
    END IF;
    IF EXISTS (
        SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'thangka' AND c.relkind IN ('r','p')
          AND (has_table_privilege('anon',c.oid,'INSERT')
            OR has_table_privilege('anon',c.oid,'UPDATE')
            OR has_table_privilege('anon',c.oid,'DELETE')
            OR has_table_privilege('anon',c.oid,'TRUNCATE'))
    ) THEN
        RAISE EXCEPTION 'Reconcile existing anon write grants (including inherited/PUBLIC grants) before read setup';
    END IF;
END;
$$;
GRANT USAGE ON SCHEMA thangka TO anon;
GRANT SELECT ON TABLE thangka.artists TO anon;
ALTER TABLE thangka.artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.artists FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.artworks TO anon;
ALTER TABLE thangka.artworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.artworks FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.images TO anon;
ALTER TABLE thangka.images ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.images FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.sources TO anon;
ALTER TABLE thangka.sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.sources FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.artwork_artists TO anon;
ALTER TABLE thangka.artwork_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.artwork_artists FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.artist_sources TO anon;
ALTER TABLE thangka.artist_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.artist_sources FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.artwork_sources TO anon;
ALTER TABLE thangka.artwork_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.artwork_sources FOR SELECT TO anon USING (true);
GRANT SELECT ON TABLE thangka.image_sources TO anon;
ALTER TABLE thangka.image_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY archive_retrieval_select ON thangka.image_sources FOR SELECT TO anon USING (true);
GRANT EXECUTE ON FUNCTION thangka.search_archive_candidates(text,jsonb,integer) TO anon;
COMMIT;
