# ANCHOR Safety and Privacy

## Product Position

ANCHOR is a supportive cognitive engagement prototype.
It is not a diagnostic tool, treatment, medical device, monitoring system, or substitute for professional care.

## Non-Invention Rule

ANCHOR must never invent personal memories, relationships, routines, possessions, preferences, quotes, or emotional history.

A personalized statement is permitted only when it is supported by:

- A visible fact in an uploaded room image.
- A caregiver-entered fact that the caregiver explicitly confirmed.

General task knowledge may be used only when it does not become a claim about the patient.
For example, `glasses can be used for reading` is general knowledge.
The statement `you always read before bed` is prohibited unless the caregiver explicitly entered and confirmed it.

## Likeness and Consent

- Require explicit caregiver confirmation before generating a trusted person's likeness.
- Record who confirmed consent and when.
- Require two or three reference images that the caregiver is authorized to use.
- Label the portrait and video as AI-generated.
- Never imply that the guide is a live call, recording, or real-time message from the person.
- Never infer the person's relationship from their appearance.
- Never generate the guide before the name and relationship are entered by the caregiver.
- Allow the caregiver to reject and delete generated candidates.

## Voice

The MVP must not clone or imitate the trusted person's voice.
Use a generic device or service voice for speech synthesis.
Keep visible text available whenever speech plays.

## Avatar Trust Boundary

The guide should use a warm, lightly stylized visual treatment rather than attempting seamless photorealistic impersonation.
The first guide appearance must identify it as an AI-generated guide based on the caregiver-approved trusted person.
The AI-generated label must remain adjacent to the guide rather than appearing only in setup or legal copy.

The guide may use the caregiver-entered name and relationship.
It must not speak as if it has personal memories, current awareness, or a live connection to the trusted person.
It must not claim that the trusted person created, recorded, or sent the message.

The caregiver must be able to reject the guide.
The patient experience must retain a neutral non-likeness fallback when the generated guide is unsuitable or confusing.

## Patient Interaction

- Use neutral, adult, respectful language.
- Avoid childish praise, pressure, countdowns, and alarms.
- Do not say that an answer is easy or obvious.
- Do not display scores, streaks, cognitive levels, or failure counts.
- Do not infer decline from an incorrect answer.
- Allow the patient to request help at any time.
- Reveal the answer calmly after progressive cues are exhausted.
- Provide a visible way to stop or leave the lesson.

Recommended encouragement:

> Take your time. We can look together.

Prohibited feedback:

> You should remember this.

## Generated Room Media

Generated room images can misrepresent the patient's real environment.
Every generated scene must be validated before display.

Reject a scene when it:

- Moves or removes the target object.
- Changes the target object's defining appearance.
- Changes the verified location.
- Introduces a misleading answer object.
- Adds a person.
- Adds instructions, labels, arrows, or answer text.
- Changes the room enough that it is no longer recognizable.

Use deterministic dimming, cropping, and highlighting whenever validation fails.

## Cognitive Activities

The visual recall and sequencing or association questions are engagement activities.
They must never be described as tests or assessments.
They must not produce a clinical interpretation or caregiver-facing score.

Sequencing content requires caregiver verification because an ordinary sequence may not reflect the patient's routine or abilities.
Association content should rely on simple, common object relationships and must not imply a personal habit.

## Claims and Evidence

Do not claim that ANCHOR improves cognition, slows decline, treats dementia, or produces a clinical benefit.
The acceptable claim is that ANCHOR creates caregiver-verified engagement activities grounded in a familiar environment.

Product demonstrations may describe intended experience and observed interface behavior.
They must not generalize a successful demo answer into evidence of medical effectiveness.

## Data Minimization

Collect only the information needed for the demo:

- Patient first name or preferred form of address.
- One room name.
- One to three room images.
- Three to five verified objects.
- Trusted person's name and relationship.
- Two or three trusted-person reference images.
- Consent metadata.
- One approved guide.
- One approved six-question lesson.
- Ephemeral lesson progress.

Do not collect diagnoses, medication information, addresses, contact information, or health records.

## Local Data Handling

- Store local demo data under the ignored `.data` directory.
- Do not commit personal photos, generated likenesses, transcripts, or profiles.
- Do not log image bytes or sensitive metadata.
- Provide a visible demo reset that deletes local personal data after explicit confirmation.
- Use synthetic or consented assets for public demonstrations.
- Do not retain speech transcripts by default.

## API and Logging

- Keep API keys on the server.
- Avoid including names or relationships in logs.
- Log stable identifiers, operation status, duration, model name, and validation outcome.
- Redact model requests in production-like logs.
- Surface model failures without exposing internal prompts or credentials.

## Demo Disclosure

Before presenting ANCHOR, state that:

- The patient and family data are synthetic or used with permission.
- The family guide and some room visuals are AI-generated.
- The app is an engagement prototype and not medical advice.
- The caregiver verifies all personal information before patient use.

## Safety Acceptance Checklist

- [ ] Every lesson fact resolves to visual or caregiver evidence.
- [ ] Likeness consent is recorded before guide generation.
- [ ] The guide is labeled as AI-generated.
- [ ] The guide uses a lightly stylized treatment or a neutral non-likeness fallback.
- [ ] No cloned voice is used.
- [ ] The lesson contains no clinical score or inference.
- [ ] Incorrect-answer copy is neutral and respectful.
- [ ] Generated room media passes validation or falls back safely.
- [ ] Speech recognition has a visible control fallback.
- [ ] Personal media is ignored by version control.
- [ ] The demo can be reset after use.
- [ ] Every demonstrated question has an inspectable grounding record.
- [ ] Presenter language makes no cognitive-improvement or treatment claim.
