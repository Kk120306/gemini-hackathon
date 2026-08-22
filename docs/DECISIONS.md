# ANCHOR Decision Log

## AD-001: One-Room Vertical Slice

Status: Accepted

ANCHOR supports one patient, one familiar room, one trusted person, and one lesson for the hackathon.
This keeps the demonstration focused on verified familiar-room recognition, orientation, recall, association, and progressive visual cueing.

## AD-002: Six Questions With Two Cognitive Activities

Status: Accepted

The lesson contains exactly six questions.
Four questions cover object recognition, location matching, or visual search.
One question covers short-term visual recall.
One question covers caregiver-confirmed sequencing or simple association.
All six questions provide cognitive practice through caregiver-approved familiar-room evidence.
The visual-recall and sequencing or association questions remain the exactly two designated higher-memory activities.

The app does not score or interpret performance.

## AD-003: Generated Family Guide With Consent

Status: Accepted

The guide is generated from one to three caregiver-provided reference photos.
One clear authorized portrait supports the common single-photo setup, while additional views can improve consistency.
The caregiver must enter the relationship, confirm likeness consent, and approve the result.
The guide is visibly labeled as AI-generated.
The feature is consented portrait-conditioned generation with one-to-one likeness-consistency validation, not facial recognition, biometric identification, or identity search.
Voice cloning is excluded.

## AD-004: Live Generative Media With Deterministic Fallbacks

Status: Accepted

Live Gemini image generation is part of the progressive-cue demonstration.
The UI renders an immediate CSS-based focus cue and replaces it only with validated generated media.

One independently validated generated video is required for the live demonstration when provider access is available.
Approved questions may request clips opportunistically, but the static guide remains the fallback and the lesson never waits on video.

## AD-005: Application-Controlled Cue State Machine

Status: Accepted

Application code owns the sequence `none`, `verbal`, `focus`, `simplified`, and `reveal`.
A model may recommend wording or the minimum next cue, but it cannot skip states or reveal unverified information.

## AD-006: Hosted Gemma and Gemini Through One API

Status: Accepted

The MVP uses hosted Gemma through the Gemini API instead of requiring a local model runtime.
Gemini services use the same server-side API key for validation, image generation, and video generation.
All model identifiers remain configurable.

## AD-007: Local Storage First

Status: Accepted

The hackathon implementation stores JSON and media under an ignored `.data` directory through a storage adapter.
Cloud persistence is deferred until the complete local flow works.

## AD-008: Approved Synthetic Speech Only

Status: Accepted

Gemini native speech or text-to-speech reads exact approved content using a fixed neutral synthetic voice.
Generic browser speech and visible text remain the deterministic fallbacks.
The provider never receives a trusted-person voice reference and never attempts to clone or imitate that person's voice.
Optional push-to-talk speech recognition maps only to visible answers, repeat, or help.
Open-ended conversation is excluded from the core demo.

## AD-009: The Room-to-Cue Interaction Is the Product

Status: Accepted

The verified transformation from familiar-room evidence to recognition, orientation, recall, association, and progressive visual cueing is the headline feature.
The family guide, video, and speech features are supporting elements and may not delay or obscure it.

## AD-010: Visible Grounding Ledger

Status: Accepted

Every approved object, question, answer, and cue references caregiver-approved evidence.
The caregiver interface exposes one concise evidence card so the stage demo can prove Gemma's role without showing raw JSON.

## AD-011: Stylized Guide Instead of Seamless Impersonation

Status: Accepted

The generated family guide uses a warm, lightly stylized visual treatment and a persistent AI-generated label.
A neutral non-likeness fallback is always available.

## AD-012: Prefetch Images and Generate Video During Setup

Status: Accepted

The simplified room image is prefetched after the first incorrect answer and displayed only at the correct cue level after validation.

Gemini 3.1 Flash Lite Image is the default for the single-reference interactive room edit.
It passed the preservation gate locally with lower end-to-end latency than Gemini 3.1 Flash Image, while the model identifier remains configurable.
The short guide video begins after static-guide approval and runs in parallel with lesson setup.

## AD-013: Feature Freeze and Stage Time Budgets

Status: Accepted

The stage flow continues after eight seconds without waiting for media.
Optional work starts only after three consecutive successful core rehearsals.
Hackathon feature work stops at 2:30 so submission and presentation quality can be protected.

## AD-014: Gemma Plans Grounded IDs, Application Code Writes Patient Copy

Status: Accepted

Gemma selects approved object IDs, location IDs, and question types for exactly six questions.
Application code deterministically compiles patient prompts, choices, answers, encouragement, and cues from caregiver-approved evidence.
Each spoken prompt is one conversational room task, while exactly three grounded evidence clues remain visible as secondary support.
Generic trivia, unsupported habitual-location claims, and pressuring memory-test language fail validation.
This boundary prevents model-generated wording from introducing an unverified fact after the structured plan passes validation.

## AD-015: Room Uploads Remain Server-Private

Status: Accepted

