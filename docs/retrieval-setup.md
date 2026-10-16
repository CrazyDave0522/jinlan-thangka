# Archive Retrieval Setup and Read-Only Verification

## Status

Setup guide for `add-thangka-retrieval`. Local implementation and isolated SQL tests exist; the owner has reported successful execution of the incremental search-function SQL (including PUBLIC execution revocation). The owner also reported successful execution of the table read grants/RLS SELECT policies and exact function execution script. The owner confirmed Data API exposure/row-limit configuration, and the repeated anon smoke check returned HTTP 200 for all eight tables and the RPC. The initial HTTP 406 / `PGRST106` exposure error is resolved. The owner supplied matching final table grants/RLS SELECT policies and RPC signature/result/security/execution metadata. Manual comparisons and live CLI generation/comparison now pass. The generated SDK types are tracked in `src/lib/retrieval/database.generated.ts`. Index/default/trigger inspection is not established by these results. Current business tables are empty, which is valid; do not import artificial artworks into the owner's database.

The owner permits all current dedicated archive contents for retrieval. The proposed application reader uses the existing public Supabase URL/publishable key as `anon`, without user cookies or an elevated service key. Application code remains server-only; the corresponding scoped database SELECT/RPC access is intentionally accessible through the Data API and is not made private by the server-only import.

## Existing Schema Information

The complete supplied table definitions are already available in [schema.sql](../database/schema.sql), with explanatory conventions in [database.md](database.md). They are sufficient to plan and implement the retrieval field mappings; no additional table-structure submission is currently needed. The checks below verify deployment agreement and effective access. They do not represent unanswered questions about the documented fields. If a mismatch is actually observed, identify its table/column and expected versus observed definition before requesting clarification.

## Verification Order

1. Inspect the deployed `thangka` schema and compare all eight tables, columns/types/nullability, enum-like checks, foreign keys and primary keys against `database/schema.sql`. Do not rerun that initializer. In particular, `artwork_artists` has a composite primary key and the source-link tables have UUID IDs.
2. Inspect actual schema usage, table grants, RLS enablement and existing policies for the intended `anon` reader, including inherited/public privileges. Confirm that read access covers all records and that no unintended writes are enabled. A SQL Editor administrator seeing rows does not prove what anon can see.
3. Check project Data API settings for `thangka` exposure and a maximum row limit of at least 201 (the largest stage budget plus one probe). This dashboard configuration is separate from SQL grants. Do not broaden access to other schemas.
4. Review [the incremental SQL artifacts and rollback notes](../database/migrations/README.md) before executing them, in search-function then read-access order. The planned search function is `STABLE SECURITY INVOKER`, uses fully qualified fixed table expressions and bounded validated parameters, and grants execution only for its exact signature as needed. Do not copy blanket `GRANT ALL` routine/sequence examples.
5. Apply only the reviewed scoped changes if missing. Existing conflicting policies/grants require an explicit reconciliation plan; do not silently drop them. Keep database administration/import rights separate from the anonymous application reader.
6. Generate types including `thangka` from the actual project and compare them with the reference schema. Confirm the RPC signature/types after its installation. Provisional types derived from the reference must be labelled as such until live verification.
7. Run a read-only smoke check through the actual reader credentials/environment across the projected eight-table reads and the structured candidate function. Confirm successful no-match handling on empty data and explicit errors for missing configuration/schema/access. Do not treat empty tables alone as proof of unrestricted row visibility.
8. Record the environment/date, inspected metadata, applied artifact versions, generated-type comparison, smoke results, and any outstanding gate in the requirement's verification record. No secrets should appear in logs, docs or chat.

## Safe Metadata Inspection Examples

These examples read configuration only and are not executed by this guide. They require an appropriate dashboard/admin inspection context; do not expose an admin database connection in the application.

