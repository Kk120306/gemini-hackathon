# ANCHOR Product Requirements

## Problem Statement

People living with dementia can find generic cognitive exercises abstract, unfamiliar, or stressful.
Caregivers need a simple way to create gentle engagement activities grounded in the patient's real surroundings and trusted relationships.
Existing tools often require manual lesson authoring or use generic content that lacks personal context.

The hackathon needs a focused demonstration rather than a complete care platform.
The demonstration must prove that verified household context and progressive visual cueing can create a more familiar interaction without inventing personal history.

## Solution

ANCHOR lets a caregiver upload images of one bedroom and a trusted family member.
Gemma proposes a small personal world model containing visible objects and their locations.
The caregiver confirms or edits every object before it can be used.

ANCHOR then generates a caregiver-approved family guide and a six-question lesson based on the verified objects.
The approved room image becomes the interaction surface, with large touch targets projected over verified object regions rather than detached answer cards.
The patient completes the lesson through this calm spatial interface.
When the patient struggles, ANCHOR gives the minimum next cue and progressively simplifies the visual scene.

The demo includes live Gemini image generation and one short Gemini video-generation moment.
Deterministic overlays, static expressions, and text remain available whenever generative media is slow or unavailable.

## Goals

- Demonstrate a complete caregiver-to-patient flow with one room.
- Ground all personalized content in observed or caregiver-confirmed facts.
- Generate a familiar family guide with explicit caregiver consent.
- Deliver six varied questions, including two cognitive exercises.
- Make every question require a three-part evidence path assembled from visible attributes, verified locations, landmarks, or image-plane spatial rules.
- Distribute the six targets across at least three approved objects so the lesson cannot repeat one easy answer.
- Let the patient answer directly in the familiar room image.
- Demonstrate progressive cueing after an incorrect answer.
- Demonstrate live image generation without making it a single point of failure.
- Demonstrate one short generated guide or cue video.
- Present a calm and accessible patient experience.

## Hackathon Product Thesis

The product is the verified room-to-cue interaction.
The family guide supports familiarity, but it is not the headline feature.
The winning demonstration must show Gemma turning visible evidence into a caregiver-approved world model and Gemini turning that evidence into the minimum helpful visual cue.

ANCHOR should be positioned primarily for Best Elderly Hack and secondarily for Best Use of Gemma.
Most Creative Gemini Hack is a credible third track when the live scene transformation works reliably.

The stage promise is:

> ANCHOR helps people living with dementia engage with familiar spaces, one verified and gentle cue at a time.

## User Stories

1. As a caregiver, I want to create a simple patient profile, so that the lesson can address the patient appropriately.
2. As a caregiver, I want to upload one to three bedroom images, so that ANCHOR can use the patient's real environment.
3. As a caregiver, I want ANCHOR to suggest three to five visible objects, so that setup remains fast.
4. As a caregiver, I want to see where each detected object appears, so that I can verify the model's interpretation.
5. As a caregiver, I want to edit an object's name and location, so that incorrect suggestions never enter the lesson.
6. As a caregiver, I want to remove an unsuitable object, so that the lesson remains respectful and useful.
7. As a caregiver, I want to approve the final world model, so that only verified facts are used.
8. As a caregiver, I want to upload two or three images of a trusted person, so that ANCHOR can create a consistent guide.
9. As a caregiver, I want to enter the trusted person's name and relationship, so that the guide can be introduced accurately.
10. As a caregiver, I want to confirm consent for likeness generation, so that image generation is explicit and accountable.
11. As a caregiver, I want to approve or regenerate the family guide, so that an unsuitable image is never shown to the patient.
12. As a caregiver, I want the guide clearly labeled as AI-generated, so that it is not mistaken for a live person.
13. As a caregiver, I want ANCHOR to generate exactly six questions, so that the demo lesson is substantial but predictable.
14. As a caregiver, I want to preview every question, answer, and cue, so that I can catch inaccurate or insensitive content.
15. As a caregiver, I want to regenerate or edit a question before approval, so that the lesson remains grounded and clear.
16. As a patient, I want one short instruction at a time, so that the lesson is easy to follow.
17. As a patient, I want large answer controls, so that I can interact without precise tapping.
18. As a patient, I want the prompt spoken aloud, so that reading is not required.
19. As a patient, I want to replay the prompt, so that I can listen again without penalty.
20. As a patient, I want calm encouragement after an incorrect answer, so that the lesson does not feel punitive.
21. As a patient, I want visual cues that become clearer gradually, so that I can still solve the activity myself.
22. As a patient, I want the full answer revealed only after progressive help, so that the interaction remains supportive.
23. As a patient, I want a simple progress indicator, so that I know the lesson is finite.
24. As a patient, I want positive feedback after a correct answer, so that the guide feels encouraging.
25. As a patient, I want a detailed visual recall activity, so that I can bind a familiar object to its surface, row, and column before the room is hidden.
26. As a patient, I want a multi-evidence sequencing or association activity, so that I can reason from a visible landmark, a verified surface, and a second object's appearance.
27. As a patient, I want to ask for help through a visible button, so that speech recognition is never required.
28. As a patient, I want reduced motion when my device requests it, so that generated media does not create discomfort.
29. As a demo presenter, I want the live image-generation step to have an immediate fallback, so that network latency cannot stop the lesson.
30. As a demo presenter, I want the generated video to be limited to one controlled moment, so that the core flow remains reliable.
31. As a developer, I want every model response validated against a schema, so that malformed output cannot corrupt the session.
32. As a developer, I want AI providers behind interfaces, so that model versions and fallbacks can change without rewriting the UI.
33. As a developer, I want a seeded demo fixture, so that the complete experience can be rehearsed without consuming API quota.
34. As a reviewer, I want the app to avoid clinical claims and scoring, so that the demo is presented as engagement rather than diagnosis or treatment.
35. As a caregiver, I want to see the evidence behind every object and question, so that I can identify unsupported claims before approval.
36. As a judge, I want to see one visible proof chain from room image to question to cue, so that Gemma's role is meaningful and auditable.
37. As a patient, I want the family guide identified as AI-generated without confusing visual treatment, so that familiarity does not become impersonation.
38. As a demo presenter, I want the prepared caregiver path to complete within 90 seconds, so that the patient interaction remains the focus.
39. As a patient, I want to touch an object where it appears in the room, so that the activity stays connected to a familiar space.
40. As a patient, I want questions to name verified color, shape, material, location, or spatial relationships, so that each activity provides a meaningful observation task.
41. As a patient, I want a recall activity with no timer, so that I can study the room before choosing an exact upper or lower and left, middle, or right region.
42. As a patient, I want every activity to show the evidence path I should use, so that the lesson exercises observation and reasoning rather than guessing from a generic prompt.

