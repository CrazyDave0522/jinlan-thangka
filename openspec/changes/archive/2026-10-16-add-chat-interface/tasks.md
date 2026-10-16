## 1. Review Before Implementation

- [x] 1.1 Review the refined scope, copy, delta spec, and technical design with the owner; retain the confirmed centered welcome copy, persistent bottom composer with independently scrolling messages, and temporarily disabled actions with an interim notice, without a product example conversation.
- [x] 1.2 Record approval before starting feature implementation; validate the approved proposal with `openspec validate add-chat-interface --strict`.

## 2. Page and Presentation

- [x] 2.1 Read the relevant installed Next.js guides; reuse existing shadcn/ui components, theme tokens, fonts, and supplied brand assets.
- [x] 2.2 Replace the starter page with the branded header, centered conversation shell with an independently scrolling message area, persistently visible bottom composer, and separate footer; update document language and metadata.
- [x] 2.3 Implement supplied user text/image messages and assistant cards with distinct evidence/general-knowledge sections, optional sections, and disabled source/copy placeholders.
- [x] 2.4 Implement the confirmed welcome heading and introduction centered in the empty conversation area as the home-page default, without suggested questions or example cards; keep synthetic populated-message fixtures in tests or development-only verification tooling without importing them into the production page or exposing an example mode.
- [x] 2.5 Add the locally editable textarea and disabled send/upload actions with the temporary unavailability notice near the composer; record its update/removal responsibility for the changes enabling those actions and prevent submission side effects.
- [x] 2.6 Handle narrow layouts, long content, proportional images, and failed-image fallback using synthetic image assets for verification; do not add an example artwork placeholder to the home page.

## 3. Verify and Report

- [x] 3.1 Replace starter-page test expectations and cover shell content, speaker/message order, evidence/general-knowledge separation, missing optional sections, empty content, absence of prefilled messages/sources/attachment placeholders on initial load, and image failure.
- [x] 3.2 Test textarea editing and Enter behavior, accessible action names, and disabled actions without external calls or added messages.
- [x] 3.3 Run `npm run check` and `npm run build`; fix failures and report any checks that cannot run.
- [x] 3.4 Inspect the production empty state and development-only populated component states against the reference and across the compact mainstream browser matrix in `docs/testing.md`; verify intermediate widths and breakpoint transitions, readable large-desktop content widths, long conversations with independently scrolling messages and a persistently visible, unobscured composer, relevant height/orientation spot checks and mobile keyboard behavior where available, long tokens, focus visibility, image fallback, document language, and page metadata.
- [x] 3.5 Report acceptance results, tested viewport sizes and browsers, unverified real-device behaviors, known limitations, and which later requirements enable each unavailable action; leave incomplete tasks unchecked.

Verification evidence and unverified real-device behaviors are recorded in [verification.md](verification.md). This change is implemented and verified locally, and archived on 2026-10-16 at the owner's explicit request before deployment. Deployment has not occurred.
