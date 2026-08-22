# ANCHOR Architecture

## Architecture Goal

The system should deliver one reliable vertical slice while isolating model behavior, deterministic lesson logic, and persistence.
Network-dependent media generation must enhance the experience without controlling whether the patient can continue.

## System Context

```text
Caregiver browser
    -> Next.js caregiver routes
    -> Server actions and route handlers
    -> Gemma and Gemini provider adapters
    -> Local storage adapter

Patient browser
    -> Next.js patient routes
    -> Deterministic lesson session
    -> Gemini speech with browser-speech and text fallbacks
    -> Optional generated image or video assets
```

## Application Areas

### Caregiver Experience

The caregiver experience owns profile setup, room uploads, object verification, guide approval, lesson preview, and lesson approval.
No patient-facing route may use unapproved world-model or guide data.

### Patient Experience

The patient experience owns the six-question familiar-room practice session, speech playback, answer selection, help requests, cue progression, and completion state.
The patient experience does not call an unrestricted conversational model.

### Server Boundary

All AI calls, file writes, and secret access happen on the server.
The client receives validated domain objects and opaque media URLs.

## Deep Modules

### World Model Service

The World Model Service accepts a room image and returns object proposals from its actual pixels.
It normalizes and validates model output, assigns stable identifiers, and separates proposals from caregiver-approved objects.
Prepared demo imagery may use fixture proposals, but any uploaded JPG, PNG, or WebP routes to live Gemini vision whenever a server credential is configured, even when the rest of demo mode remains deterministic.

Interface responsibilities:

- Analyze room images.
- Validate object names, locations, descriptions, and bounding boxes.
- Reject unsupported or malformed proposals.
- Create an immutable approved world-model revision.

### Grounding Ledger

The Grounding Ledger stores the proof chain between source media, literal model observations, caregiver corrections, approved lesson claims, and visual cue regions.
It is append-only for each approved world-model revision so that a later edit cannot silently change an already approved lesson.

Interface responsibilities:

- Record the source image and crop for each observation.
- Record Gemma's literal observation separately from caregiver-edited values.
- Record caregiver confirmation time and approval state.
- Resolve every question, answer, and cue to approved evidence.
- Produce one concise caregiver-facing evidence card for the stage demonstration.

### Guide Service

The Guide Service accepts consent metadata and one to three trusted-person reference images for portrait-conditioned generation.
It creates an independently validated portrait and optional question-specific short videos.
It never generates speech in the trusted person's cloned voice.
It performs only one-to-one likeness-consistency validation and does not perform facial recognition, biometric identification, or identity search.

Interface responsibilities:

- Verify consent state before generation.
- Generate and store guide candidates.
- Track caregiver approval.
- Animate only an approved generated guide portrait and ask only the current validated lesson prompt.
- Validate that each clip contains one recognizable guide, the exact approved dialogue, neutral safe speech, and no call or messaging interface.
- Expose static fallback media for every animated state.

### Lesson Engine

The Lesson Engine accepts only an approved world model and builds a familiar-room rehearsal lesson rather than a generic cognitive quiz.
It asks Gemma for candidate content, validates grounding and room-practice purpose, enforces the six-question composition, and returns a draft for caregiver approval.
The model selects only a constrained plan of approved identifiers and activity types.
Deterministic application code expands that plan into named challenges, three-part evidence paths, instructions, answers, and progressive cues.

Interface responsibilities:

- Generate six questions.
- Make all six questions provide cognitive practice through approved room evidence.
- Keep four questions as direct recognition or orientation tasks and exactly two as designated higher-memory activities.
- Distribute targets across at least three objects and use no object more than twice.
- Ensure every object and location reference exists in the approved world model.
- Ensure sequencing content has explicit caregiver verification.
- Produce one conversational spoken prompt plus exactly three secondary grounded evidence clues, deterministic answer choices, detailed explanations, and cue metadata for every activity.
- Reject generic trivia, unsupported habitual-location claims, and pressuring memory-test language.

### Cue Engine

The Cue Engine is a pure deterministic state machine.
It accepts the current cue level and an incorrect-answer or help event and returns the next allowed cue level.
It may use a model recommendation only as advisory metadata.

Allowed sequence:

```text
none -> verbal -> focus -> simplified -> reveal
```

### Spatial Scene Engine

The Spatial Scene Engine converts caregiver-approved normalized object boxes into a deterministic image-plane scene model.
It can place those verified coordinates over either the approved source image or an independently validated Gemini 2.5D interpretation of that image.
It derives only image-plane facts such as left of, right of, above, below, and six-region row-and-column positions.
Perspective motion is a presentation effect and does not claim monocular depth measurements, room dimensions, occluded objects, or a reconstructed three-dimensional environment.

Interface responsibilities:

- Project normalized evidence boxes into a contained responsive image.
- Expand small projected boxes into accessible touch regions while preserving their centers.
- Derive unique landmark relationships when object separation crosses the configured threshold.
- Assign upper-left, upper-middle, upper-right, lower-left, lower-middle, or lower-right recall regions from verified object centers.
- Keep every spatial answer tied to the original source image and grounding record.

### Media Generation Service

The Media Generation Service hides Gemini image, video, and native speech APIs behind provider interfaces.
It stores job status and returns generated assets only after validation.

Interface responsibilities:

- Generate a guide portrait from approved reference photos.
- Generate guide expression variants.
- Generate a simplified room scene from an original image.
- Generate a perspective-preserving 2.5D room composition from an approved source image.
- Generate question-specific guide video from an approved portrait and exact approved dialogue.
- Generate neutral synthetic speech from exact approved patient-facing text.
- Record pending, completed, failed, timed-out, and rejected states.
- Return deterministic fallback instructions with every request.

### Media Validation Service

The Media Validation Service compares a generated scene with the approved world model and source image.
It checks that the target object remains present, the target location remains consistent, and no misleading person or object has been introduced.
Rejected media never appears in patient mode.

### Speech Service

The Speech Service receives only immutable approved prompt, cue, or encouragement text.
It requests a fixed neutral Gemini synthetic voice for the current approved text.
It never accepts trusted-person voice audio or attempts to imitate the approved guide's real-world voice.

Fallback order is deterministic:

```text
validated guide video with neutral Gemini-generated audio
    -> approved static guide with Gemini speech
    -> approved static guide with generic browser speech
    -> approved static guide with visible text only
```

Every stage preserves the room controls, replay control, and approved text.

### Session Engine

The Session Engine manages question order, selected answers, current cue level, speech replay, and completion.
It stores no cognitive score and makes no clinical inference.
For object-tap activities, it accepts only selected approved object identifiers projected over the room image.
For visual recall, it accepts one exact six-region answer after the patient explicitly hides the studied room.

### Storage Adapter

The Storage Adapter hides persistence behind a small interface.
The hackathon implementation uses local JSON and media files under `.data`.
A later cloud adapter can replace it without changing domain services.

## Route Shape

The planned routes are:

```text
/                         Project landing and mode selection
/caregiver                Setup progress
/caregiver/profile        Patient and trusted-person metadata
/caregiver/room           Room upload and analysis
/caregiver/world-model    Object confirmation
/caregiver/guide          Guide generation and approval
/caregiver/lesson         Lesson generation and preview
/patient                  Approved lesson start
/patient/session          Six-question experience
/patient/complete         Calm completion state
```

Route handlers or server actions should expose task-oriented operations rather than generic CRUD endpoints.

## Data Lifecycle

```text
Uploaded room images
    -> object proposals
    -> caregiver approval
    -> approved world-model revision
    -> Gemini spatial composition candidate
    -> independent source-and-candidate validation
    -> generated spatial scene or deterministic source fallback
    -> lesson draft
    -> caregiver approval
    -> immutable approved lesson
    -> patient session events

Uploaded family images + consent
    -> consented portrait-conditioned guide candidates
    -> caregiver approval
    -> approved guide assets
    -> exact approved question text
    -> question-specific Gemini video and neutral speech jobs
    -> independent likeness, transcript, and content validation
    -> patient presentation or static-guide, browser-speech, and text fallback
```

## Persistence Layout

The local adapter should keep data outside the source tree's tracked files:

```text
.data/
  anchor.json
  uploads/
    room/
    guide-references/
  generated/
    guide/
    room-cues/
    video/
  fixtures/
```

Every media record should contain its source identifiers, generation model, generation status, creation time, and approval status.

## Real-Time Media Strategy

The primary spatial composition is prefetched as soon as the six-question lesson passes runtime validation during caregiver review.
Direct patient entry also starts the job from the welcome screen when an approved prepared lesson has no existing media job.
If the candidate passes independent validation before patient mode, it becomes the labeled primary room surface.
If generation is pending, failed, timed out, disabled, or rejected, the approved source image remains fully interactive.
After an incorrect answer or help request, the UI immediately shows deterministic verbal and focus cues without waiting on media.
At the `simplified` cue level, a safe generated focus scene may crossfade in while unsafe or unavailable media preserves the deterministic overlay.

Guide video generation begins asynchronously when a patient question becomes active and only after the caregiver approves the static guide.
The current question, room interaction, and static guide remain immediately usable while the clip is pending.
The generated MP4 is stored under the ignored private media directory and served through a no-store route only after independent multimodal validation confirms one guide, likeness consistency, exact approved dialogue, neutral speech, and no live-call implication.
The static guide remains visible when video is pending, failed, rejected, disabled, or blocked by provider quota.

Gemini speech is requested only for the exact approved text.
If Gemini speech is unavailable, slow, invalid, or blocked by quota, the client uses a generic browser voice and then visible text without changing lesson state.

The stage script should wait no more than eight seconds for generated media before continuing with the fallback.
Late media may be shown only at a later safe transition and must never replace an image while the patient is choosing an answer.

## Failure Boundaries

- Invalid object analysis returns the caregiver to a retryable analysis state.
- Invalid lesson output is repaired or regenerated before caregiver preview.
- Image-generation failure preserves the deterministic cue.
- Video-generation failure preserves the static guide.
- Gemini speech failure falls back to generic browser speech and then readable text.
- Speech-recognition failure preserves large answer buttons.
- Storage failure produces a visible retry state and never silently discards caregiver approval.
- Missing grounding evidence blocks lesson approval rather than guessing or repairing the personal fact.
- An unsuitable or confusing avatar falls back to a neutral guide image.

## Security Boundary

The API key remains server-side.
Uploads are accepted only after MIME type, size, and decode validation.
Media paths are generated by the storage adapter rather than accepted from user input.
Logs must not contain image bytes, API keys, or full personal profiles.

## Deployment Boundary

Local filesystem persistence is the default hackathon mode.
If deployed to a serverless host, persistent object storage must be added before relying on cross-request files.
This infrastructure change is deferred until the local vertical slice works.
