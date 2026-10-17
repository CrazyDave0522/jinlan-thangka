# Curated Reference Access Configuration

## Selected Access Method

Use a new server-only compiled module `src/lib/vision/reference-manifest.ts` exporting the exact `ReferenceConfiguration` below. Its initial value is `{version:1,grants:[]}`. A reviewed source/config change and redeploy changes grants; no public mutation endpoint, filesystem path supplied by a request, arbitrary configuration URL or new management UI is added. The module is implemented with an empty production list; guarded browser tests alias fixed synthetic grants. No collection-specific object policy or application permission grant is included.

```typescript
type ReferenceGrant = {
  imageId: Uuid;
  rowDigest: Sha256;
  bucket: string;
  objectPath: string;
  contentSha256: Sha256;
  permissionReference: string;
  aiProcessing: true;
  reviewedBy: string;
  reviewedOn: string;
};
type ReferenceConfiguration = { version: 1; grants: ReferenceGrant[] };
```

0–256 unique imageId grants; reject unknown keys, duplicate IDs or invalid entries as an invalid nonempty configuration. Empty grants is valid and means no approved image bytes. bucket matches `[a-z0-9][a-z0-9-]{0,62}`. objectPath is 1–512 ASCII characters in at most twelve slash-separated segments of 1–128 characters from letters, digits, underscore, dash and dot; no empty/dot/dot-dot segment, leading/trailing slash, percent escape, query, fragment or backslash. Extension is jpg/jpeg/png, case insensitive. reviewedBy is trimmed 1–100 characters without controls; reviewedOn is a valid YYYY-MM-DD date, not an automatic rights expiry. permissionReference is a trimmed 1–500-code-point nonblank string and must equal the image row's nonblank license_or_permission_reference. aiProcessing must be literal true; deleting a grant revokes it for future attempts.

rowDigest is SHA-256 of the complete validated current image row's deterministic sorted-key JSON, using the accepted catalogue stable serialization: preserve nulls, arrays, number values and timestamp strings, without Unicode/date normalization. Include image/artwork IDs, locators, rights, permission notes, review state and timestamps. The grant's bucket/path is an operator-reviewed mapping for that row; never dereference storage_locator as an arbitrary URL. A row change makes the grant stale until reviewed again. contentSha256 pins the exact downloaded original bytes. If the row has a nonnull sha256, it must equal the grant's contentSha256 before a read.

A rights enum, public URL or verified review flag alone is never an AI-processing grant. The human reviewer checks the actual license/permission scope and attribution obligations before adding the entry. Metadata from ungranted rows remains eligible. This module is an access decision for curated evidence, not stored visitor data or a substitute for Supabase read permissions.

## Storage Client and Network Boundary

Use a separate stateless Supabase client with the existing validated NEXT_PUBLIC_SUPABASE_URL and publishable/legacy-anon key, persistSession=false, autoRefreshToken=false, detectSessionInUrl=false, with database retries disabled as in the existing reader. The Storage wrapper permits one download invocation per selected grant and no retry loop. Reuse the archive reader's anon-key validation; do not introduce a service-role/secret key, visitor session or signed-URL flow. Download with the installed SDK's `storage.from(bucket).download(objectPath, {}, {signal,cache:"no-store"})`, without transformations, query parameters or version/signing/listing APIs. SDK credential handling is reused rather than hand-building bearer headers.

