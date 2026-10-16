# Conversation Interface Verification

## Outcome

Implemented locally on `feat/add-chat-interface` after the owner's approval on 2026-10-16. Archived on 2026-10-16 at the owner's explicit request after local acceptance. No deployment or Git commit/push was performed. Archival before deployment is an owner-authorized exception for this change; integrated deployment remains in `add-demo-release`. The production home page opens with empty welcome guidance and never imports synthetic conversation fixtures.

## Automated Checks

- `npm run check`: lint, TypeScript, and 14 Vitest tests pass across four files.
- `npm run test:e2e`: 11 Chromium browser tests pass. The test command also runs `npm run build` and starts the resulting production Next.js application before checking it.
- `openspec validate --all --strict --no-interactive`: all eight changes pass.
- `git diff --check`: passes.

Browser coverage includes 360 × 800, 390 × 844, 414 × 896, 1280 × 720, 1366 × 768, 1536 × 864, 1920 × 1080, and 2560 × 1440 CSS pixels. Resize checks cover 375, 384, 393, 412, 430, 638, 639, 640, 641, 768, 1024, 1440, and 1707 pixel widths. A reduced-height landscape check covers 844 × 390.

The real Next.js page is verified for empty initial/reload state, centered welcome content, branding, document language/title, local multiline draft editing, disabled upload/send controls, keyboard focus indicators, browser errors, no horizontal overflow, and an unobscured bottom composer/footer. Tests explicitly disable Supabase configuration and make no paid AI calls.

The isolated Vite component harness supplies synthetic text/images to verify ordered message presentation, optional evidence/general-knowledge sections, long unbroken content, independently scrolling messages, stable composer position while scrolling, disabled source/copy controls, and image-load failure. Native images replace `next/image` in this harness; the real Next.js page separately validates its brand image. Unit tests also cover missing optional content and replacement of a previously failed attachment.

## Visual Inspection

Reviewed generated Chromium screenshots of the empty page at mobile and desktop widths, and the supplied-message components at 1486 × 1060 and 390 × 844. The desktop message hierarchy, right-aligned user bubble, assistant identity/card, evidence sections, composer width, logo placement, and footer follow the reference. The synthetic image is deliberately not the reference artwork; it exists only in test tooling. Screenshots and failure traces are stored in ignored `test-results/`.

Mobile footer paragraphs now stack and center, including wrapped text; desktop retains the left/right arrangement. Browser regression assertions verify each mobile footer paragraph's horizontal center and text alignment. After this adjustment, `npm run check` (14 tests), production build, all 10 Chromium tests, and the change's strict OpenSpec validation passed again. The refreshed mobile screenshot was visually inspected.

Browser inspection caught incorrect CSS Module mapping under the existing Turbopack loader. Prefixed global conversation styles resolved it without modifying shared tokens, default components, or framework loader configuration. Layout assertions now check welcome alignment and bottom anchoring as well as visibility and overlap.

## Limits and Follow-up Ownership

- Verified in desktop Chromium with viewport emulation, not physical phones. Native virtual keyboards, physical touch behavior, and device safe areas were not verified on real devices. No cross-browser Safari/Firefox certification is claimed.
- The public homepage has no submitted messages yet. Supplied-message checks exercise isolated components rather than a complete Next.js submission/upload lifecycle; those flows need real-page browser tests in later requirements.
- Text submission/context belongs to `add-text-conversation`; image selection/upload belongs to `add-image-upload`. Both must update the temporary unavailable-action notice as their controls become operational and remove it once neither action remains unavailable.
- Source expansion and clipboard behavior belong to `add-answer-sources`; retrieval, AI generation, and image identification remain unimplemented.
- No measured audience coverage percentage is claimed. Verification uses the agreed compact mainstream baseline, without dedicated niche-size adaptations.

## Shared Style Scale Verification

Common conversation padding/gaps now use `--spacing`; footer font size uses `--text-xs` and its line height uses five spacing units. The mobile media query resolves `--breakpoint-sm` from the referenced global theme. Logo sizing/cropping, the content-width cap, bubble percentages, focus stroke, and the short-height threshold remain intentional component layout parameters. Shared UI components and `globals.css` are unchanged by this normalization.

A browser regression test changes `--spacing` and `--text-xs` in an isolated page and verifies that welcome/composer padding, footer padding/gaps, and footer typography follow the new values while the layout remains usable. After normalization, `npm run check` passes all 14 unit/component tests, `npm run test:e2e` passes all 11 Chromium tests and its production build, and the strict OpenSpec validation passes.
