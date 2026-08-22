# ANCHOR Final Hackathon Implementation Plan

## Winning Outcome

The finished demo must prove one thing exceptionally well:

> Gemma understands a familiar room, a caregiver verifies the evidence, and Gemini provides the minimum visual cue that helps the patient complete an activity.

The generated family guide supports the interaction.
It is not allowed to replace, obscure, or delay the verified room-to-cue experience.

## Priority Tiers

### P0: Required to Submit

- One prepared bedroom image with three clearly visible objects.
- Gemma object and location proposals.
- A caregiver-editable grounding ledger with one visible evidence card.
- One caregiver-approved, lightly stylized generated family guide with a neutral fallback.
- Six grounded questions with exactly two cognitive activities.
- One complete patient question with incorrect-answer progression.
- Immediate verbal, focus, simplified, and reveal cue states.
- Live Gemini room-image generation with deterministic fallback.
- A polished tablet patient interface.
- One seeded end-to-end test and one fallback-mode end-to-end test.

### P1: Valuable After P0 Is Stable

- One asynchronous three-to-five-second guide video.
- Two additional guide expressions.
- Real-provider smoke tests for the prepared assets.

### P2: Nice to Have

- Push-to-talk speech recognition for visible answers, repeat, and help.
- More than one room image.
- Regeneration and editing conveniences beyond the minimum caregiver controls.

P2 work must not begin during the hackathon unless every P0 acceptance criterion passes and the full demo has succeeded three consecutive times.

## Weakness Coverage

### Weakness 1: The Avatar Could Feel Like a Gimmick or Deepfake

Mitigation:

- Use a warm, lightly stylized guide rather than seamless photorealism.
- Show `AI-generated guide based on [name]` beside the guide.
- Require explicit likeness consent and caregiver approval.
- Use a generic system voice and prohibit voice cloning.
- Keep a neutral non-likeness fallback.
- Give the avatar less visual area than the room scene.

Acceptance criteria:

- The generated label remains visible throughout patient mode.
- The room image and answer controls remain the dominant visual elements.
- The complete lesson works with the neutral fallback guide.
- No guide line contains an invented memory, quote, routine, or live-call implication.

### Weakness 2: Live Image or Video Generation Could Be Slow

Mitigation:

- Render deterministic answer feedback within 200 milliseconds.
- Prefetch the simplified room image after the first incorrect answer.
- Display it only at the `simplified` level after validation.
- Begin guide-video generation during caregiver setup rather than patient interaction.
- Continue the stage script after eight seconds without waiting.
- Cache approved assets for replay and keep an explicit fixture mode.

Acceptance criteria:

- Answer buttons remain usable during every media job.
- An image or video timeout does not reset or block lesson progress.
- The fallback path is visually complete rather than an error screen.
- The demo reaches completion with all live media features disabled.

### Weakness 3: Gemma Could Detect an Object or Location Incorrectly

Mitigation:

- Treat every model result as a proposal.
- Show the source image crop beside the proposed name and location.
- Require caregiver confirmation before approval.
- Store the original observation and caregiver correction in the grounding ledger.
- Resolve every question, answer, and cue to approved grounding records.
- Block lesson approval when evidence is missing.

Acceptance criteria:

- A caregiver can correct a proposal without editing JSON.
- The corrected value appears in the lesson while the original proposal remains auditable.
- An unapproved or missing grounding record cannot enter patient mode.
- The stage demo shows one complete image-to-question-to-cue proof chain.

### Weakness 4: Judges Could Challenge Medical Credibility

Mitigation:

- Describe ANCHOR as a familiarity-based engagement prototype.
- Do not claim treatment, improvement, diagnosis, assessment, or slowed decline.
- Do not score the patient or interpret incorrect answers.
- Distinguish intended experience from clinical evidence.
- Use synthetic or explicitly consented demonstration data.

Acceptance criteria:

- No patient screen contains a score, streak, timer, severity label, or clinical language.
- The pitch includes the non-medical boundary in one sentence.
- All cognitive activities are described as gentle activities rather than tests.

### Weakness 5: Caregiver Setup Could Consume the Entire Demo

Mitigation:

- Optimize the stage path for one room image and three object proposals.
- Preselect prepared files through a visible demo fixture without bypassing approvals.
- Keep profile, object verification, guide approval, and lesson approval to concise screens.
- Present only one grounding card and one lesson preview card on stage.
- Generate all six questions but demonstrate only two.

Acceptance criteria:

- The prepared caregiver portion completes within 90 seconds.
- No caregiver screen requires raw JSON, scrolling through six full questions, or repeated model retries.
- The patient magic moment receives at least 60 seconds of a three-minute presentation.

### Weakness 6: Too Many AI Features Could Look Loosely Connected

Mitigation:

- Make the grounding ledger the shared input to lesson generation, cueing, and media validation.
- Explain every model call as part of one proof chain.
- Treat video as one supporting moment and speech recognition as optional.
- Remove any feature that cannot be explained as improving the verified room-to-cue interaction.