## Required Demo Flow

1. The caregiver enters the patient's first name.
2. The caregiver uploads one to three bedroom images.
3. Gemma proposes three to five objects, locations, descriptions, normalized bounding boxes, and evidence records.
4. The caregiver confirms or edits the proposals.
5. The caregiver uploads two or three images of one trusted person.
6. The caregiver enters the person's name and relationship and confirms consent.
7. Gemini generates a guide portrait and optional expression variants.
8. The caregiver approves the guide.
9. Gemma generates six questions from the approved world model.
10. The caregiver previews and approves the lesson.
11. The patient starts the lesson.
12. The patient answers by touching one of the large verified object regions projected over the room image.
13. The patient answers at least one question incorrectly.
14. ANCHOR gives a verbal cue and immediately applies a deterministic visual focus effect.
15. Gemini generates a simplified version of the scene in the background.
16. ANCHOR displays the generated scene only if it preserves the verified object and location.
17. The patient receives a stronger highlight or close-up after another incorrect answer.
18. The patient selects the correct object in the room.
19. The guide celebrates and moves to the next question.
20. One controlled lesson moment uses a short generated video.
21. The lesson ends with a calm completion message and no score.

## Lesson Composition

The lesson contains exactly six questions:

1. One object-recognition question.
2. One location-matching question.
3. One visual-search question.
4. One second recognition, location, or visual-search variant.
5. One short-term visual-recall activity.
6. One caregiver-confirmed sequencing or association activity.

The last two questions are the required cognitive activities.
The lesson must not evaluate or label cognitive ability.
Five activities use direct object selection inside the approved room image.
The visual-recall activity first shows the complete room without a timer, asks the patient to bind the target to a surface, row, and column, then hides the image and exposes six exact regions.
Every activity presents exactly three approved evidence clues and asks the patient to satisfy the complete evidence path rather than match one obvious attribute.
The activities include three-clue identification, complete location claims, landmark-guided search, systematic scene search, six-region object-place recall, and shared-surface or landmark association.
Application code must reject generic prompts such as `Which object is this?` or `Where does this belong?`.
The six targets must span at least three approved objects, and no object may be the target more than twice.

## Grounding Ledger

Every approved object, question, answer, and cue must resolve to a grounding record.
The caregiver UI should show the relevant source image or crop, Gemma's literal observation, any caregiver correction, and approval state.

The stage demo must expose one concise proof chain:

```text
bedroom image
    -> Gemma observed glasses on the bedside table
    -> caregiver confirmed the observation
    -> lesson asked where the glasses belong
    -> cue highlighted the verified bedside-table region
```

A question cannot enter an approved lesson when any required grounding record is missing or unapproved.

## Progressive Cue Policy

Each question can move through these cue levels:

1. `none`: Show the original image and the initial prompt.
2. `verbal`: Give one short location or feature hint.
3. `focus`: Dim irrelevant areas and highlight the verified target region.
4. `simplified`: Display a validated Gemini-generated simplified scene when available.
5. `reveal`: Show the answer plainly and continue without judgment.

