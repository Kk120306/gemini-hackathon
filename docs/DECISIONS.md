# ANCHOR Decision Log

## AD-001: One-Room Vertical Slice

Status: Accepted

ANCHOR supports one patient, one bedroom, one trusted person, and one lesson for the hackathon.
This keeps the demonstration focused on verification and progressive visual cueing.

## AD-002: Six Questions With Two Cognitive Activities

Status: Accepted

The lesson contains exactly six questions.
Four questions cover object recognition, location matching, or visual search.
One question covers short-term visual recall.
One question covers caregiver-confirmed sequencing or simple association.

The app does not score or interpret performance.

## AD-003: Generated Family Guide With Consent

Status: Accepted

The guide is generated from two or three caregiver-provided reference photos.
The caregiver must enter the relationship, confirm likeness consent, and approve the result.
The guide is visibly labeled as AI-generated.
Voice cloning is excluded.

## AD-004: Live Generative Media With Deterministic Fallbacks

Status: Accepted

Live Gemini image generation is part of the progressive-cue demonstration.
The UI renders an immediate CSS-based focus cue and replaces it only with validated generated media.

One short generated video is part of the demonstration.
The static guide remains the fallback and the lesson never waits on video.

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

## AD-008: Constrained Speech Only

Status: Accepted

Browser speech synthesis reads approved content using a generic voice.
Optional push-to-talk speech recognition maps only to visible answers, repeat, or help.
Open-ended conversation is excluded from the core demo.

## AD-009: The Room-to-Cue Interaction Is the Product

Status: Accepted

The verified transformation from room evidence to progressive visual cue is the headline feature.
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
The short guide video begins after static-guide approval and runs in parallel with lesson setup.

## AD-013: Feature Freeze and Stage Time Budgets

Status: Accepted

The stage flow continues after eight seconds without waiting for media.
Optional work starts only after three consecutive successful core rehearsals.
Hackathon feature work stops at 2:30 so submission and presentation quality can be protected.