Acceptance criteria:

- The presenter can explain Gemma, Gemini image generation, and the family guide in one connected sentence.
- The demo remains coherent when video and speech recognition are disabled.
- No dashboard, analytics panel, reminder, medication, or whole-home feature appears.

## Implementation Sequence

### Phase 0: Scaffold and Quality Gates

- [x] Scaffold the Next.js TypeScript application with strict compiler settings.
- [x] Configure formatting, linting, type checking, Vitest, and Playwright.
- [x] Add server-only environment validation.
- [x] Add the synthetic bedroom, trusted-person, and six-question fixtures.
- [x] Add responsive route shells for caregiver and patient modes.

Exit condition:
The app starts locally, the production build succeeds, and fixture mode needs no external credential.

### Phase 1: Seeded Winning Flow

- [x] Implement patient, world-model, grounding, guide, lesson, media-job, and session types.
- [x] Implement the deterministic cue state machine.
- [x] Implement fake AI and local storage adapters.
- [x] Build the minimum caregiver path.
- [x] Build object verification with source crop, original proposal, correction, and approval.
- [x] Build the six-question lesson preview with two cognitive activities.
- [x] Build the tablet patient experience.
- [x] Add generic text-to-speech and visible replay and help controls.
- [x] Add the primary and fallback end-to-end tests.

Exit condition:
The complete stage flow works offline, shows the grounding proof chain, and passes both end-to-end tests.

### Phase 2: Real Gemma Grounding

- [x] Add the Google Gen AI SDK behind a server-only provider.
- [x] Implement Gemma room analysis for three to five proposals.
- [x] Validate structured output with Zod.
- [x] Create grounding records from proposals and caregiver corrections.
- [x] Implement Gemma six-question lesson generation.
- [x] Enforce exactly one visual-recall activity and one sequencing or association activity.
- [x] Block ungrounded prompts, answers, choices, and cues.
- [x] Add one structured-output repair attempt.
- [x] Add contract tests for malformed, ungrounded, and over-inferred output.

Exit condition:
The prepared room image produces an approved world model and six grounded questions through live Gemma.

### Design Alignment Checkpoint

- [x] Center the visual language on the updated quiet sage mockup.
- [x] Keep the verified room image dominant on patient start and activity screens.
- [x] Preserve large patient controls, deterministic grounding copy, and visible guide labeling.
- [x] Visually compare the tablet activity against the source and eliminate viewport overflow.

Exit condition:
The core caregiver and patient screens match the selected visual direction without weakening the verified room-to-cue flow.

### Phase 3: Progressive Cue Magic Moment

- [x] Implement deterministic dimming, highlighting, and cropping from normalized bounding boxes.
- [x] Prefetch a simplified Gemini room image after the first incorrect answer.
- [x] Add pending, completed, failed, rejected, and timed-out media states.
- [x] Validate object presence, location, room identity, and misleading additions.
- [x] Crossfade to the generated scene only at the `simplified` cue level.
- [x] Continue with the deterministic visual after an eight-second stage budget.
- [x] Add reduced-motion behavior.
- [x] Test live, timeout, rejection, and disabled-media paths.

Exit condition:
The patient receives an immediate cue and can finish the question whether live generation succeeds, arrives late, or fails.

### Core Spatial Interaction Checkpoint

- [x] Make the approved room image the answer surface for five questions.
- [x] Project large accessible hotspots from the approved normalized object boxes.
- [x] Compile specific prompts from visible attributes, verified locations, and supported landmark relationships.
- [x] Replace the generic recall question with a no-timer study, hide, and broad-zone activity.
- [x] Use a verified landmark and shared location in the association activity.
- [x] Preserve the deterministic cue sequence and generated-media fallback.
- [x] Add spatial geometry, lesson compilation, browser interaction, accessibility, and viewport coverage.

Exit condition:
The patient explores the verified room directly, every answer remains grounded, and all six questions provide a concrete observation or recall task.

### Strong Spatial Reasoning Checkpoint

- [x] Give every activity a distinct reasoning task instead of a generic recognition prompt.
- [x] Present exactly three grounded evidence clues for every question.
- [x] Require complete evidence matching across appearance, place, landmark, or image-region rules.
- [x] Upgrade recall from three broad columns to a six-region row-and-column map.
- [x] Distribute six targets across at least three objects and cap each object at two targets.
- [x] Add contract, compiler, spatial geometry, browser interaction, accessibility, and tablet viewport coverage.

Exit condition:
The six activities form a varied evidence-reasoning sequence, no activity can be solved from a generic one-line prompt alone, and the full tablet session remains calm, grounded, and usable without a score or timer.

### Gemini Spatial Composition Checkpoint

