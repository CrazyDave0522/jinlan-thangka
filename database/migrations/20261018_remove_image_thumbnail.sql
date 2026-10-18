-- Remove the unused thumbnail field after deploying the compatible reader.
-- The owner authorized removal while the development archive is empty.
-- No initializer rerun, CASCADE, business-row deletion or grant changes.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
LOCK TABLE thangka.images IN ACCESS EXCLUSIVE MODE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'thangka' AND table_name = 'images'
          AND column_name = 'thumbnail_locator' AND udt_name = 'text'
          AND is_nullable = 'YES'
    ) THEN
        RAISE EXCEPTION 'Expected the original nullable text thumbnail column; inspect schema before applying';
    END IF;
    IF EXISTS (SELECT 1 FROM thangka.images) THEN
        RAISE EXCEPTION 'Thumbnail removal requires an empty images table; reconcile existing records first';
    END IF;
END;
$$;

ALTER TABLE thangka.images DROP COLUMN thumbnail_locator RESTRICT;
NOTIFY pgrst, 'reload schema';
COMMIT;