The SDK download path was checked in local `@supabase/storage-js` and the [official download API](https://supabase.com/docs/reference/javascript/file-buckets-download). Its custom fetch wrapper accepts only GET to the configured project's exact `/storage/v1/object/{bucket}/{objectPath}` URL with no query/hash, for a selected reviewed grant. Use HTTPS and reject userinfo/custom origins; only deterministic browser-test fixtures may use the configured loopback/synthetic project. The wrapper applies redirect:error, shared abort/no-store and streamed byte limits before the SDK can materialize a Blob; returning a bounded response to the SDK does not remove these limits. It never forwards credentials to a model-provided address. No HEAD/list/sign/refresh call or automatic retry is permitted.

The [official Storage access guidance](https://supabase.com/docs/guides/storage/serving/downloads) distinguishes public objects and authenticated access. This design chooses SDK downloads with the existing anon context for both; required object SELECT access must be verified for the actual configured bucket. Do not assume a public URL or a metadata-table grant proves object access, change a bucket to public, or broaden anon policy automatically. Missing live bucket/assets/access prevents real reference acceptance, not deterministic fixture development. If this chosen access cannot read a real approved asset, report the setup gap; do not escalate credentials as a fallback.

## Selection, Budgets and Preparation

Resolve grants only for image rows belonging to freshly retrieved candidates. Check rowDigest, content-hash compatibility and permissionReference before fetch. Missing entry, stale row/permission version or no permitted path is a pre-read limitation: mark references_missing/reference_not_authorized, perform no download for it, preserve the candidate, and do not assert definitive reference identity.

The [identity task allocation](identification.md) permits at most four comparison tasks/four distinct downloads and at most two distinct references per artwork. The stage starts before the first reference operation and has at most five seconds, bounded again by the shared 55-second POST deadline. No selection or fetch occurs for a summary-only new identity: return the reread clarification first.

For each download: check any declared length, count the actual stream, stop above 5,000,000 bytes; cumulative originals are at most 20,000,000 bytes. Hash the bytes and require contentSha256, verify actual static JPEG/PNG, at most 16,000,000 pixels/8192 pixels per side, and reject MIME/signature disagreement/animation/corruption. Sequentially prepare using the accepted bounded 1600/1280 dimension, JPEG 0.85/0.75/0.65 or PNG-transparency policy, no upscaling or unbounded quality reduction. Each prepared reference is at most 500,000 bytes and 1600 longest side.

Release original/decoded buffers after each preparation and all prepared buffers after settlement; caller abort/stage expiry cannot dispatch a late verification call. No persistent files, derived-asset cache, visitor bucket or log of images/paths/credentials. References do not enter the visitor composer or twenty-attachment accounting. Only stable reference image/work IDs and content digests appear as result metadata; reference bytes and grant reviewer details never enter browser history.

## Failure Matrix

| Condition | Handling |
| --- | --- |
| Empty configuration or no matching grant | normal evidence limitation, no download |
| Fresh row differs from grant, including permissionReference or row sha256 | normal stale/denied evidence limitation, no download |
| Nonempty configuration is malformed and reference route is required | reference_unavailable, no reference download/second model call |
| HTTP 401/403/404 or other nontransient 4xx after an authorized attempt | reference_unavailable, nonretryable |
| Actual length/pixels/type/hash/preparation violates bounds | reference_unavailable, nonretryable |
| Network error, HTTP 429 or 5xx | reference_failed, eligible manual final-turn retry only |
| Reference stage/shared deadline | generation_timeout, abort reads/preparation and suppress late success |
| Caller cancellation | abort, no assistant publication |

An attempted-read failure stops the entire attempt and publishes no partial group answer. Pre-read limitations can produce ordinary observations/candidates, and do not affect an independent readable-identifier route that requires no reference access. Decide passing identifier gates before selecting references. Every manual retry performs fresh archive and grant checks; no old signed URL, downloaded bytes or identity result becomes authority.

## Activation and Review Record

Fixture tests supply explicit synthetic configuration and fake Storage bytes; they never import owner grants or local secrets. Real activation needs the owner/domain reviewer to provide permitted curated assets/record links, confirm the license scope, produce content/row digests and verify the configured anon download. No remote setup, grants, bucket upload or paid call is authorized by preparing this proposal. Existing no-login demo scope remains unchanged.

On 2026-10-17 the owner withdrew the previous dataset, removed its Storage pictures and deferred curated-data work. The production manifest remains empty; the data-specific setup artifact and evaluation snapshots are removed from the repository. After explicit owner confirmation, the remote transaction removed the discarded business rows and collection-specific object policy; committed readback confirmed eight empty business tables with the schema and retrieval setup retained. Keep the generic reader and fixture coverage intact. Future activation requires newly reviewed assets, current record/content/permission bindings and actual configured object access; previous dataset approvals do not supply those bindings.