- [x] Start one primary room-composition job during caregiver lesson review.
- [x] Start the same job from direct patient entry when a prepared fixture bypasses caregiver review.
- [x] Ask Gemini for a realistic perspective-preserving 2.5D interpretation without changing the source viewpoint or inventing unseen geometry.
- [x] Validate all approved objects, image-plane locations, room identity, and misleading additions against the source image before display.
- [x] Use the validated composition as the primary patient interaction surface with caregiver-approved hotspots.
- [x] Add subtle pointer perspective and object exploration while respecting reduced motion and touch input.
- [x] Preserve the complete source-room fallback when live media is unavailable or unsafe.
- [x] Add provider-contract and browser coverage for the primary generated scene.

Exit condition:
The patient can explore and answer in a labeled Gemini-generated spatial interpretation, while the app remains honest about the single-image limitation and fully usable without generation.

### Deferred Phase 4: Trustworthy Family Guide

This phase was deliberately excluded from the hackathon submission after the user froze scope around the spatial room, strong questions, and progressive cue loop.
The existing neutral labeled guide remains the safe demo fallback, and these items are post-hackathon work rather than submission blockers.

- [ ] Capture name, relationship, likeness permission, and caregiver confirmation.
- [ ] Generate one lightly stylized guide portrait from two or three reference images.
- [ ] Add caregiver approval and rejection.
- [ ] Keep the AI-generated label visible in patient mode.
- [ ] Add the neutral non-likeness fallback.
- [ ] Start one short video job after static-guide approval.
- [ ] Keep the static guide visible until the video passes validation.
- [ ] Confirm that disabling video changes no lesson behavior.

Exit condition:
The guide adds familiarity without impersonation and never blocks the patient flow.

### Phase 5: Demo Hardening and Submission

- [x] Run the primary and fallback end-to-end tests three consecutive times.
- [x] Run lint, type checking, unit tests, end-to-end tests, and production build.
- [x] Inspect every patient cue state at the target tablet viewport.
- [x] Check keyboard access, touch-target size, contrast, focus, and reduced motion.
- [ ] Run the prepared caregiver path with a 90-second timer.
- [x] Run the complete 2-minute 36-second rendered presentation inside the three-minute limit.
- [ ] Run three live-provider smoke tests using the prepared assets.
- [x] Confirm that no secret or personal media is tracked.
- [x] Freeze features and prepare the core submission film.

Exit condition:
The presentation succeeds three times in both normal and fallback rehearsals and the submission is ready before the deadline.

### Submission Film Checkpoint

- [x] Source one licensed stock room and one licensed stock portrait for the presentation.
- [x] Preserve the source-page URLs, photographers, and presentation-only usage boundary in an asset manifest.
- [x] Capture the real patient welcome, spatial challenge, verbal cue, focus, simplified, and grounded reveal states.
- [x] Use the matching synthetic source room for the product transformation proof.
- [x] Build eight separate Remotion scenes around the core room-to-question-to-cue narrative.
- [x] Add a neutral non-cloned narration track and retain the written voiceover script.
- [x] Inspect representative 1920 by 1080 frames for cropping, legibility, truthfulness, and source labeling.
- [x] Render the final 2-minute 36-second H.264 and AAC film.

Exit condition:
The final film stays under three minutes, demonstrates only verified core states, credits all stock inputs, and avoids clinical, impersonation, and metric-3D claims.

### Optional Phase 6: Speech Recognition

- [ ] Implement push-to-talk only after the Phase 5 exit condition passes.
- [ ] Map speech only to visible answers, repeat, and help.
- [ ] Preserve large-button input as the primary path.
- [ ] Avoid persisting transcripts.

Exit condition:
Speech adds convenience without changing or destabilizing the approved lesson flow.

## Hackathon-Day Schedule

### 9:00 to 10:00

Complete Phase 0 and the patient shell.
If scaffolding is not complete by 10:00, use the simplest supported styling and stop adding infrastructure.

### 10:00 to 11:15

Complete the seeded Phase 1 flow and primary end-to-end test.
Do not begin live provider work until the offline flow reaches completion.

### 11:15 to 12:15

Complete live Gemma analysis, grounding, and lesson generation.
Use lunch time only for provider debugging or visual cleanup, not new scope.

### 12:30 to 1:30

Complete progressive visual cueing and live image generation.
This is the highest-value technical block.

### 1:30 to 2:00

Complete the generated guide and start asynchronous video generation if P0 is stable.
Skip video immediately if it threatens the core interaction.

### 2:00 to 2:30

Run tests, inspect the UI, and fix only submission-blocking defects.

### 2:30

Freeze features.
Begin rehearsals, fallback verification, recording, screenshots, and submission packaging.

### 3:15

Submit the final project with fifteen minutes of deadline margin.

## Absolute Stop Rules

- Do not build speech recognition before the core demo passes three consecutive times.
- Do not add multiple rooms, patients, caregivers, dashboards, analytics, reminders, or health tracking.
- Do not debug video for more than twenty minutes.
- Do not wait on stage for generated media beyond eight seconds.
- Do not show unvalidated generated room media.
- Do not show an unapproved or unlabeled family guide.
- Do not make a medical-effectiveness claim.
- Do not add a feature after the 2:30 feature freeze.
