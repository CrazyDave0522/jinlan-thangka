-- Incremental review/ingestion integrity; never rerun the archive initializer remotely.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
LOCK TABLE thangka.artists, thangka.artworks, thangka.images,
    thangka.artist_sources, thangka.artwork_sources, thangka.image_sources
    IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
        WHERE n.nspname='thangka' AND p.proname IN ('guard_archive_content','prepare_archive_review','apply_archive_review','protect_archive_reviews','record_archive_review')) THEN
        RAISE EXCEPTION 'Review existing maintenance routines before applying archive quality';
    END IF;
    IF EXISTS (SELECT 1 FROM thangka.artists WHERE review_status IN ('verified','disputed'))
       OR EXISTS (SELECT 1 FROM thangka.artworks WHERE review_status IN ('verified','disputed'))
       OR EXISTS (SELECT 1 FROM thangka.images WHERE review_status IN ('verified','disputed')) THEN
        RAISE EXCEPTION 'Reconcile legacy verified/disputed records explicitly before adding review history';
    END IF;
END;
$$;

ALTER TABLE thangka.artists
    ADD COLUMN content_revision integer NOT NULL DEFAULT 1 CHECK (content_revision > 0),
    ADD COLUMN current_review_id uuid;
ALTER TABLE thangka.artworks
    ADD COLUMN content_revision integer NOT NULL DEFAULT 1 CHECK (content_revision > 0),
    ADD COLUMN current_review_id uuid;
ALTER TABLE thangka.images
    ADD COLUMN content_revision integer NOT NULL DEFAULT 1 CHECK (content_revision > 0),
    ADD COLUMN current_review_id uuid;

