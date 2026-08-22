# ANCHOR Project Status

Last updated: 2026-08-22

## Current Phase

Core Rebuild: Real-Room Grounding and Family Question Video

## Completed

- Corrected the product position to cognitive engagement, attention, recognition, spatial orientation, recall, association, and familiar-space support without dementia-prevention or treatment claims.
- Reproduced the real-upload defect end to end and found that demo mode routed every caregiver image through the bedroom fixture provider.
- Real caregiver-uploaded JPG, PNG, and WebP images now use Gemini vision whenever the server key is configured, even while prepared demo mode remains enabled.
- Room analysis now requests six to ten distinct question-ready objects when supported by the pixels and persists a medium or high confidence signal beside each caregiver-review proposal.
- The supplied 640 by 480 office photo is stored only as an ignored local acceptance fixture and has an opt-in live test for monitor, keyboard, chair, desk, window, bottle, and computer-tower evidence.
- Trusted-person setup now accepts one to three authorized portrait references, independently validates the generated lightly stylized guide, and preserves caregiver approve, reject, and neutral-fallback controls.
- Approved family guides can ask the active detailed lesson question through a lazy Gemini Omni Flash portrait video using a neutral synthetic voice.
- Generated guide videos remain private, receive an independent one-person, likeness, no-call-UI, and safe-dialogue validation gate, and never block the static guide or room activity.
- Tailscale preview recovery is now persistent through the `com.anchor.preview` macOS LaunchAgent rather than depending on a terminal-owned server process.
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
- Phase 1 runtime schemas implemented for patient, world model, grounding, trusted person, guide, lesson, media job, and session state.
- Deterministic cue and session reducers implemented with the enforced `none`, `verbal`, `focus`, `simplified`, and `reveal` sequence.
- Fake AI and validated browser-local storage adapters implemented for the complete offline flow.
- Caregiver profile, room analysis, evidence correction, world-model approval, consent, guide approval, and lesson approval made interactive and persistent.
- Corrected caregiver values now flow into the generated fixture lesson while the original Gemma observation remains auditable.
- The complete six-question patient session now supports neutral feedback, visible help, generic browser speech synthesis, progress, replay, and completion without a score.
- The neutral non-likeness guide and deterministic room-media fallback complete the entire flow with likeness media disabled.
- Cover-image grounding geometry now projects source-image bounding boxes into responsive crops and keeps edge targets visible.
- The synthetic fixture coordinates were visually corrected so the primary cue highlights the reading glasses rather than the pillow.
- Patient routes remain gated until persisted caregiver approval has loaded, preventing prepared fixture content from flashing over a saved draft.
- Tailscale Serve exposes the loopback production preview privately at `https://kais-mac-mini.tail4a140f.ts.net:3443/`.
- The Google Gen AI SDK is pinned behind a server-only transport and provider boundary.
- Live room analysis returns six to ten validated visible-object proposals when supported, with normalized bounding boxes and confidence.
- Room images are validated by MIME declaration, byte signature, and decoded size before model use.
- Selected room media is stored outside version control and served through a private no-store route.
- Gemma lesson generation is constrained to approved object IDs, location IDs, and question types.
- Patient prompts, answers, choices, encouragement, and cues are compiled deterministically from caregiver-approved evidence.
- The lesson contract enforces exactly six questions with one visual-recall activity and one association activity.
- Structured model output receives at most one repair attempt and fails closed on malformed, unsupported, over-inferred, or ungrounded content.
- A manually triggered live-provider GitHub Actions workflow and an opt-in local Playwright smoke path are included.
- The complete prepared-room live Gemma flow passed locally with the configured key and model.
- The updated quiet sage mockup now anchors the landing, caregiver, patient start, and patient activity visual language.
- Figtree typography, warm neutral surfaces, rounded cards, pill actions, compact progress dots, and the two-column activity stage are implemented.
- The approved room image now dominates patient start while the generated guide remains labeled and secondary.
- Patient activity copy was shortened without weakening the deterministic grounding compiler.
- Design QA passed against the source patient-activity reference at the 1194 by 834 tablet viewport.
- The final patient activity capture has zero horizontal or vertical viewport overflow and no browser console errors.
- Progressive cue generation now starts after the first incorrect answer or explicit help request without blocking the deterministic cue sequence.
- Simplified-room jobs record pending, completed, failed, rejected, timed-out, and disabled outcomes with grounding identifiers and generation metadata.
- The Gemini room-media provider accepts only an approved target and compares the source and candidate images before publication.
- Candidate media must preserve target presence, target location, room identity, and introduce no misleading content before it can appear.
- Unsafe, malformed, failed, disabled, or timed-out media fails closed to the verified room cue.
- The eight-second patient-stage budget no longer waits for model latency, and a safe late result is staged until the next explicit patient interaction.
- The generated room remains hidden during verbal and focus cues and crossfades only at the simplified cue level.
- Reduced-motion preferences eliminate the room crossfade without changing cue meaning or answer controls.
- Generated room media is stored outside version control and served through a private no-store route.
- Gemini 3.1 Flash Lite Image is the default interactive edit model after passing the preservation gate with lower observed latency than the full Flash Image model.
- Live, timeout, rejection, disabled-media, late-result, and private-media browser paths are covered by automated tests.
- The approved room image now acts as the answer surface for five lesson activities, with accessible hotspots projected from caregiver-approved normalized object boxes.
- Small evidence regions expand to at least 72 by 72 CSS pixels without moving their verified centers outside the contained room image.
- The deterministic lesson compiler now combines visible attributes, verified locations, shared surfaces, and supported image-plane landmark relationships into detailed patient prompts.
- The visual-recall activity now provides an untimed room-study state, explicit hide action, and left, middle, or right spatial recall response.
- The association activity uses a distinct verified landmark and asks the patient to identify another object sharing its caregiver-approved surface.
- Runtime contracts now distinguish object-tap and recall-zone interactions and reject missing targets, duplicate hotspots, unsupported references, and inconsistent spatial answers.
- The caregiver lesson preview now explains each spatial interaction and its grounded answer instead of showing only generic choices.
- Spatial core design QA passed at 1194 by 834 pixels across initial, incorrect, focus, correct, recall, and association states.
- Every lesson activity now has a distinct reasoning-task title and exactly three grounded evidence clues selected from appearance, verified place, landmark, and image-region rules.
- Patient prompts now state the complete verified claim, while instructions require evidence matching, constraint elimination, landmark-guided search, row-and-column recall, or shared-surface association.
- The lesson plan must target at least three approved objects and cannot target any object more than twice.
- Visual recall now binds the target to its verified surface, one row, and one column before exposing six exact answer regions.
- Strong spatial reasoning design QA passed at 1194 by 834 pixels for the detailed first activity, hidden six-region recall, and multi-evidence association with no viewport overflow.
- Lesson generation now starts a Gemini room-composition job during caregiver review so patient mode does not wait on the network.
- A completed candidate becomes the primary room surface only after independent two-image validation confirms approved object preservation, image-plane alignment, room identity, and no misleading additions.
- The primary scene is a labeled 2.5D spatial interpretation with perspective interaction, realistic visible depth, and hotspots anchored to caregiver-approved coordinates.
- The deterministic source room remains the complete fallback when generation is disabled, late, failed, rejected, or unsafe.
- The live prepared-room path generated and validated the new spatial composition in 12.3 seconds and displayed it successfully in patient mode.
- Direct patient entry now starts the same spatial-composition job on the patient welcome screen, so a fresh Tailscale origin cannot bypass the core feature.
- The non-blocking spatial-preview budget is 90 seconds so a safe generation can finish across both image creation and independent validation without delaying the Start activity control.
- A 2-minute 36-second Remotion product film now presents the complete core proof from licensed demo inputs through grounded spatial challenge and progressive support.
- The film uses a truthfully paired synthetic source room and validated product scene for the before-and-after transformation proof.
- The separate Pexels room and portrait are clearly labeled as licensed presentation references, with source-page credits stored beside the film project.
- The film uses neutral system text-to-speech rather than a cloned family voice and repeats the generated-media, consent, fallback, no-score, and non-diagnostic boundaries.
- Eight representative film states were visually inspected at 1920 by 1080 pixels before the final H.264 and AAC render.

