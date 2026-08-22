# ANCHOR AI and Data Contracts

## Contract Principles

Model output is a proposal, not trusted application state.
Every structured response must be parsed and validated before use.
Every personalized fact must be traceable to an uploaded image or caregiver confirmation.
Prompts must request concise, literal language suitable for a calm patient experience.

## Core Domain Types

```ts
type ApprovalState = "draft" | "approved" | "rejected";

type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WorldObject = {
  id: string;
  name: string;
  location: string;
  description: string;
  boundingBox: BoundingBox;
  sourceImageId: string;
  groundingRecordId: string;
  approval: ApprovalState;
};

type WorldModel = {
  id: string;
  roomName: string;
  revision: number;
  objects: WorldObject[];
  approval: ApprovalState;
};
```

Bounding-box values use normalized coordinates from zero through one.
Every approved object must reference a real uploaded image.

## Grounding Ledger Contract

```ts
type GroundingRecord = {
  id: string;
  sourceType: "visual" | "caregiver";
  sourceImageId?: string;
  sourceCrop?: BoundingBox;
  modelObservation?: string;
  caregiverValue: string;
  caregiverConfirmedAt: string;
  caregiverConfirmedBy: string;
  approval: ApprovalState;
};
```

The model observation is immutable evidence of what Gemma proposed.
The caregiver value is the only value allowed to become a personalized lesson fact.
Every approved lesson question must reference all grounding records needed to justify its prompt, answer, and cue.

## Object Analysis Contract

Gemma receives one to three room images and a request for three to five useful, clearly visible objects.
The response must contain only literal visual observations.

Required response shape:

```json
{
  "roomNameSuggestion": "Bedroom",
  "objects": [
    {
      "name": "glasses",
      "location": "bedside table",
      "description": "black reading glasses",
      "sourceImageIndex": 0,
      "boundingBox": {
        "x": 0.62,
        "y": 0.48,
        "width": 0.12,
        "height": 0.08
      },
      "confidence": "high"
    }
  ]
}
```

Validation rules:

- Return three to five objects when the images support them.
- Reject bounding boxes outside the normalized image area.
- Reject empty or overly broad object names such as `thing`.
- Treat model confidence as advisory only.
- Never infer ownership, emotional significance, habits, or memories.
- Never describe a location more specifically than the image supports.

## Trusted-Person Contract

```ts
type TrustedPerson = {
  id: string;
  name: string;
  relationship: string;
  referenceImageIds: string[];
  likenessConsent: true;
  consentedBy: string;
  consentedAt: string;
};
```

Guide generation is blocked unless `likenessConsent` is true and at least two valid reference images exist.
The relationship is caregiver-entered and is never inferred from images.

## Guide Image Contract

The guide prompt should request a warm, front-facing portrait with a simple background, natural lighting, direct gaze, and no embedded text.
The prompt should preserve the person's recognizable appearance without changing apparent age, ethnicity, or distinctive features.

The generated guide must:

- Use only approved reference images.
- Avoid uniforms, medical settings, fantasy styling, or distracting accessories.
- Avoid implying that the image is a live call.
- Avoid embedded words or claims.
- Be labeled as AI-generated in the UI.
- Require caregiver approval before patient display.
- Use a warm, lightly stylized visual treatment rather than seamless photorealistic impersonation.
- Preserve a visible AI-generated label in patient mode.

Optional expression variants are `neutral`, `encouraging`, and `celebrating`.

## Lesson Contract

```ts
type QuestionType =
  | "object_recognition"
  | "location_matching"
  | "visual_search"
  | "visual_recall"
  | "sequencing"
  | "association";

type CognitiveSkill =
  | "recognition"
  | "spatial_orientation"
  | "attention"
  | "short_term_memory"
  | "sequencing"
  | "semantic_association";

type LessonQuestion = {
  id: string;
  type: QuestionType;
  cognitiveSkill: CognitiveSkill;
  prompt: string;
  objectIds: string[];
  sourceImageId: string;
  groundingRecordIds: string[];
  correctAnswer: string;
  choices: string[];
  verbalCue: string;
  encouragement: string;
  visualCueStrategy: "focus_box" | "simplify_scene" | "object_closeup";
  requiresCaregiverVerifiedSequence: boolean;
};

type Lesson = {
  id: string;
  worldModelId: string;
  worldModelRevision: number;
  questions: LessonQuestion[];
  approval: ApprovalState;
};
```