CREATE SEQUENCE thangka.archive_review_order;
CREATE TABLE thangka.archive_reviews (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    decision_order bigint NOT NULL UNIQUE,
    artist_id uuid REFERENCES thangka.artists(id) ON DELETE RESTRICT,
    artwork_id uuid REFERENCES thangka.artworks(id) ON DELETE RESTRICT,
    image_id uuid REFERENCES thangka.images(id) ON DELETE RESTRICT,
    content_revision integer NOT NULL CHECK (content_revision > 0),
    previous_review_id uuid REFERENCES thangka.archive_reviews(id) ON DELETE RESTRICT,
    decision text NOT NULL CHECK (decision IN ('pending','verified','disputed')),
    reviewer text NOT NULL CHECK (btrim(reviewer) <> ''),
    reviewed_at timestamptz NOT NULL,
    notes text,
    snapshot jsonb NOT NULL,
    CHECK (num_nonnulls(artist_id, artwork_id, image_id) = 1)
);
ALTER SEQUENCE thangka.archive_review_order OWNED BY thangka.archive_reviews.decision_order;
ALTER TABLE thangka.archive_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE thangka.artists ADD FOREIGN KEY (current_review_id) REFERENCES thangka.archive_reviews(id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE thangka.artworks ADD FOREIGN KEY (current_review_id) REFERENCES thangka.archive_reviews(id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
ALTER TABLE thangka.images ADD FOREIGN KEY (current_review_id) REFERENCES thangka.archive_reviews(id) ON DELETE RESTRICT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX archive_reviews_artist_order_idx ON thangka.archive_reviews(artist_id, decision_order DESC) WHERE artist_id IS NOT NULL;
CREATE INDEX archive_reviews_artwork_order_idx ON thangka.archive_reviews(artwork_id, decision_order DESC) WHERE artwork_id IS NOT NULL;
CREATE INDEX archive_reviews_image_order_idx ON thangka.archive_reviews(image_id, decision_order DESC) WHERE image_id IS NOT NULL;

CREATE FUNCTION thangka.guard_archive_content() RETURNS trigger
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    event thangka.archive_reviews%ROWTYPE;
    entity_id uuid;
    excluded text[] := ARRAY['content_revision','current_review_id','review_status','created_at','updated_at'];
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.content_revision IS DISTINCT FROM 1 OR NEW.current_review_id IS NOT NULL
           OR NEW.review_status IN ('verified','disputed') THEN
            RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'New records must start unreviewed at revision one';
        END IF;
        RETURN NEW;
    END IF;
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.content_revision IS DISTINCT FROM OLD.content_revision THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Entity identity and revision are database managed';
    END IF;
    IF (to_jsonb(NEW) - excluded) IS DISTINCT FROM (to_jsonb(OLD) - excluded) THEN
        IF NEW.review_status IS DISTINCT FROM OLD.review_status OR NEW.current_review_id IS DISTINCT FROM OLD.current_review_id THEN
            RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Change content separately from recording a review';
        END IF;
        NEW.content_revision := OLD.content_revision + 1;
        NEW.review_status := 'pending';
        NEW.current_review_id := NULL;
    ELSIF NEW.review_status IS DISTINCT FROM OLD.review_status OR NEW.current_review_id IS DISTINCT FROM OLD.current_review_id THEN
        SELECT * INTO event FROM thangka.archive_reviews WHERE id = NEW.current_review_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Review state requires its current decision';
        END IF;
        entity_id := CASE TG_TABLE_NAME WHEN 'artists' THEN event.artist_id WHEN 'artworks' THEN event.artwork_id WHEN 'images' THEN event.image_id END;
        IF entity_id IS DISTINCT FROM NEW.id OR event.content_revision IS DISTINCT FROM NEW.content_revision
           OR event.decision IS DISTINCT FROM NEW.review_status
           OR event.previous_review_id IS DISTINCT FROM OLD.current_review_id
           OR EXISTS (
                SELECT 1 FROM thangka.archive_reviews r
                WHERE (CASE TG_TABLE_NAME WHEN 'artists' THEN r.artist_id WHEN 'artworks' THEN r.artwork_id WHEN 'images' THEN r.image_id END) = NEW.id
                  AND r.decision_order > event.decision_order
           ) THEN
            RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Review decision does not match the latest entity version';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE FUNCTION thangka.prepare_archive_review() RETURNS trigger
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    entity jsonb;
BEGIN
    IF NEW.decision_order IS NOT NULL OR NEW.reviewed_at IS NOT NULL OR NEW.snapshot IS NOT NULL THEN
        RAISE EXCEPTION USING ERRCODE = '23514', MESSAGE = 'Review order, time and snapshot are database generated';
    END IF;
    IF num_nonnulls(NEW.artist_id, NEW.artwork_id, NEW.image_id) <> 1 THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'A review requires exactly one typed entity';
    END IF;
    IF NEW.artist_id IS NOT NULL THEN
        SELECT to_jsonb(a) INTO entity FROM thangka.artists a WHERE id = NEW.artist_id FOR UPDATE;
    ELSIF NEW.artwork_id IS NOT NULL THEN
        SELECT to_jsonb(a) INTO entity FROM thangka.artworks a WHERE id = NEW.artwork_id FOR UPDATE;
    ELSE
        SELECT to_jsonb(a) INTO entity FROM thangka.images a WHERE id = NEW.image_id FOR UPDATE;
    END IF;
    IF entity IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Review entity was not found';
    END IF;
    IF NEW.content_revision IS DISTINCT FROM (entity->>'content_revision')::integer
       OR NEW.previous_review_id IS DISTINCT FROM (entity->>'current_review_id')::uuid THEN
        RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Archive content or current review changed';
    END IF;
    NEW.decision_order := nextval('thangka.archive_review_order'::regclass);
    NEW.reviewed_at := clock_timestamp();
    NEW.snapshot := entity - ARRAY['content_revision','current_review_id','review_status','created_at','updated_at'];
    RETURN NEW;
END;
$$;

CREATE FUNCTION thangka.apply_archive_review() RETURNS trigger
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
BEGIN
    IF NEW.artist_id IS NOT NULL THEN
        UPDATE thangka.artists SET review_status = NEW.decision, current_review_id = NEW.id WHERE id = NEW.artist_id;
    ELSIF NEW.artwork_id IS NOT NULL THEN
        UPDATE thangka.artworks SET review_status = NEW.decision, current_review_id = NEW.id WHERE id = NEW.artwork_id;
    ELSE
        UPDATE thangka.images SET review_status = NEW.decision, current_review_id = NEW.id WHERE id = NEW.image_id;
    END IF;
    RETURN NULL;
END;
$$;

CREATE FUNCTION thangka.protect_archive_reviews() RETURNS trigger
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
BEGIN
    RAISE EXCEPTION USING ERRCODE = '55000', MESSAGE = 'Review history is append-only; record a new decision';
END;
$$;

CREATE FUNCTION thangka.record_archive_review(
    p_entity text, p_entity_id uuid, p_expected_revision integer,
    p_expected_review_id uuid, p_decision text, p_reviewer text, p_notes text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql VOLATILE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    entity jsonb;
    review_id uuid;
BEGIN
    IF p_entity IS NULL OR p_entity NOT IN ('artist','artwork','image') OR p_entity_id IS NULL
       OR p_expected_revision IS NULL OR p_expected_revision < 1
       OR p_decision IS NULL OR p_decision NOT IN ('pending','verified','disputed')
       OR p_reviewer IS NULL OR btrim(p_reviewer) = '' THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Invalid archive review arguments';
    END IF;
    CASE p_entity
        WHEN 'artist' THEN SELECT to_jsonb(a) INTO entity FROM thangka.artists a WHERE id = p_entity_id FOR UPDATE;
        WHEN 'artwork' THEN SELECT to_jsonb(a) INTO entity FROM thangka.artworks a WHERE id = p_entity_id FOR UPDATE;
        WHEN 'image' THEN SELECT to_jsonb(a) INTO entity FROM thangka.images a WHERE id = p_entity_id FOR UPDATE;
    END CASE;
    IF entity IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '22023', MESSAGE = 'Review entity was not found';
    END IF;
    IF p_expected_revision IS DISTINCT FROM (entity->>'content_revision')::integer
       OR p_expected_review_id IS DISTINCT FROM (entity->>'current_review_id')::uuid THEN
        RAISE EXCEPTION USING ERRCODE = '40001', MESSAGE = 'Archive content or current review changed';
    END IF;
    INSERT INTO thangka.archive_reviews(artist_id, artwork_id, image_id, content_revision, previous_review_id, decision, reviewer, notes)
    VALUES (CASE WHEN p_entity = 'artist' THEN p_entity_id END,
            CASE WHEN p_entity = 'artwork' THEN p_entity_id END,
            CASE WHEN p_entity = 'image' THEN p_entity_id END,
            p_expected_revision, p_expected_review_id, p_decision, p_reviewer, p_notes)
    RETURNING id INTO review_id;
    RETURN review_id;
END;
$$;

CREATE TRIGGER archive_content_guard BEFORE INSERT OR UPDATE ON thangka.artists FOR EACH ROW EXECUTE FUNCTION thangka.guard_archive_content();
CREATE TRIGGER archive_content_guard BEFORE INSERT OR UPDATE ON thangka.artworks FOR EACH ROW EXECUTE FUNCTION thangka.guard_archive_content();
CREATE TRIGGER archive_content_guard BEFORE INSERT OR UPDATE ON thangka.images FOR EACH ROW EXECUTE FUNCTION thangka.guard_archive_content();
CREATE TRIGGER prepare_archive_review BEFORE INSERT ON thangka.archive_reviews FOR EACH ROW EXECUTE FUNCTION thangka.prepare_archive_review();
CREATE TRIGGER apply_archive_review AFTER INSERT ON thangka.archive_reviews FOR EACH ROW EXECUTE FUNCTION thangka.apply_archive_review();
CREATE TRIGGER protect_archive_reviews BEFORE UPDATE OR DELETE ON thangka.archive_reviews FOR EACH ROW EXECUTE FUNCTION thangka.protect_archive_reviews();
CREATE TRIGGER protect_archive_review_truncation BEFORE TRUNCATE ON thangka.archive_reviews FOR EACH STATEMENT EXECUTE FUNCTION thangka.protect_archive_reviews();

-- New objects are operational; existing business grants and the exact search RPC are untouched.
REVOKE ALL ON TABLE thangka.archive_reviews FROM PUBLIC;
REVOKE ALL ON SEQUENCE thangka.archive_review_order FROM PUBLIC;
REVOKE ALL ON FUNCTION thangka.guard_archive_content(), thangka.prepare_archive_review(),
    thangka.apply_archive_review(), thangka.protect_archive_reviews(),
    thangka.record_archive_review(text,uuid,integer,uuid,text,text,text) FROM PUBLIC;
DO $$
DECLARE
    role_name text;
    function_oid regprocedure;
BEGIN
    FOR role_name IN SELECT rolname FROM pg_roles WHERE rolname IN ('anon','authenticated') LOOP
        EXECUTE format('REVOKE ALL ON TABLE thangka.archive_reviews FROM %I', role_name);
        EXECUTE format('REVOKE ALL ON SEQUENCE thangka.archive_review_order FROM %I', role_name);
        FOR function_oid IN SELECT p.oid::regprocedure FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
            WHERE n.nspname = 'thangka' AND p.proname IN ('guard_archive_content','prepare_archive_review','apply_archive_review','protect_archive_reviews','record_archive_review') LOOP
            EXECUTE format('REVOKE ALL ON FUNCTION %s FROM %I', function_oid, role_name);
            IF has_function_privilege(role_name, function_oid, 'EXECUTE') THEN
                RAISE EXCEPTION 'Reconcile inherited maintenance execution before applying archive quality';
            END IF;
        END LOOP;
        IF has_table_privilege(role_name, 'thangka.archive_reviews', 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
           OR has_sequence_privilege(role_name, 'thangka.archive_review_order', 'USAGE,SELECT,UPDATE') THEN
            RAISE EXCEPTION 'Reconcile inherited review-ledger privileges before applying archive quality';
        END IF;
    END LOOP;
END;
$$;

COMMENT ON TABLE thangka.archive_reviews IS 'Append-only operational entity-row review history; not answer evidence or authenticated identity';
COMMENT ON COLUMN thangka.artists.content_revision IS 'Database-managed content version; edits reset review status';
COMMENT ON COLUMN thangka.artworks.content_revision IS 'Database-managed content version; edits reset review status';
COMMENT ON COLUMN thangka.images.content_revision IS 'Database-managed content version; included in full-row image permission digests';

ALTER TABLE thangka.artists ADD CONSTRAINT artists_aliases_flat_strings CHECK (CASE WHEN cardinality(aliases) = 0 THEN true WHEN array_ndims(aliases) = 1 THEN array_position(aliases, NULL) IS NULL ELSE false END);
ALTER TABLE thangka.artists ADD CONSTRAINT artists_styles_flat_strings CHECK (CASE WHEN cardinality(styles) = 0 THEN true WHEN array_ndims(styles) = 1 THEN array_position(styles, NULL) IS NULL ELSE false END);
ALTER TABLE thangka.artists ADD CONSTRAINT artists_institutions_flat_strings CHECK (CASE WHEN cardinality(institutions) = 0 THEN true WHEN array_ndims(institutions) = 1 THEN array_position(institutions, NULL) IS NULL ELSE false END);
ALTER TABLE thangka.artworks ADD CONSTRAINT artworks_alternative_titles_flat_strings CHECK (CASE WHEN cardinality(alternative_titles) = 0 THEN true WHEN array_ndims(alternative_titles) = 1 THEN array_position(alternative_titles, NULL) IS NULL ELSE false END);
ALTER TABLE thangka.artworks ADD CONSTRAINT artworks_styles_flat_strings CHECK (CASE WHEN cardinality(styles) = 0 THEN true WHEN array_ndims(styles) = 1 THEN array_position(styles, NULL) IS NULL ELSE false END);
ALTER TABLE thangka.artist_sources ADD CONSTRAINT artist_sources_supported_field_check CHECK (supported_field IN ('','id','display_name','name_bo','name_en','aliases','gender','birth_period_text','death_period_text','region_text','styles','institutions','teachers_text','active_period_text','biography','official_url','collected_by','collected_on','review_status','notes','created_at','updated_at'));
ALTER TABLE thangka.artwork_sources ADD CONSTRAINT artwork_sources_supported_field_check CHECK (supported_field IN ('','id','title','title_bo','title_en','alternative_titles','attribution_status','attribution_notes','creation_period_text','creation_year_start','creation_year_end','dating_notes','styles','subject_primary','subject_details','iconography_notes','materials_text','technique_text','height_cm','width_cm','dimensions_notes','collection_name','accession_number','collection_location','provenance_notes','description','collected_by','collected_on','review_status','notes','created_at','updated_at'));
ALTER TABLE thangka.image_sources ADD CONSTRAINT image_sources_supported_field_check CHECK (supported_field IN ('','id','artwork_id','storage_locator','image_type','is_primary','caption','photographer_or_provider','rights_status','license_or_permission_reference','permission_notes','quality_notes','sha256','pixel_width','pixel_height','mime_type','byte_size','collected_by','collected_on','review_status','notes','created_at','updated_at'));
NOTIFY pgrst, 'reload schema';
COMMIT;
