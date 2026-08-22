# ANCHOR Final Execution Handoff

Status: Ready for implementation

## Requirements Summary

1. Build the verified room-to-cue interaction as the headline product, with the family guide as supporting context.
   This is the accepted product thesis in `docs/PRD.md:36` and the winning outcome in `docs/IMPLEMENTATION_PLAN.md:3`.
2. Use one prepared bedroom image with three clear objects for the judged path while retaining support for three to five proposals.
   The P0 scope is defined in `docs/IMPLEMENTATION_PLAN.md:14` and the model contract remains in `docs/AI_CONTRACTS.md:65`.
3. Store and display a grounding proof chain from source image to Gemma observation to caregiver approval to question and cue.
   The product rule is in `docs/PRD.md:127`, the data contract is in `docs/AI_CONTRACTS.md:45`, and the architecture boundary is in `docs/ARCHITECTURE.md:55`.
4. Generate exactly six grounded questions with one visual-recall activity and one sequencing or association activity.
   The composition is defined in `docs/PRD.md:113` and enforced in `docs/AI_CONTRACTS.md:137`.
5. Provide immediate deterministic cueing and non-blocking live Gemini room-image generation.
   The prefetch and display policy is in `docs/ARCHITECTURE.md:194` and its implementation phase is in `docs/IMPLEMENTATION_PLAN.md:187`.
6. Generate a caregiver-approved, lightly stylized family guide with a persistent AI-generated label and neutral fallback.
   The trust boundary is in `docs/SAFETY.md:38` and the implementation phase is in `docs/IMPLEMENTATION_PLAN.md:201`.
7. Generate one short guide video asynchronously during setup, never as a prerequisite for patient interaction.
   The decision is recorded in `docs/DECISIONS.md:91` and the stage behavior is in `docs/DEMO_RUNBOOK.md:14`.
8. Treat speech recognition as optional and constrained to visible answers, repeat, and help.
   The product decision is in `docs/DECISIONS.md:62` and the optional phase is in `docs/IMPLEMENTATION_PLAN.md:230`.
9. Avoid medical-effectiveness claims, clinical scoring, diagnosis, or interpretation of incorrect answers.
   The claims boundary is in `docs/SAFETY.md:96` and the concrete acceptance criteria are in `docs/IMPLEMENTATION_PLAN.md:97`.

## Acceptance Criteria

- The prepared caregiver flow completes within 90 seconds, as required by `docs/IMPLEMENTATION_PLAN.md:123`.
- The patient magic moment receives at least 60 seconds of a three-minute presentation, as required by `docs/IMPLEMENTATION_PLAN.md:128`.
- Deterministic feedback renders within 200 milliseconds and no media job disables answer controls, as required by `docs/IMPLEMENTATION_PLAN.md:61`.
- The stage flow continues after eight seconds without waiting for media, as required by `docs/ARCHITECTURE.md:206`.
- The complete lesson works with live image, video, and speech features disabled, as required by `docs/IMPLEMENTATION_PLAN.md:72`.
- Every approved question, answer, and cue resolves to approved grounding records, as required by `docs/AI_CONTRACTS.md:63`.
- The original Gemma observation remains auditable after caregiver correction, as tested in `docs/TESTING.md:87`.
- The AI-generated guide label remains visible at every patient cue level, as tested in `docs/TESTING.md:114`.
- No patient screen contains scores, streaks, timers, severity labels, or clinical language, as required by `docs/IMPLEMENTATION_PLAN.md:107`.
- The primary flow, media-disabled fallback, and three-minute presentation each succeed three consecutive times, as required by `docs/TESTING.md:153`.
- The magic moment satisfies all visual proof criteria in `docs/DEMO_RUNBOOK.md:134`.
- Feature work stops at 2:30 and submission completes by 3:15, as defined in `docs/IMPLEMENTATION_PLAN.md:271` and `docs/IMPLEMENTATION_PLAN.md:276`.

## Implementation Steps

### 1. Scaffold the Tested Application Shell

Create `package.json`, strict TypeScript configuration, Next.js App Router pages under `src/app`, and test configuration for Vitest and Playwright.
Create a server-only environment parser under `src/config` and fixture-mode startup that does not require a credential.
Implement the route shells defined in `docs/ARCHITECTURE.md:137`.

Completion evidence:

- Development server starts.
- Type checking, linting, unit-test discovery, and production build pass.
- Caregiver and patient route shells render at desktop and tablet viewports.
- This satisfies Phase 0 in `docs/IMPLEMENTATION_PLAN.md:146`.

### 2. Implement the Deterministic Domain Core

Create domain types and schemas under `src/domain` for patient profile, world model, grounding record, guide, lesson, cue state, media job, and session.
Create the cue reducer as a pure module and enforce `none`, `verbal`, `focus`, `simplified`, and `reveal` transitions.
Create fake providers under `src/providers/fake` and local persistence under `src/storage/local`.

Completion evidence:

- Cue-state unit tests cover incorrect answer, help, reveal, correct answer, and next-question reset.
- Grounding schemas match `docs/AI_CONTRACTS.md:45`.
- Fixture mode can complete the entire flow offline.
- This satisfies the domain and fallback requirements in `docs/IMPLEMENTATION_PLAN.md:157`.

### 3. Build the Seeded Caregiver and Patient Flow