## Next Actions

1. Raise or reset the Gemini API billing spending cap, then run `pnpm test:live:office` with the supplied office photo.
2. Rehearse one real office upload, caregiver verification, six-question session, and family-guide video through Tailscale.
3. Push the local phase commits when the repository owner is ready to publish the completed handover.

## Open Risks

- The configured Gemini account currently returns HTTP 429 `RESOURCE_EXHAUSTED` because its monthly spending cap is exceeded, so real object detection, room generation, guide generation, and video generation cannot complete until billing is restored.
- The Gemini Omni Flash preview requires paid-tier access and may not be available to the chosen API key.
- Live spatial-room generation and validation took 12.3 seconds in the latest prepared-flow check, so caregiver-time prefetch and safe late-publication remain essential.
- Generative preservation is nondeterministic, so every candidate must continue to pass the two-image validation gate.
- Browser speech-recognition support varies and must remain optional.
- Local filesystem persistence will need replacement if the demo is deployed to an ephemeral host.
- The avatar may reduce trust if its styling or labeling feels like impersonation.
- Excessive caregiver setup could crowd out the patient magic moment during judging.
- Medical-effectiveness language could undermine credibility despite a polished demo.
- The newest Vite major currently requests an unpublished transitive dependency, so the test toolchain is pinned to the stable Vite 7 line.
- A single room photograph can support a perspective-preserving 2.5D interpretation, but it cannot justify a metric mesh, unseen geometry, or free-camera reconstruction.
- Stronger evidence tasks increase reading and reasoning demand, so caregiver review, spoken replay, progressive help, neutral feedback, and the no-score boundary must remain mandatory.

