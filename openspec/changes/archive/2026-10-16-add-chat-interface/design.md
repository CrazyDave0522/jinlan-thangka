## Context

The existing home page is starter content. The reference is a desktop screenshot with a populated conversation; it does not define empty-state, responsive, or unavailable-action behavior. This design resolves those presentation gaps for review without establishing service contracts.

## Goals / Non-Goals

- Goals: reproduce the reference's visual hierarchy; support supplied messages and empty content; preserve UI conventions; make the presentation increment honest and testable.
- Non-goals: conversation requests, uploads, AI generation, database access, working citation/copy actions, saved conversations, and new global state libraries.

## Decisions

### Page composition

Use prefixed global conversation styles alongside shared Tailwind utilities. Common padding and gaps use the shared `--spacing` scale; footer typography uses `--text-xs` and the `leading-5` spacing equivalent. Reference the global theme to resolve the mobile media query from `--breakpoint-sm`, matching JSX `sm` variants. Keep the logo dimensions/crop, conversation maximum width, percentage bubble widths, short-height threshold, and focus stroke as component-specific layout parameters; do not introduce global tokens for them. Browser verification found that the configured `*.css` Turbopack loader emits the proposed CSS Module without its class mappings; global component prefixes avoid changing shared loader behavior.

Keep `/` as the entry point. Use a small conversation presentation component with an ordered message collection, a branded header, a composer, and a footer. Keep synthetic fixtures in tests or development-only verification tooling; the production page passes an empty message collection and must not import fixtures. Later service-backed messages can use the same presentation components. Do not build a general chat framework or a speculative AI/database response schema.

Use a Server Component page and static shell where possible. Isolate browser behavior, such as image-load fallback, to the smallest practical Client Component. Read the installed Next.js documentation again when implementing relevant APIs.

### Desktop and narrow layouts

Apply the project-wide responsive baseline in `openspec/project.md` and verification matrix in `docs/testing.md`. Use fluid sizing and content-driven breakpoints throughout the mobile, intermediate, and desktop ranges. Use a full-height flex column with a centered conversation column of approximately 920 CSS pixels at the desktop reference width, capped for readability on large desktops and reduced to the available width on smaller screens. Align user bubbles to the right and assistant cards to the left with a small avatar/identity area. Preserve comfortable outer gutters, a muted user surface, outlined assistant card, source/action dividers, and an outlined composer.

Use a viewport-height flex or grid shell, accounting for the dynamic viewport on mobile. Reserve separate space for the header, composer, and footer; the message area fills the remaining height and scrolls independently. Keep the composer persistently visible in the bottom viewport region, immediately above the footer, without placing an overlay over messages. Use appropriate minimum-height and overflow constraints so long conversations do not push the composer below the viewport. Preserve access to the composer on short viewports and when the mobile keyboard opens. At narrow widths, reduce gutters and avatar spacing, allow bubbles/cards to use available width, stack and center footer paragraphs (including wrapped text) on mobile, retain the desktop left/right footer layout, and contain images and long tokens. Preserve image aspect ratios without stretching. Use existing theme tokens rather than sampling custom colors from the screenshot.

### Empty landing and supplied-message verification

The owner confirmed that the production home page opens with an empty message collection. Center `一起探索唐卡艺术` and `你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。` horizontally and vertically in the available conversation area, allowing wrapping on narrow screens. Do not add suggested questions or example cards. Do not preload the screenshot exchange, show example answers/sources, add an example mode, or introduce an example image placeholder.

Use the supplied standalone logo files. The screenshot is a visual reference for future messages, not an independent artwork asset or content seed. Verify populated message components using synthetic text and images only in tests and development-only tooling, without a public preview route or query parameter. A supplied image that fails to load must show a readable fallback without removing its accompanying text.

### Composer and answer actions

Reuse Textarea and Button defaults. The textarea supports local editing; it does not submit or create messages. Send and upload buttons are disabled, named `发送消息` and `上传图片`, and described by the visible unavailable-action notice. Enter must not trigger a request or clear text. No file input or service client is needed in this increment. The notice `当前为界面演示，发送和上传功能暂未开放。` is temporary acceptance-stage copy placed near the composer. The changes enabling text submission and image upload must update it to describe only remaining unavailable actions, then remove it entirely once both actions are available. Preserve the permanent evidence/general-knowledge helper copy.

Render source and copy controls as disabled placeholders with accessible names and a visible indication that source inspection and copying are not yet available. Do not add a chevron that implies an operable disclosure without indicating that state. Real source expansion and clipboard behavior remain in `add-answer-sources`.

### Semantics and metadata

Use header/main/footer landmarks, an accessible page heading, a labeled message collection, identifiable speaker labels, and meaningful Chinese alt text for nondecorative images. Hide decorative icons from assistive technology. Set `lang="zh-CN"`, brand metadata, and preserve Geist. English brand lettering in the existing artwork is intentional.

### Verification

Use React Testing Library for visible landmarks/copy, empty and populated message collections, speaker order, optional sections, absence of prefilled content, textarea editing, disabled actions, and image-error fallback. Avoid snapshots that repeat markup or tests tied to private class names.

Use a real browser to inspect the production empty landing state, and use development-only test data to compare message presentation against the desktop reference and inspect a long conversation, long unbroken content, and image failure across the compact mainstream viewport matrix in `docs/testing.md`. Use relevant intermediate-width and height/orientation spot checks; do not add mandatory 320 CSS pixel, niche aspect-ratio, or uncommon-device adaptations. Resize between representative sizes and around breakpoints; do not validate only the reference width. Document metadata and viewport layout require browser verification. Check that scrolling a long message collection changes the message-area scroll position while the composer remains visible, the last message is unobscured, and the footer does not overlap controls. Check short viewports and mobile keyboard behavior where the browser environment supports it. Add automated browser coverage if implementation introduces lifecycle behavior beyond this presentation scope. Run `npm run check` and a production build after implementation.

## Risks / Trade-offs

- Test fixtures could accidentally become product content: keep them out of the production page and verify that initial load contains no prefilled messages, answers, sources, or attachment placeholders.
- Unavailable controls can confuse visitors: provide visible Chinese explanations and native disabled behavior.
- An exact screenshot match could undermine shared UI conventions: preserve hierarchy and positioning while retaining the neutral theme and default component variants.
- The screenshot contains an artwork without a standalone source asset: use synthetic images for component verification; the empty landing page needs no artwork asset.

## Migration Plan

No database migration or external-service setup is needed. Replace starter content only after approval. Later changes supply real conversation messages and enable their own controls. Do not promote this capability to `openspec/specs` until the normal completion/archive workflow.