Build concise caregiver screens for profile, room upload, object verification, guide approval, and lesson approval.
Build a grounding evidence card showing source crop, original Gemma proposal, caregiver value, and approval state.
Build the patient screen with the room as the dominant visual, a smaller labeled guide, large answer buttons, replay, help, and progress.

Completion evidence:

- The primary Playwright scenario follows `docs/TESTING.md:9`.
- The fallback Playwright scenario disables all generated media.
- The caregiver path completes within 90 seconds using prepared assets.
- The patient route satisfies the accessibility checks in `docs/TESTING.md:114`.

### 4. Connect Live Gemma Through a Validated Provider

Create a server-only Google Gen AI adapter under `src/providers/google`.
Implement room analysis, structured parsing, one repair attempt, and six-question lesson generation.
Reject unsupported personal inference and keep every result in draft state until caregiver approval.
Build grounding links from each approved lesson field back to approved evidence.

Completion evidence:

- Contract tests cover valid, malformed, markdown-wrapped, out-of-range, over-inferred, and ungrounded responses listed in `docs/TESTING.md:94`.
- Missing grounding blocks lesson approval.
- The prepared bedroom image produces three to five proposals and six valid questions.
- This satisfies Phase 2 in `docs/IMPLEMENTATION_PLAN.md:172`.

### 5. Implement the Progressive Visual Magic Moment

Create a deterministic visual-cue component using normalized bounding boxes, dimming, highlighting, and cropping.
Start a Gemini simplified-room request after the first incorrect answer while keeping patient controls interactive.
Validate the returned media against target presence, target location, room identity, and misleading additions before display.
Show generated media only at the `simplified` level and keep the deterministic scene after timeout or rejection.

Completion evidence:

- Immediate deterministic feedback meets the 200-millisecond budget.
- Forced timeout and forced rejection preserve the lesson.
- At least one real generated scene succeeds for the prepared asset.
- The UI continues after the eight-second stage budget.
- This satisfies Phase 3 in `docs/IMPLEMENTATION_PLAN.md:187`.

### 6. Implement the Trustworthy Family Guide

Build consent capture, reference upload, portrait generation, approval, rejection, persistent labeling, and neutral fallback.
Use a lightly stylized prompt and generic speech synthesis.
Start the optional video job after static-guide approval and run it concurrently with lesson setup.
Keep the static guide when video is pending, rejected, timed out, unavailable, or disabled for reduced motion.

Completion evidence:

- Patient mode never renders an unapproved or unlabeled generated likeness.
- The fallback guide completes the entire lesson.
- No guide output contains a personal memory, quote, current awareness, or live-call implication.
- Video failure changes no answer or cue behavior.
- This satisfies Phase 4 in `docs/IMPLEMENTATION_PLAN.md:201` and `docs/SAFETY.md:38`.

### 7. Harden, Rehearse, and Submit

Run all quality gates, inspect tablet screenshots at every cue state, and rehearse normal and fallback presentations.
Use the exact stage sequence in `docs/DEMO_RUNBOOK.md:45`.
Freeze features at 2:30 and submit by 3:15.

Completion evidence:

- All checks in `docs/TESTING.md:153` pass.
- All magic-moment criteria in `docs/DEMO_RUNBOOK.md:134` pass.
- No secret, personal photo, or generated private media is tracked.
- The status and implementation checklists are updated.

## Risks and Mitigations

### Avatar Trust Failure

Risk:
The guide looks deceptive, uncanny, or more important than the patient activity.

Mitigation:
Use the stylized treatment, persistent label, caregiver approval, generic voice, smaller layout area, and neutral fallback required in `docs/IMPLEMENTATION_PLAN.md:43`.

### Model Latency or Quota Failure

Risk:
The stage experience stalls on image or video generation.

Mitigation:
Use immediate deterministic cues, prefetching, setup-time video generation, cached approved assets, and the eight-second continuation rule in `docs/IMPLEMENTATION_PLAN.md:61`.

### Incorrect Personal Grounding

Risk:
Gemma proposes an incorrect object or location and a lesson repeats it as fact.

Mitigation:
Keep proposals separate from approved facts, show the source crop, preserve caregiver corrections, and block missing evidence as required in `docs/IMPLEMENTATION_PLAN.md:79`.

### Medical-Credibility Challenge

Risk:
Judges interpret ANCHOR as making an unsupported therapeutic claim.

Mitigation:
Use the engagement-only positioning and presentation boundaries in `docs/SAFETY.md:96` and `docs/DEMO_RUNBOOK.md:123`.

### Scope Collapse

Risk:
Video, speech, or setup polish consumes the time needed for the central interaction.

Mitigation:
Enforce P0, P1, and P2 tiers plus the absolute stop rules in `docs/IMPLEMENTATION_PLAN.md:12` and `docs/IMPLEMENTATION_PLAN.md:280`.

## Verification Commands

After application scaffolding, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Then run the opt-in live-provider smoke test three times with the prepared assets.
Record results, timing, fallback behavior, and any remaining risks in `docs/STATUS.md` as required by `docs/TESTING.md:163`.

## Final Stop Condition

The project is ready to submit when P0 is complete, the reliability gate passes, the magic moment remains understandable with video and speech disabled, and the three-minute presentation has succeeded three consecutive times.
Do not trade that condition for another feature.