The app advances only one cue level at a time after an incorrect answer or explicit help request.
The model may recommend the next cue, but application code enforces the allowed sequence.

## Functional Requirements

- All uploads must have visible progress, success, and failure states.
- The caregiver must approve the world model before lesson generation.
- The caregiver must approve the generated guide before patient mode.
- The caregiver must be able to preview the complete lesson.
- All generated structured data must pass runtime validation.
- Generated media must retain its original source reference and generation status.
- The patient UI must support touch and keyboard input.
- The patient UI must work without speech recognition.
- Generated media failures must not reset lesson progress.
- Demo mode must provide deterministic fixtures and cached media.
- The caregiver must be able to inspect one grounding record without viewing raw JSON.
- The guide must be described as an AI-generated guide based on the trusted person.
- The guide must remain a supporting element and must not obscure the room image or answer controls.
- The approved room image must be the answer surface for every non-recall activity.
- Object hotspots must derive from approved normalized bounding boxes and stay aligned when the image is contained responsively.
- Small detected objects must receive at least a 64 by 64 CSS pixel touch region without changing the evidence location.
- Spatial claims must describe only relationships visible in the image plane or caregiver-confirmed facts.

## Non-Functional Requirements

- Patient touch targets should be at least 64 by 64 CSS pixels.
- Patient body text should normally be at least 24 CSS pixels.
- The patient screen should avoid scrolling at the target tablet viewport.
- Critical button labels must not rely on icons alone.
- Focus indicators must remain visible.
- Motion must be limited and respect reduced-motion preferences.
- Secrets and model calls must remain server-side.
- Personal images must not be committed to version control.
- Model timeouts must produce a recoverable fallback state.
- The core lesson must remain usable when image, video, speech synthesis, or speech recognition fails.

## Success Criteria

- A new caregiver can complete setup without editing raw JSON.
- The app produces three to five caregiver-confirmed objects from the bedroom images.
- The app produces an approved family guide from reference photos.
- The app produces six valid, grounded questions with exactly two cognitive activities.
- At least five questions are answered through verified spatial regions on the room image.
- The lesson includes one no-timer hide-and-recall activity using a six-region row-and-column map.
- Every patient activity exposes exactly three verified evidence clues that jointly distinguish its target from the other choices.
- The lesson targets at least three approved objects and never targets the same object more than twice.
- An incorrect answer visibly advances the cue sequence.
- A generated simplified scene can replace the deterministic overlay after validation.
- One short generated video appears without blocking the remainder of the lesson.
- The patient can finish the lesson entirely through visible controls.
- No generated copy invents memories, quotes, routines, or relationships.
- The complete seeded flow passes the primary end-to-end test.
- One visible grounding ledger entry proves the room-image-to-cue chain.
- The prepared caregiver portion of the stage demo completes within 90 seconds.
- No answer control waits for image or video generation.
- The guide remains visibly AI-generated and does not use photorealistic impersonation as its primary treatment.

## Implementation Decisions

- Build a single Next.js TypeScript application with separate caregiver and patient routes.
- Use hosted Gemma through the Gemini API for world-model extraction and lesson generation.
- Use a Gemini multimodal model to validate generated images against the verified world model.
- Use Gemini native image generation for guide portraits, expression variants, and simplified room scenes.
- Use Gemini Omni Flash for one short video-generation moment.
- Keep model names configurable through environment variables.
- Use local filesystem persistence for the hackathon and hide it behind a storage interface.
- Use normalized bounding boxes so visual overlays remain responsive.
- Use a deterministic cue state machine rather than allowing a model to control arbitrary actions.
- Generate lesson content during caregiver setup and cache it before entering patient mode.
- Start live visual generation during the lesson while showing a deterministic overlay immediately.
- Treat generated video as an enhancement with a static-guide fallback.
- Use browser speech synthesis and optional browser speech recognition.
- Do not implement voice cloning.

## Testing Decisions

- Test user-visible behavior rather than internal implementation details.
- Begin with one end-to-end test covering the complete seeded demo flow.
- Add schema contract tests for every structured AI response.
- Add domain tests for world-model approval, lesson composition, and cue progression.
- Add accessibility checks for the caregiver and patient routes.
- Add screenshot checks for the target tablet viewport.
- Use fake AI and storage adapters in automated tests.
- Run a small opt-in integration suite against real model endpoints before the demo.

## Out of Scope

- Authentication and authorization
- Multiple patients
- Multiple caregivers
- Multiple rooms or whole-home mapping
- Reminders and medication tracking
- Clinical assessments or cognitive scoring
- Long-term analytics
- Open-ended conversation
- Voice cloning
- Fully autonomous lesson publishing
- Real-time camera tracking
- Native mobile applications
- Production-grade cloud storage
- Production compliance certification

## Further Notes

ANCHOR is an engagement prototype, not a medical device.
The generated family guide must be introduced as an AI-generated visual guide based on caregiver-provided photos.
The caregiver remains the final authority for personal information and lesson suitability.
