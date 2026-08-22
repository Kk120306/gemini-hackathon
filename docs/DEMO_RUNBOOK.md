# ANCHOR Demo Runbook

## Demo Objective

Show that ANCHOR turns one verified room into a familiar six-question lesson and gives progressively clearer help without inventing personal history.

The avatar is supporting context.
The judged magic moment is the visible proof chain from Gemma observation to caregiver approval to progressive Gemini cue.

## Recommended Length

Keep the judged demonstration to approximately three minutes.

## Prepared Assets

Prepare only synthetic or explicitly consented assets:

- One to three images of the same bedroom.
- Two or three clear images of one trusted-person actor.
- Three to five obvious room objects.
- One caregiver-confirmed sequence or association.
- One cached guide portrait as a fallback.
- One cached simplified scene as a fallback.
- One cached short video as a fallback.

The live run should still initiate real image and video generation.
Video generation should begin asynchronously after guide approval rather than during patient interaction.
Cached assets exist only to protect the presentation from quota, latency, or network failures.

## Preflight

- [ ] Add a valid `GEMINI_API_KEY` to `.env.local`.
- [ ] Confirm the configured model names are available to the API key.
- [ ] Confirm paid access if the selected video model requires it.
- [ ] Start the app and verify environment validation.
- [ ] Run the primary end-to-end test.
- [ ] Run the production build.
- [ ] Reset local demo data.
- [ ] Confirm browser audio output.
- [ ] Confirm the target browser supports the chosen speech features.
- [ ] Confirm all prepared images are available locally.
- [ ] Open the caregiver start page before presenting.
- [ ] Disable unrelated notifications.

## Three-Minute Script

### 0:00 to 0:30

Introduce the problem and boundary:

> Generic exercises can feel unfamiliar. ANCHOR builds a tiny, caregiver-verified model of one real room and never invents personal memories.

Enter the patient's first name and upload the bedroom images.

### 0:30 to 1:00

Show Gemma's three-to-five object proposals.
Edit one object or location to emphasize caregiver control.
Open one grounding card and show the source crop, Gemma observation, and caregiver-approved value.
Approve the world model.

### 1:00 to 1:25

Upload the trusted-person references, enter the relationship, and confirm consent.
Generate and approve the AI-labeled family guide.
Start video generation in the background and continue immediately.

### 1:25 to 1:45

Generate the six-question lesson.
Point out the four environmental questions and two cognitive activities.
Approve the lesson.

### 1:45 to 2:40

Enter patient mode.
Let the guide ask a location question.
Choose the wrong answer.
Show the gentle verbal cue.
Choose another wrong answer or request help.
Show the immediate focus overlay while live image generation runs.
Swap to the validated simplified room scene when ready.
Choose the correct answer.

### 2:40 to 3:00

Show one cognitive activity briefly.
Show the short generated guide video only if it is already ready, or keep the static fallback without commentary.
Close with the safety boundary:

> Every personal detail is visually observed or caregiver-confirmed. ANCHOR supports engagement and does not diagnose or score the patient.

Recommended final line:

> ANCHOR does not ask someone with dementia to enter an unfamiliar digital world. It brings gentle engagement into the world they already know.

## Fallback Ladder

### Object Analysis Failure

Load the seeded world-model fixture and explain that the same caregiver approval step remains mandatory.

### Guide Image Failure

Use the cached approved portrait and keep the AI-generated label visible.

### Live Room Image Failure

Keep the deterministic dimming and highlight overlay visible.
Continue the lesson without retrying on stage.
Do not wait longer than eight seconds before proceeding.

### Video Failure

Keep the static encouraging guide expression visible.
Do not wait for or retry video generation on stage.

### Speech Failure

Use the visible prompt and replay control.
Continue with large answer buttons.

## Presenter Guardrails

- Do not call the experience treatment or therapy.
- Do not imply the guide is the real family member.
- Do not claim that generated media always preserves reality perfectly.
- Do not show real patient data without explicit permission.
- Do not spend presentation time on settings, infrastructure, or optional speech recognition.
- Keep the core differentiator focused on verified context and progressive visual cueing.
- Describe the avatar as an AI-generated guide based on the trusted person rather than as the person.
- Do not claim that a successful answer demonstrates cognitive improvement.

## Magic Moment Pass Criteria

- The judge can identify the original room image.
- The judge can see what Gemma observed and what the caregiver approved.
- The patient receives immediate feedback after an incorrect answer.
- The room becomes progressively easier to interpret.
- The patient reaches the correct answer without a score or negative feedback.
- The flow remains polished when the live image or video asset is unavailable.
