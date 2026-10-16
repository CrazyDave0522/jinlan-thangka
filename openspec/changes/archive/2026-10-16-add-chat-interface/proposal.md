# Change: Conversation interface

## Status

Archived change, item 1 of 8. Approved for implementation by the owner on 2026-10-16 after the final completeness review. The owner confirmed the empty landing state, centered welcome copy, persistent bottom composer with a scrolling message area, and temporarily disabled send/upload actions with an interim notice. The screenshot's example exchange is a visual reference only. Implementation and local verification are complete. Archived on 2026-10-16 at the owner's explicit request before deployment; this archive records local acceptance, not a deployed release. See [verification.md](verification.md) for test evidence and limits.

## Why

The starter page does not represent Jinlan Thangka or the conversation experience in the supplied desktop design. A coherent presentation layer is needed before message submission, uploads, retrieval, and AI generation can be added.

## What Changes

- Replace the starter home page with the branded header, conversation area, composer, and footer from `docs/design/thangka-chat-desktop.png`.
- Reuse the existing logo artwork, neutral semantic theme tokens, Geist fonts, shadcn/ui components, and Lucide icons.
- Display supplied user text/image messages and assistant answer cards, including visibly distinct database-evidence and general-knowledge sections.
- Open the home page with an empty conversation and welcome guidance. Do not ship a prefilled example conversation or an example mode; use synthetic messages only in tests and development-only visual verification.
- Present source and copy action areas as disabled placeholders until their owning requirement is implemented. Allow local text editing, while send and upload remain disabled with an explanation.
- Center welcome guidance in the empty conversation area and keep the composer visible at the bottom of the viewport while messages scroll independently.
- Provide a responsive layout, readable long content, accessible names, and an attachment-image fallback.
- Replace starter document metadata and set the document language to Simplified Chinese.

## Scope Boundaries

This change provides presentation and local text editing only. It does not send messages, fabricate responses, select/upload files, inspect sources, copy answers, persist history, query Supabase, or call DeepSeek. Follow-up changes own those behaviors:

- `add-text-conversation`: message submission, context, pending responses, and request failures.
- `add-image-upload`: selection, previews before submission, Storage integration, and upload failures.
- `add-answer-sources`: working source expansion, source navigation, and answer copying.

Message components accept supplied presentation data for later integration; synthetic messages are used only in tests and development-only visual verification. The reference screenshot does not establish product example messages, source labels, or artwork assets. No login, history sidebar, theme switcher, or new product navigation is included.

## Presentation and Copy

- Header: existing brand artwork and `演示版`.
- Assistant identity: `雪域金澜`, with a decorative Lucide bot icon.
- Answer sections: `数据库依据` and `通用知识补充`.
- Composer placeholder: `聊聊唐卡，或上传一张图片…`; accessible input name: `消息内容`.
- Composer helper: `回答会区分数据库依据与通用知识。`.
- Temporary unavailable-action notice: `当前为界面演示，发送和上传功能暂未开放。`. This is interim copy for this increment, not permanent product guidance. Update it as each action becomes available and remove it when neither action is unavailable.
- Empty state: heading `一起探索唐卡艺术`, followed by `你可以询问唐卡的题材、尊像与艺术风格，也可以上传图片进行交流。`; center the heading and introduction horizontally and vertically within the available conversation area, without suggested questions or example cards. Retain the temporary unavailable-action notice near the composer.
- Footer: current-year brand attribution and `AI 生成内容仅供参考，请结合来源核实。`.
- Page title: `雪域金澜 · 唐卡 AI 对话演示`; description: `围绕唐卡题材、尊像与艺术风格展开交流，区分数据库依据与通用知识补充。`.

## Acceptance Summary

The delta spec defines acceptance for the shell, empty landing state, supplied-message presentation, composer boundaries, accessibility, responsive layout, and image failure. Apply the project-wide responsive baseline in `openspec/project.md` and the compact mainstream browser matrix in `docs/testing.md`, with a resize sweep between sizes and relevant height/orientation spot checks. Niche dimensions and 320 CSS pixel widths do not require dedicated adaptation or mandatory acceptance tests. Compare desktop message presentation against the supplied reference while preserving readable content widths on larger screens. Exact typography and browser rendering need not match screenshot pixels, but hierarchy, alignment, spacing, and component placement must remain recognizable.

## Impact

- Affected specs: `chat-interface` (new capability).
- Expected code: `src/app/page.tsx`, `src/app/layout.tsx`, conversation components under `src/components/chat`, test-only presentation fixtures, and public brand assets.
- Tests: replace starter page expectations and add presentation/component behavior tests; verify layout and document metadata in a real browser.
- No database schema, service permissions, model selection, or new service integration.

## Dependencies

No other change is required. Inspect local Next.js guides before writing implementation code. Use synthetic fixtures only in tests and development-only visual verification for populated states. Do not import or seed fixture messages into the production home page.

## Confirmed Landing Behavior

The owner explicitly chose an empty conversation with the welcome heading and introduction above centered in the conversation area, without suggested questions or example cards. The message area scrolls independently while the composer remains visible in the bottom viewport region and the footer occupies its own space below it. Send and upload remain disabled in this increment, with the temporary notice above removed or adjusted by the changes that enable those actions. The screenshot illustrates how future messages should look; its example exchange must not become a product feature, preloaded conversation, example mode, or welcome-state image placeholder. Use synthetic text and images only for component tests and development-only visual verification of populated states.

## Deferred Detail

Message transport, history persistence, upload settings/retention, actual source contracts, model choice, and image recognition remain in their owning proposals. This change must not decide them indirectly through presentation fixtures.