```sql
SELECT table_name, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns
WHERE table_schema = 'thangka'
ORDER BY table_name, ordinal_position;

SELECT c.relname AS table_name, c.relrowsecurity, c.relforcerowsecurity,
       has_table_privilege('anon', c.oid, 'SELECT') AS anon_select,
       has_table_privilege('anon', c.oid, 'INSERT') AS anon_insert,
       has_table_privilege('anon', c.oid, 'UPDATE') AS anon_update,
       has_table_privilege('anon', c.oid, 'DELETE') AS anon_delete
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'thangka' AND c.relkind IN ('r', 'p')
ORDER BY c.relname;

SELECT schemaname, tablename, policyname, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'thangka'
ORDER BY tablename, policyname;

SELECT conrelid::regclass AS table_name, conname, contype,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE connamespace = 'thangka'::regnamespace
ORDER BY conrelid::regclass::text, conname;
```

Also inspect schema USAGE and the exact search function's owner, signature, security-invoker setting, configuration and EXECUTE grant once created. Absence of an anon write grant is useful evidence, but inspect RLS and inherited permissions together. An owner/privileged connection can bypass policies; testing only as that connection is insufficient.

## Type Generation and Environment

Keep the existing `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in ignored local environment settings and Vercel environment configuration. These public identifiers are not privileged database access tokens. No service-role key is proposed. CLI/admin authorization used for inspection/type generation is separate and must never be committed or passed to browser code.

The first CLI 2.121.0 attempt returned `AccessTokenRequiredError`. The owner subsequently completed local login and generation/comparison succeeded. For future regeneration, sign in locally if required:

```bash
npx --yes supabase@2.121.0 login
```

Complete the browser/terminal authentication privately; do not paste access tokens, verification codes or passwords into chat. Existing app publishable/anon keys do not authenticate the CLI management API. No `supabase init`, new bucket, dataset or database permission change is needed just to resolve this login failure. A generation failure must not overwrite the existing types with error output.

After configuring local CLI authentication through the supported Supabase flow, generate types with the project's nonsecret reference supplied in `SUPABASE_PROJECT_REF`:

```bash
npx --yes supabase@2.121.0 gen types --lang typescript --project-id "$SUPABASE_PROJECT_REF" --schema thangka
```

Inspect the output before saving it as the implementation's database types; do not accidentally overwrite an established file with a failed command's output. The reference is project metadata, not a password. Types generated against an empty database still describe its real structure. The SDK uses [live-generated types](../src/lib/retrieval/database.generated.ts). [Runtime descriptors/domain types](../src/lib/retrieval/database.ts) preserve strict validation and CHECK-state narrowing; compile-time tests compare their raw field shapes with the generated snapshot, and SQL tests compare the descriptors with the original DDL. No automatic recurring generation or CI workflow is introduced here.

## Read-Only Smoke Command and Current Action

With Node 24 and the existing local public settings:

```bash
node --env-file=.env.local scripts/verify-archive.mjs
```

This selects the explicit documented columns with `limit=0` for every table and invokes the read-only search function with a synthetic nonmatching term. It logs only status/safe error codes, not credentials or records. It deliberately does not import data, alter permissions or invoke administration APIs. A successful table response checks column names/access, not deployed column types, foreign keys or RLS completeness.

The initial `PGRST106` meant the requested schema is absent from PostgREST's exposed-schema configuration, as defined by [PostgREST's error reference](https://docs.postgrest.org/en/stable/references/errors.html). First inspect metadata and apply only the reviewed incremental function/read-access setup in the order above. Then, in Supabase's Data API/API settings, add `thangka` to **Exposed schemas**, preserving existing required schemas, and rerun the command. The public app key cannot administer these settings or inspect all privileged metadata. The owner has now completed the setup and the repeated smoke command succeeds. No new table definitions or project data are requested from the owner.

## Acceptance Limits

Missing table/schema/function/grants and explicit query errors must not become fake no-match data. RLS can return no rows without raising an error, so metadata/policy verification is essential. SQL function behavior must also be tested with synthetic fixtures in an isolated disposable environment; do not certify it based solely on mocked SDK calls.

Local/mocked tests can progress before remote setup, but the report must clearly identify unperformed SQL/live checks. Do not mark real archive integration verified until its actual schema/function/access checks have run. Curated artwork buckets, image display rights, AI generation and model/image matching belong to later integration.

## References

- [Supabase custom schemas](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Supabase API key and RLS semantics](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase type generation](https://supabase.com/docs/guides/api/rest/generating-types)
