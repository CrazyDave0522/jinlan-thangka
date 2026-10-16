-- Incremental function only. Inspect deployed schema/access before applying.
BEGIN;
CREATE FUNCTION thangka.search_archive_candidates(p_entity text, p_filters jsonb, p_limit integer)
RETURNS TABLE(id uuid, rank integer, matches jsonb)
LANGUAGE plpgsql STABLE SECURITY INVOKER SET search_path = '' AS $$
DECLARE
    f jsonb;
    v text;
    fields text[] := '{}';
    whitespace text := chr(32) || chr(160) || chr(5760) || chr(8192) || chr(8193)
        || chr(8194) || chr(8195) || chr(8196) || chr(8197) || chr(8198) || chr(8199)
        || chr(8200) || chr(8201) || chr(8202) || chr(8232) || chr(8233)
        || chr(8239) || chr(8287) || chr(12288) || chr(65279);
BEGIN
    IF p_entity IS NULL OR p_entity NOT IN ('artist', 'artwork')
       OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 10
       OR p_filters IS NULL OR jsonb_typeof(p_filters) <> 'array' THEN
        RAISE EXCEPTION 'invalid_query' USING ERRCODE = '22023';
    END IF;
    IF jsonb_array_length(p_filters) NOT BETWEEN 1 AND 3 THEN
        RAISE EXCEPTION 'invalid_query' USING ERRCODE = '22023';
    END IF;
    FOR f IN SELECT value FROM jsonb_array_elements(p_filters) LOOP
        IF jsonb_typeof(f) <> 'object' THEN
            RAISE EXCEPTION 'invalid_query' USING ERRCODE = '22023';
        END IF;
        IF (f - ARRAY['field','value','mode']) <> '{}'::jsonb
           OR jsonb_typeof(f->'field') IS DISTINCT FROM 'string'
           OR jsonb_typeof(f->'value') IS DISTINCT FROM 'string'
           OR jsonb_typeof(f->'mode') IS DISTINCT FROM 'string'
           OR f->>'mode' NOT IN ('exact','contains')
           OR f->>'field' NOT IN ('name','style','subject','collection','accession')
           OR (p_entity = 'artist' AND f->>'field' NOT IN ('name','style'))
           OR (f->>'field') = ANY(fields) THEN
            RAISE EXCEPTION 'invalid_query' USING ERRCODE = '22023';
        END IF;
        v := btrim(f->>'value', whitespace);
        IF length(v) NOT BETWEEN 1 AND 200 OR (f->>'value') ~ '[[:cntrl:]]'
           OR EXISTS (SELECT 1 FROM generate_series(128,159) c WHERE strpos(f->>'value',chr(c)) > 0) THEN
            RAISE EXCEPTION 'invalid_query' USING ERRCODE = '22023';
        END IF;
        fields := array_append(fields, f->>'field');
    END LOOP;
    RETURN QUERY
    WITH records AS (
        SELECT a.id AS record_id, to_jsonb(a) AS doc FROM thangka.artists a WHERE p_entity = 'artist'
        UNION ALL
        SELECT a.id, to_jsonb(a) FROM thangka.artworks a WHERE p_entity = 'artwork'
    ), field_map(entity, field, col, tier, col_order) AS (
        VALUES ('artist','name','display_name',0,1), ('artist','name','name_bo',1,2),
          ('artist','name','name_en',1,3), ('artist','name','aliases',2,4),
          ('artist','style','styles',2,1),
          ('artwork','name','title',0,1), ('artwork','name','title_bo',1,2),
          ('artwork','name','title_en',1,3), ('artwork','name','alternative_titles',2,4),
          ('artwork','subject','subject_primary',0,1), ('artwork','subject','subject_details',0,2),
          ('artwork','style','styles',2,1), ('artwork','collection','collection_name',0,1),
          ('artwork','accession','accession_number',0,1)
    ), filters AS (
        SELECT value->>'field' AS field, lower(btrim(value->>'value', whitespace)) AS value,
               value->>'mode' AS mode, ordinality AS filter_order
        FROM jsonb_array_elements(p_filters) WITH ORDINALITY
    ), column_matches AS (
        SELECT r.record_id, f.field, f.filter_order, m.col, m.col_order,
               min(CASE WHEN lower(e.value) = f.value THEN m.tier ELSE m.tier + 3 END) AS tier,
               bool_or(lower(e.value) = f.value) AS is_exact
        FROM records r CROSS JOIN filters f
        JOIN field_map m ON m.entity = p_entity AND m.field = f.field
        CROSS JOIN LATERAL jsonb_array_elements_text(
            CASE WHEN jsonb_typeof(r.doc->m.col) = 'array' THEN r.doc->m.col
                 ELSE jsonb_build_array(r.doc->m.col) END) e(value)
        WHERE lower(e.value) = f.value OR (f.mode = 'contains' AND strpos(lower(e.value),f.value) > 0)
        GROUP BY r.record_id, f.field, f.filter_order, m.col, m.col_order
    ), filter_ranks AS (
        SELECT c.record_id, c.filter_order, min(c.tier) AS tier
        FROM column_matches c GROUP BY c.record_id, c.filter_order
    ), ranked AS (
        SELECT t.record_id, sum(t.tier)::integer AS score FROM filter_ranks t
        GROUP BY t.record_id HAVING count(*) = jsonb_array_length(p_filters)
    )
    SELECT r.record_id, r.score,
        jsonb_agg(jsonb_build_object('field',c.field,'column',c.col,
            'mode', CASE WHEN c.is_exact THEN 'exact' ELSE 'contains' END)
            ORDER BY c.filter_order,c.col_order)
    FROM ranked r JOIN column_matches c ON c.record_id = r.record_id
    GROUP BY r.record_id,r.score ORDER BY r.score,r.record_id LIMIT p_limit + 1;
END;
$$;
-- Functions receive PUBLIC execution by default; restrict this exact signature.
REVOKE ALL ON FUNCTION thangka.search_archive_candidates(text,jsonb,integer) FROM PUBLIC;
COMMIT;
