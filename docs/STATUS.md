# ANCHOR Project Status

Last updated: 2026-08-22

## Current Phase

Phase 1: Seeded Winning Flow

## Completed

- Product scope narrowed to one room and one six-question lesson.
- Two cognitive activities added to the lesson composition.
- Generated family guide added with explicit consent and approval.
- Live Gemini image generation added with a deterministic fallback.
- One controlled live video-generation moment added with a static fallback.
- Speech recognition classified as an optional constrained feature.
- Product, architecture, AI contract, safety, testing, demo, and environment documents created.
- `.env.example`, `.env.local`, and repository ignore rules created.
- Final hackathon plan revised around the six primary failure modes.
- The verified room-to-cue interaction established as the headline feature.
- A visible grounding ledger added to make Gemma's role auditable.
- The generated guide changed to a lightly stylized supporting element with a neutral fallback.
- Image prefetch, asynchronous video generation, stage time budgets, and feature-freeze rules defined.
- Phase 0 application scaffold completed with Next.js 16, strict TypeScript, Tailwind CSS, Zod, Vitest, and Playwright.
- Server-only environment validation added with a credential-free fixture mode.
- Synthetic bedroom, trusted-person, grounding, and six-question fixtures added.
- All planned caregiver and patient route shells implemented with responsive, accessible layouts.
- Patient tablet shell verified with large touch targets, persistent guide labeling, and no viewport scrolling.

## Next Actions

1. Implement the validated domain types and deterministic cue state machine.
2. Add fake AI and local storage adapters.
3. Make the caregiver approval path interactive and persistent.
4. Implement the complete six-question patient session with speech synthesis and help controls.
5. Add the primary and all-media-disabled end-to-end scenarios.
6. Add a valid Google AI Studio key only when the offline Phase 1 flow passes.

## Open Risks

- The Gemini Omni Flash preview requires paid-tier access and may not be available to the chosen API key.
- Generated image preservation must be validated before patient display.
- Real-time media latency may exceed the pace of a live presentation.
- Browser speech-recognition support varies and must remain optional.
- Local filesystem persistence will need replacement if the demo is deployed to an ephemeral host.
- The avatar may reduce trust if its styling or labeling feels like impersonation.
- Excessive caregiver setup could crowd out the patient magic moment during judging.
- Medical-effectiveness language could undermine credibility despite a polished demo.
- The newest Vite major currently requests an unpublished transitive dependency, so the test toolchain is pinned to the stable Vite 7 line.

## Blockers

- A real `GEMINI_API_KEY` is required before live provider calls can be verified.

## Verification Log

- Documentation and environment files created on 2026-08-16.
- Final weakness-driven plan revision completed on 2026-08-18.
- `pnpm lint` passed on 2026-08-22.
- `pnpm typecheck` passed on 2026-08-22.
- `pnpm test` passed 4 tests across 2 files on 2026-08-22.
- `pnpm test:e2e` passed 2 tablet Chromium scenarios, including accessibility and touch-target checks, on 2026-08-22.
- `pnpm build` produced all 10 public application routes successfully on 2026-08-22.
- Landing, grounding-evidence, and patient-session screens were visually inspected at 1194 by 834 pixels on 2026-08-22.