Lesson validation rules:

- Require exactly six questions.
- Require exactly one `visual_recall` question.
- Require exactly one `sequencing` or `association` question.
- Require four other questions from recognition, location matching, and visual search.
- Require two or three distinct answer choices.
- Require the correct answer to appear exactly once in `choices`.
- Require every referenced object identifier to exist in the approved world model.
- Require every grounding record to exist and be caregiver-approved.
- Require the source image to contain the referenced object.
- Require sequencing steps to be explicitly caregiver-confirmed.
- Keep prompts and cues to one short sentence whenever possible.
- Avoid childish language, tests, scores, countdowns, and negative feedback.

Example cognitive question:

```json
{
  "id": "question-5",
  "type": "visual_recall",
  "cognitiveSkill": "short_term_memory",
  "prompt": "Which object did you just see beside the bed?",
  "objectIds": ["glasses"],
  "sourceImageId": "room-1",
  "groundingRecordIds": ["grounding-glasses-location"],
  "correctAnswer": "glasses",
  "choices": ["glasses", "blue mug", "book"],
  "verbalCue": "It is something you wear.",
  "encouragement": "Take your time. We can look together.",
  "visualCueStrategy": "object_closeup",
  "requiresCaregiverVerifiedSequence": false
}
```

## Cue Decision Contract

The allowed cue levels are:

```ts
type CueLevel = "none" | "verbal" | "focus" | "simplified" | "reveal";
```

The model may recommend one next cue from the allowed list and explain which verified fact supports it.
Application code ignores recommendations that skip a level or reference unverified information.

The application owns the transition:

```text
incorrect answer or help request
    -> advance exactly one level
    -> render immediate deterministic cue
    -> prefetch generated media without blocking
```

## Simplified Room Image Contract

The image-generation request includes the original room image, the target object's verified description, and its verified location.
It asks Gemini to reduce irrelevant visual clutter while preserving the room layout, target object, target location, camera angle, lighting, and identity of all important objects.

The generated scene must not:

- Move the target object.
- Change the target object's color or type.
- Add a person.
- Add text, arrows, labels, or answer words.
- Remove safety-relevant room features.
- Introduce a new object that could be mistaken for an answer.

The `focus` cue should normally use CSS dimming and highlighting.
The generated scene is reserved for the `simplified` cue.

## Generated Media Validation Contract

```ts
type MediaValidation = {
  targetObjectPresent: boolean;
  targetLocationPreserved: boolean;
  roomIdentityPreserved: boolean;
  misleadingContentIntroduced: boolean;
  safeToDisplay: boolean;
  conciseReason: string;
};
```

The media may be displayed only when `safeToDisplay` is true and all preservation checks pass.
The validator must fail closed when uncertain.

## Guide Video Contract

The demo video should be three to five seconds and generated from the approved guide portrait.
It should contain a small natural gesture or encouraging expression.
It must not contain cloned speech, a claim of being live, or an invented personal statement.
The UI should present equivalent text and a static image before the video is ready.

## Speech Contract

Browser speech synthesis may read approved prompt, cue, and encouragement text.
The MVP must use a generic system voice.

Optional speech recognition accepts only constrained intents:

```ts
type SpeechIntent =
  | { type: "select_answer"; answer: string }
  | { type: "repeat" }
  | { type: "help" }
  | { type: "unknown" };
```

Speech transcripts should not be persisted by default.
An unknown transcript must not be sent into an open-ended conversation.

## Retry and Timeout Contract

- Structured text generation may retry once after schema failure.
- Image generation may retry once with a stricter preservation prompt.
- Video generation should not retry during the patient lesson.
- Timeouts must resolve to a typed failure rather than an indefinite loading state.
- Every AI operation must have a deterministic user-visible fallback.
- The stage experience must continue after eight seconds without waiting for an unfinished media operation.