The browser sends a selected room image to a server action as validated base64 data.
The server checks its declared MIME type, byte signature, and decoded size before a live model call.
Accepted media is stored under the ignored local data directory and served by a private no-store route.
No Gemini credential or personal upload path is exposed to client code.

## AD-016: Quiet Reference UI With the Room as the Hero

Status: Accepted

The updated mockup supplies the warm canvas, Figtree typography, sage actions, rounded controls, progress treatment, and two-column patient composition.
The implementation does not copy prototype-only navigation or decorative elements that compete with the verified room evidence.
The room remains dominant on patient start and patient activity screens.
The generated guide stays visibly labeled but remains a supporting element.

## AD-017: Generated Room Media Uses an Independent Preservation Gate

Status: Accepted

The image generator receives only the approved room image, approved target, and literal simplification instruction.
A separate Gemini validation call compares the source and candidate images before storage or display.
The candidate must preserve the target object, target location, and room identity without introducing misleading content.
Malformed or unsafe validation fails closed to the deterministic verified-room cue.
An eight-second patient-stage budget may time out the visible job while allowing a late safe result to be staged for the next explicit interaction.

## AD-018: The Approved Room Image Is the Spatial Activity Surface

Status: Accepted

The patient answers five lesson activities by touching large regions projected from caregiver-approved normalized object boxes directly over the room image.
The remaining visual-recall activity lets the patient study the complete room without a timer, hides it only after explicit readiness, and asks for one exact upper or lower and left, middle, or right region.
The system derives only honest image-plane relationships and never presents a single photograph as a reconstructed three-dimensional space.
Gemma selects approved evidence identifiers, while deterministic application code compiles detailed prompts from visible attributes, verified locations, shared surfaces, and supported landmark relations.

## AD-019: Every Activity Requires a Three-Part Evidence Path

Status: Accepted

Every lesson activity has a named reasoning task and exactly three caregiver-approved evidence clues.
The compiler combines appearance, verified place, visible landmark, and image-region rules so an activity cannot collapse into generic object recognition.
Visual recall uses an untimed six-region row-and-column map rather than a broad left, middle, or right guess.
The plan must distribute targets across at least three approved objects, and no object may be the target more than twice.
The patient still receives neutral encouragement, progressive help, no timer, no score, and no clinical interpretation.

## AD-020: Use a Validated 2.5D Interpretation Instead of Claiming True 3D

Status: Accepted

Gemini may transform the approved source room into a realistic, perspective-preserving 2.5D composition during caregiver lesson review.
The composition can become the primary patient interaction surface only after an independent multimodal comparison confirms that every approved visible object, its image-plane location, the camera framing, and the room identity remain intact without misleading additions.
All answer hotspots continue to use caregiver-approved source coordinates, and the approved source image remains the deterministic fallback.
Subtle pointer perspective is a presentation effect, not a claim of measured depth, a room mesh, unseen geometry, or free-camera navigation from one photograph.

## AD-021: Real Raster Uploads Never Use Fixture Detections

Status: Accepted

Prepared demo imagery may use the deterministic fake provider.
Every caregiver-uploaded JPG, PNG, or WebP uses live Gemini vision whenever a server key is configured, even when `ANCHOR_DEMO_MODE` remains enabled for the rest of the rehearsal.
This prevents a real office photo from receiving unrelated bedroom objects and keeps the evidence ledger tied to the uploaded pixels.

## AD-022: Question-Specific Guide Clips With Static Fallback

Status: Accepted

After caregiver consent, independent portrait validation, and explicit guide approval, Gemini Omni Flash may animate the approved guide to ask the current deterministic lesson prompt.
Each clip uses a neutral synthetic voice, carries a persistent AI-generated and not-live label, and must pass independent one-person, likeness-consistency, facial-integrity, exact-dialogue, and safe-content validation before storage or display.
Generation is lazy and non-blocking, so the room, question text, static guide, generic browser speech, and visible text remain complete fallbacks.

## AD-023: Familiar-Room Practice Without Clinical Claims

Status: Accepted

ANCHOR is designed for people living with dementia to practice recognizing objects, orienting within one familiar room, recalling verified object locations, and associating objects with visible landmarks or caregiver-confirmed places.
This intended interaction may be described as memory practice or familiar-surroundings rehearsal.
It must not be described as making someone remember better, training or improving the brain, preventing dementia, slowing decline, treating symptoms, assessing cognitive ability, or producing clinical benefit.

## AD-024: Gemini Speech With a Deterministic Fallback Ladder

Status: Accepted

The primary spoken-question path uses Gemini native speech or text-to-speech with a fixed neutral synthetic voice and the exact caregiver-approved text.
Portrait consent never authorizes voice imitation, and ANCHOR does not accept a trusted-person voice reference.
Presentation falls back from a validated guide video to the static guide with Gemini speech, the static guide with generic browser speech, and finally the static guide with visible text only.
Audio and video generation never block room interaction or change deterministic lesson state.