## Blockers

- The deterministic prepared and fallback demo remains usable locally and through Tailscale.
- Live Gemini acceptance for the supplied office photo is blocked by the account's monthly spending cap, not by request validation or missing credentials.

## Verification Log

- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed after the real-room and guide-video implementation on 2026-08-22.
- `pnpm test` passed 54 tests across 15 files after the real-room and guide-video contract coverage was added on 2026-08-22.
- `pnpm build` compiled all application routes and the private guide-reference, guide-image, guide-video, room-image, and generated-room media routes after the core rebuild on 2026-08-22.
- The supplied-office live provider test reached Gemini on 2026-08-22 and failed with HTTP 429 `RESOURCE_EXHAUSTED` because the billing account exceeded its monthly spending cap.
- Documentation and environment files created on 2026-08-16.
- Final weakness-driven plan revision completed on 2026-08-18.
- `pnpm lint` passed on 2026-08-22.
- `pnpm typecheck` passed on 2026-08-22.
- `pnpm test` passed 4 tests across 2 files on 2026-08-22.
- `pnpm test:e2e` passed 2 tablet Chromium scenarios, including accessibility and touch-target checks, on 2026-08-22.
- `pnpm build` produced all 10 public application routes successfully on 2026-08-22.
- Landing, grounding-evidence, and patient-session screens were visually inspected at 1194 by 834 pixels on 2026-08-22.
- `pnpm format:check` passed on 2026-08-22 after Phase 1.
- `pnpm lint` passed on 2026-08-22 after Phase 1.
- `pnpm typecheck` passed on 2026-08-22 after Phase 1.
- `pnpm test` passed 18 tests across 9 files on 2026-08-22 after Phase 1.
- `pnpm test:e2e` passed 5 tablet Chromium scenarios on a cold isolated server on 2026-08-22 after Phase 1.
- `pnpm build` produced all 10 public application routes successfully on 2026-08-22 after Phase 1.
- Initial, focus, and simplified patient cue states were visually inspected at 1194 by 834 pixels on 2026-08-22.
- The Tailscale production preview returned HTTP 200 on 2026-08-22.
- `pnpm install --frozen-lockfile` passed on 2026-08-22 after Phase 2 dependency approval was pinned.
- `pnpm test:live` passed the complete prepared-room Gemma flow in 31.5 seconds on 2026-08-22.
- `pnpm format:check` passed on 2026-08-22 after Phase 2.
- `pnpm lint` passed on 2026-08-22 after Phase 2.
- `pnpm typecheck` passed on 2026-08-22 after Phase 2.
- `pnpm test` passed 29 tests across 10 files on 2026-08-22 after Phase 2.
- `pnpm test:e2e` passed 5 tablet Chromium scenarios on 2026-08-22 after Phase 2.
- `pnpm build` produced all 10 public application routes and the private room-media route successfully on 2026-08-22 after Phase 2.
- `pnpm lint` and `pnpm typecheck` passed during the design alignment checkpoint on 2026-08-22.
- `pnpm format:check` passed during the design alignment checkpoint on 2026-08-22.
- `pnpm test` passed 29 tests across 10 files during the design alignment checkpoint on 2026-08-22.
- `pnpm test:e2e` passed all 5 tablet Chromium scenarios after the design alignment checkpoint on 2026-08-22.
- `pnpm build` produced all 10 public application routes and the private room-media route after the design alignment checkpoint on 2026-08-22.
- Browser-rendered design QA passed with exact 1194 by 834 viewport fit and no console errors on 2026-08-22.
- `pnpm format:check` passed on 2026-08-22 after Phase 3.
- `pnpm lint` passed on 2026-08-22 after Phase 3.
- `pnpm typecheck` passed on 2026-08-22 after Phase 3.
- `pnpm test` passed 40 tests across 12 files on 2026-08-22 after Phase 3.
- `pnpm test:e2e` passed all 7 tablet Chromium scenarios on 2026-08-22 after Phase 3.
- `pnpm test:live` passed the complete prepared-room Gemma flow in 29.3 seconds on 2026-08-22 after Phase 3 transport changes.
- `pnpm test:live:media` generated and validated the simplified room through Gemini 3.1 Flash Lite Image in 11.4 seconds on 2026-08-22.
- `pnpm build` produced all 12 routes without warnings on 2026-08-22 after Phase 3.
- The generated cue crossfade and reduced-motion state were visually inspected at 1194 by 834 pixels with no viewport overflow or browser console errors on 2026-08-22.
- The Phase 3 production preview returned HTTP 200 through the private Tailscale URL on 2026-08-22.
- `pnpm format:check` passed on 2026-08-22 after the core spatial interaction checkpoint.
- `pnpm lint` passed on 2026-08-22 after the core spatial interaction checkpoint.
- `pnpm typecheck` passed on 2026-08-22 after the core spatial interaction checkpoint.
- `pnpm test` passed 46 tests across 14 files on 2026-08-22 after the core spatial interaction checkpoint.
- `pnpm test:e2e` passed all 10 tablet Chromium scenarios against the active local preview on 2026-08-22 after the core spatial interaction checkpoint.
- `pnpm build` produced all 12 routes without warnings on 2026-08-22 after the core spatial interaction checkpoint.
- The complete six-question spatial flow was inspected in the in-app browser with no viewport overflow or browser console errors on 2026-08-22.
- The production patient route returned HTTP 200 locally and through the private Tailscale URL after the core spatial interaction checkpoint on 2026-08-22.
- `pnpm format:check` passed on 2026-08-22 after the strong spatial reasoning checkpoint.
- `pnpm lint` passed on 2026-08-22 after the strong spatial reasoning checkpoint.
- `pnpm typecheck` passed on 2026-08-22 after the strong spatial reasoning checkpoint.
- `pnpm test` passed 52 tests across 15 files on 2026-08-22 after the strong spatial reasoning checkpoint.
- `pnpm test:e2e` passed all 11 tablet Chromium scenarios after the strong spatial reasoning checkpoint on 2026-08-22.
- `pnpm build` produced all 15 application and private-media routes after the strong spatial reasoning checkpoint on 2026-08-22.
- The detailed first activity, hidden six-region recall, and shared-surface association were inspected in the in-app browser at 1194 by 834 pixels with no viewport overflow on 2026-08-22.
- The prepared raster-room flow generated and independently validated the primary Gemini 2.5D spatial interpretation in 12.3 seconds on 2026-08-22.
- The live generated scene, three caregiver-approved hotspots, and detailed three-clue first activity were visually inspected in the in-app browser at 1280 by 720 pixels on 2026-08-22.
- `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` passed after the Gemini spatial-composition checkpoint on 2026-08-22.
- `pnpm test` passed 47 tests across 14 files after the Gemini spatial-composition checkpoint on 2026-08-22.
- `ANCHOR_LIVE_MEDIA_IN_DEMO=false pnpm test:e2e` passed all 10 tablet Chromium scenarios after the Gemini spatial-composition checkpoint on 2026-08-22.
- Two additional repeated browser runs passed all 20 scenarios, giving the primary and fallback paths three consecutive passes on 2026-08-22.
- `pnpm build` compiled successfully and produced all application and private-media routes after the Gemini spatial-composition checkpoint on 2026-08-22.
- Git tracking checks confirmed that `.env.local`, `.data`, uploads, and generated room media remain outside version control on 2026-08-22.
- `ANCHOR_LIVE_MEDIA_IN_DEMO=false pnpm test:e2e` passed all 11 tablet Chromium scenarios after adding direct patient-entry spatial preparation on 2026-08-22.
- The final production `/patient` route returned HTTP 200 locally and through Tailscale on 2026-08-22.
- A fresh Tailscale patient origin started live spatial preparation, published a validated Gemini 2.5D room within the 90-second non-blocking budget, and opened Question 1 with all three evidence clues on 2026-08-22.
- `npm run lint` passed ESLint and TypeScript checks for the Remotion project on 2026-08-22.
- `npm audit --audit-level=high` reported zero vulnerabilities for the Remotion project on 2026-08-22.
- The film's licensed-input, grounding, spatial-room, detailed-challenge, four progressive-support, and closing frames were visually inspected at 1920 by 1080 pixels on 2026-08-22.
- `npm run render` produced a 156-second, 1920 by 1080 H.264 video with stereo AAC narration on 2026-08-22.
- Final repository `pnpm format:check`, `pnpm lint`, and `pnpm typecheck` checks passed after adding the submission film on 2026-08-22.
- Final `pnpm test` passed 47 tests across 14 files after adding the submission film on 2026-08-22.
- Final `pnpm build` produced all application and private-media routes after adding the submission film on 2026-08-22.
- GitHub reported `GEMINI_API_KEY` under the Codespaces secret scope rather than the Actions scope during the final handover audit on 2026-08-22.
- The locally verified key was copied directly from ignored `.env.local` into the repository Actions secret without exposing its value, and `gh secret list --app actions` confirmed the exact `GEMINI_API_KEY` name on 2026-08-22.
