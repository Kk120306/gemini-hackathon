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
  detectionConfidence: "low" | "medium" | "high";
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

Gemini vision receives one uploaded room image and a request for six to ten useful, clearly visible objects when the pixels support that many.
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

- Return six to ten distinct objects when the image supports them, with an absolute minimum of three.
- Omit uncertain objects instead of filling the response with fixture, placeholder, duplicate, or broad-region labels.
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

Guide generation is blocked unless `likenessConsent` is true and one to three valid reference images exist.
One clear authorized portrait is sufficient, but the candidate must still pass independent likeness validation.
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

type QuestionEvidenceClue = {
  kind: "appearance" | "place" | "landmark" | "spatial_rule";
  label: string;
  detail: string;
};

type LessonQuestion = {
  id: string;
  type: QuestionType;
  cognitiveSkill: CognitiveSkill;
  prompt: string;
  instruction: string;
  targetObjectId: string;
  objectIds: string[];
  selectableObjectIds: string[];
  referenceObjectId?: string;
  sourceImageId: string;
  groundingRecordIds: string[];
  correctAnswer: string;
  choices: string[];
  interactionMode: "tap_object" | "recall_zone";
  recallZone?:
    | "upper_left"
    | "upper_center"
    | "upper_right"
    | "lower_left"
    | "lower_center"
    | "lower_right";
  challengeTitle: string;
  evidenceClues: [
    QuestionEvidenceClue,
    QuestionEvidenceClue,
    QuestionEvidenceClue,
  ];
  verbalCue: string;
  encouragement: string;
  answerExplanation: string;
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
- Require the plan to target at least three approved objects and no object more than twice.
- Require every compiled activity to contain a named challenge and exactly three grounded evidence clues.
- Require two or three distinct answer choices for object-tap activities.
- Require the correct answer to appear exactly once in `choices`.
- Require every referenced object identifier to exist in the approved world model.
- Require every grounding record to exist and be caregiver-approved.
- Require the source image to contain the referenced object.
- Require object-tap activities to expose two or three unique approved selectable object identifiers including the target.
- Require recall-zone activities to expose no object hotspots and exactly six choices derived from the target box center's upper or lower row and left, middle, or right column.
- Require an optional reference landmark to be an approved evidence object and not a selectable answer.
- Require sequencing steps to be explicitly caregiver-confirmed.
- Compile patient-facing prompts, instructions, answers, explanations, and cues in deterministic application code.
- Prefer a concrete visible attribute, a verified surface, and a unique image-plane relation whenever the approved evidence supports them.
- Keep each prompt direct enough to follow in one step even when it includes several grounded details.
- Avoid childish language, tests, scores, countdowns, and negative feedback.

Example cognitive question:

```json
{
  "id": "question-5",
  "type": "visual_recall",
  "cognitiveSkill": "short_term_memory",
  "prompt": "Study the reading glasses' exact six-region position before the room is hidden.",
  "instruction": "Remember the target, its surface, one row, and one column. Hide the room when you feel ready.",
  "targetObjectId": "glasses",
  "objectIds": ["glasses"],
  "selectableObjectIds": [],
  "sourceImageId": "room-1",
  "groundingRecordIds": ["grounding-glasses-location"],
  "correctAnswer": "Upper right",
  "choices": ["Upper left", "Upper middle", "Upper right", "Lower left", "Lower middle", "Lower right"],
  "interactionMode": "recall_zone",
  "recallZone": "upper_right",
  "challengeTitle": "Six-region object-place recall",
  "evidenceClues": [
    {
      "kind": "appearance",
      "label": "Visible signature",
      "detail": "Dark blue reading glasses"
    },
    {
      "kind": "place",
      "label": "Verified place",
      "detail": "On the right bedside table"
    },
    {
      "kind": "spatial_rule",
      "label": "Memory rule",
      "detail": "Store one row and one column"
    }
  ],
  "verbalCue": "Think about the bedside table on the right side of the bed.",
  "encouragement": "Take your time. We can look together.",
  "answerExplanation": "Yes. The dark blue reading glasses were on the right side of the room.",
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

## Spatial Room Image Contract

The image-generation request includes the original room image, every caregiver-approved visible object, the target object's verified description, and its verified location.
It asks Gemini for a realistic, perspective-preserving 2.5D composition with visible foreground, middle-ground, and background depth while preserving source aspect ratio, camera framing, object coordinates, room layout, and important room identity.
It explicitly forbids a rotated viewpoint, unseen walls, inferred dimensions, and invented occluded geometry.

The generated scene must not:

- Move the target object.
- Change the target object's color or type.
- Add a person.
- Add text, arrows, labels, or answer words.
- Remove safety-relevant room features.
- Introduce a new object that could be mistaken for an answer.

The primary generated composition may appear before the first question only after independent validation.
The `focus` cue still uses deterministic CSS dimming and highlighting so help never waits on a model.
The `simplified` cue can use a validated generated focus scene or the verified fallback treatment.

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

Gemini Omni Flash receives only the approved generated guide portrait and the current validated lesson prompt.
The clip should use natural blinking, a small nod, subtle breathing, direct eye contact, and a neutral synthetic adult voice.
The spoken dialogue must match the detailed visible question and must not add a memory, relationship claim, diagnosis, treatment claim, score, urgency, or claim of live presence.

The independent validator must confirm one person only, recognizable consistency with the approved guide, no call or messaging interface, and neutral safe dialogue.
The media may be stored and displayed only when every check passes.
The UI must label the clip as AI-generated, not live, and synthetic voice.
The question text, room interaction, and static guide must remain available before the video is ready and whenever generation or validation fails.

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
