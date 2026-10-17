# Knowledge-Base Images and Visitor Input

## Agreed Boundary

Visitor pictures are temporary conversation input. Curated artwork images belong to the archive in Supabase Storage. The owner approved image-interpretation implementation on 2026-10-17; no visitor bucket, remote resource or real archive record was created.

| Category | Application lifetime | Association |
| --- | --- | --- |
| Visitor-selected pictures | Current page memory and transient processing | Stable page-local attachment identities, messages and observations |
| Curated reference pictures | Existing project Storage; bounded transient server reads | Actual archive image/work rows and separately reviewed AI-processing grants |

Visitor data is not intentionally written to Storage, database rows, persistent browser storage, server files or shared caches. Reload clears conversation, pictures and drafts; the app does not replay requests. This does not promise physical memory erasure or provider deletion. Selected pictures are sent to DeepSeek only when generation/vision are explicitly enabled.

## Archive Data Status

On 2026-10-17 the owner withdrew the previous archive dataset because its quality was inadequate, deleted the Storage pictures, and deferred real-data preparation until after the image-interpretation feature. Dataset-specific import files, object policies, evaluation snapshots and setup instructions are no longer part of the implementation. After explicit owner confirmation, a transaction removed 138 business rows and the collection-specific Storage policy. Committed readback found all eight business tables empty, with all eight tables, the retrieval function and eight general archive SELECT policies retained. The configured stateless anon client also read all eight tables as empty and successfully queried the existing search function with no candidates.

Feature development uses explicit synthetic fixtures and must support an empty configured archive without fabricated records or artwork identities. Keep the schema, retrieval function and general read-access setup. The production reference manifest remains empty. Future curated assets require fresh reviewed row/content/permission bindings and actual object-access verification; previous dataset-specific access must not be reused.

## Visitor Selection and Retention

| Boundary | Limit |
| --- | --- |
| New attachments per message | 4 JPEG/JPG or PNG pictures |
| Active visitor pictures per attempt | 4 distinct identities, new plus explicitly selected history |
| Retained prepared attachments per page | 20 distinct identities, including drafts, completed/failed previews and retry snapshots |
| Original image | 5,000,000 bytes, 16,000,000 pixels, 8,192 pixels per side |
| Prepared image | 500,000 bytes, longest side 1,600 pixels |
| Complete incoming JSON | 4,000,000 UTF-8 bytes, including selected base64 and all bounded metadata/text |
| Retained prepared-blob guard | 32,000,000 bytes, shared blobs counted once |

Units are decimal. The twenty-picture count normally binds before the older prepared-byte guard; decoded browser/GPU memory is separate. Reusing an existing attachment consumes no extra slot. Selecting the same file as a new attachment creates another identity. New batches that exceed a limit fail atomically; existing state remains available. Full-clear warnings explain that deliberate refresh clears all conversation, images and drafts. The app never refreshes or evicts history automatically.

Worker preprocessing tries 1600/1280 dimension bounds without upscaling. JPEG uses 0.85/0.75/0.65 quality attempts; PNG remains PNG with transparency. Unsupported, animated, corrupt or still-oversized images are rejected instead of further silent degradation. Orientation and useful comparison detail are preserved within those bounds; real-model detail quality remains to be evaluated. Original files/bitmaps are released after preparation.

## Selected Transport and Observation Versions

The [version-2 protocol](../openspec/changes/archive/2026-10-17-add-image-interpretation/contracts.md) separates historical descriptors from actual selected inputs. Selected bytes are canonical base64, independently decoded/type/dimension/hash checked by the server. Blob URLs are previews only. Stable display indices are assigned on first submission and retain gaps after failures; they do not identify database rows.

Ordinary follow-ups carry completed text, descriptors and bounded observations, with no historical picture bytes by default. Visitors explicitly select a completed picture using “用于本次提问”; removable chips share the original blob. Optional same-work hints organize selected views without proving physical identity. The active set still fits four pictures.

New visual detail produces a short clarification and, when targets are unambiguous, “重看图片并回答”. The explicit click creates a new attempt from the source question/context through its clarification, excluding unrelated later turns and preserving a newer composer draft/images. It is not a hidden third provider call. A successful full attempt atomically replaces current observation versions; failures, cancellation and late replies leave old versions and displayed answers intact. Earlier summaries remain untrusted and preserve tentative/unreadable details.

Metadata/observation bytes plus exact base64 expansion are checked before encoding and again after serialization. The single-attempt lock and 65-second client deadline cover encoding. Transient final-turn retry captures the original visitor selection; new archive/reference evidence is fetched afresh. Current-selection errors preserve the draft; retained/history-only overflow explains deliberate full-clear refresh.

## Curated Reference Reads

Archive metadata eligibility is separate from byte permission. The production manifest at src/lib/vision/reference-manifest.ts starts empty. Each real entry needs human-reviewed AI-processing permission, an exact permission reference, full current-row digest, original-byte SHA-256 and a reviewed bucket/object mapping. A row or permission change makes the grant stale. Public URLs, rights enums and model statements never grant access.

The bounded stateless SDK reader uses the existing configured project URL and anon/publishable key. The chosen object must actually be readable with that context; the reader uses no signing, service-role/secret fallback, automatic policy broadening, arbitrary remote URL or redirect. Locator metadata is not dereferenced as a fetch instruction. No collection-specific object access is configured by the feature. An empty grant list prevents reference downloads without disabling ordinary image observations or metadata retrieval.

At most four comparison tasks use at most four distinct references, two per artwork, under one five-second reference stage. Originals are at most 5,000,000 bytes each/20,000,000 cumulatively, 16,000,000 pixels and 8,192 side; prepared references are at most 500,000 bytes/1,600 side. Stream limits apply before SDK Blob materialization. Bytes/derived copies are transient, never displayed as curated assets or inserted into visitor retention. Public results retain only permitted bounded IDs, hashes and comparison/source provenance, with no bucket paths or grant reviewer details.

Missing/stale/denied grants limit reference-dependent evidence. An attempted authorized download/preparation failure stops the whole response; transient reference_failed alone adds eligible manual retry. An independently sufficient collection/accession route needs no reference read. Detailed shape, access and failure rules are in [reference access](../openspec/changes/archive/2026-10-17-add-image-interpretation/reference-access.md).

## Verification and Deferred Data Work

Synthetic fixtures and real-route Chromium tests cover selection, counts, bytes, reread continuity, observations, both identification gates and scoped fake Storage traffic; see [verification](../openspec/changes/archive/2026-10-17-add-image-interpretation/verification.md). The owner deferred curated-data preparation and domain acceptance. Keep those future checks separate from the current feature checklist. The archived runtime review records actual corrections and final empty-archive rechecks of the earlier model-contract, named-retrieval and semantic failures; dataset removal itself did not pass those cases. Real-data/domain and deployment checks remain deferred or unverified.
