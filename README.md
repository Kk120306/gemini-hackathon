# ANCHOR

> Caregiver-verified familiar-room memory practice for people living with dementia, powered by Gemini and Gemma.

**Build with Gemini Hackathon 2026**  
**Track 2: Best Elderly Hack**

ANCHOR turns a photo of a familiar room into a calm, personalized six-activity experience for a person living with dementia.
Gemini identifies visible objects, a caregiver verifies every personal fact, Gemma plans the lesson, and the patient interacts directly with the familiar room using large touch targets, spoken prompts, and progressively clearer visual cues.

ANCHOR is an engagement prototype, not a diagnostic tool or medical device.

## Hackathon Submission

| Detail | Submission |
| --- | --- |
| Event | Build with Gemini Hackathon 2026 |
| Organizers | Google DeepMind and 65labs |
| Track | Track 2: Best Elderly Hack |
| Date | 22 August 2026 |
| Venue | Lorong AI at One-North, Singapore |
| Repository | [github.com/Kk120306/gemini-hackathon](https://github.com/Kk120306/gemini-hackathon) |
| One-line description | ANCHOR turns a caregiver-verified familiar-room photo into accessible recognition, orientation, recall, and association practice for a person living with dementia. |
| Demo film | A 2-minute 48-second Remotion film, with reproducible source in [`demo-video`](demo-video/README.md) |

## The Problem

Many digital experiences are crowded, text-heavy, and built around speed and precision.
Those assumptions can create unnecessary friction for older adults, especially people living with dementia.

Caregivers can provide the context that makes an activity familiar and trustworthy, but turning that context into a safe personalized experience takes time.
Generative AI can help, but it must not invent personal memories, move familiar objects, impersonate a family member, or make clinical claims.

ANCHOR addresses both sides of the problem:

- The caregiver supplies and approves the personal context.
- Gemini converts real room pixels into useful multimodal interactions.
- The patient receives one calm activity at a time, with voice, large touch targets, visible help, and no score or timer.

## How ANCHOR Works

```text
Caregiver uploads a familiar-room photo
                 |
                 v
Gemini proposes visible objects and locations
                 |
                 v
Caregiver corrects and approves the evidence
                 |
                 v
Gemma plans exactly six grounded activities
                 |
                 v
Deterministic code compiles questions and cues
                 |
                 v
Patient explores the room with touch and speech
                 |
                 v
Incorrect answer -> verbal -> focus -> simplified -> reveal
```

The complete flow is:

1. A caregiver enters the patient's preferred name and uploads one familiar-room image.
2. Gemini vision proposes six to ten clearly visible objects when the image supports them.
3. The caregiver reviews the source evidence, corrects names or locations, and approves the room model.
4. The caregiver may provide one to three authorized photos of a trusted person and explicitly confirm likeness consent.
5. Gemini creates a lightly stylized guide that the caregiver must approve before patient use.
6. Gemma selects a grounded six-activity plan using only approved object identifiers.
7. Deterministic application code writes the patient-facing prompts, answers, evidence clues, and cue sequence.
8. The patient answers five activities by touching large verified regions directly on the room image.
9. One untimed activity asks the patient to study the room and recall an object's row and column after choosing to hide it.
10. Help and incorrect answers advance through calm verbal, focus, simplified, and reveal cues without judgment.
11. The session ends with a supportive completion state and no score, clinical label, or performance interpretation.

## Why It Fits Track 2

Track 2 asks for empathetic, voice-first, context-aware technology that older adults, caregivers, or eldercare workers can use with low friction and appropriate safety.

| Track 2 priority | How ANCHOR responds |
| --- | --- |
| Voice-first accessibility | Approved prompts can use neutral Gemini speech, with browser speech and readable text as fallbacks. |
| Multimodal interaction | A caregiver supplies room and portrait images, while the patient interacts through voice playback and direct touch on the room. |
| Low-friction use | The patient sees one instruction at a time, large controls, a visible replay button, and a visible help button. |
| Context awareness | Every activity comes from objects and locations visible in the patient's own familiar room and approved by a caregiver. |
| Trust | The interface exposes the evidence behind each fact and labels all generated guide media as AI-generated, synthetic, and not live. |
| Respectful support | There are no countdowns, streaks, scores, childish praise, cognitive labels, or claims of medical benefit. |
| Reliability | Network-dependent image, video, and speech features never block the lesson and always have deterministic fallbacks. |

## Gemini and Google AI Cloud Products Used

All live model calls run on the server through the hosted Gemini API.
The browser never receives the API key, raw provider access, or permission to publish unvalidated model output.

| Product or model | Role in ANCHOR | Why it matters |
| --- | --- | --- |
| Google AI Studio | Creates the server-side Gemini API credential used by the hackathon build. | Provides one controlled entry point for the hosted Google AI models. |
| Gemini API | Hosts every live Gemma and Gemini request. | Keeps multimodal understanding, generation, validation, video, and speech behind one provider boundary. |
| Google Gen AI JavaScript SDK (`@google/genai`) | Connects the Next.js server to Gemini and Gemma. | Supports structured text, multimodal inputs, generated images, video, and audio. |
| Gemma 4 26B (`gemma-4-26b-a4b-it`) | Selects approved objects and activity types for the six-question lesson. | The model plans from a constrained evidence set instead of inventing personal facts. |
| Gemini 3.6 Flash (`gemini-3.6-flash`) | Analyzes real caregiver-uploaded room images and independently validates generated media. | Fast multimodal reasoning turns pixels into reviewable evidence and blocks unsafe generated results. |
| Gemini 3.1 Flash Lite Image (`gemini-3.1-flash-lite-image`) | Generates the lightly stylized guide, simplified focus scenes, and optional 2.5D room interpretation. | Image generation creates the visual magic moment while preserving a deterministic source-image fallback. |
| Gemini Omni Flash Preview (`gemini-omni-flash-preview`) | Animates one approved guide image for a short question-specific clip. | Adds a warm multimodal moment without pretending to be a live call or blocking the activity. |
| Gemini 3.1 Flash TTS Preview (`gemini-3.1-flash-tts-preview`) | Reads the exact caregiver-approved question in a fixed neutral synthetic voice. | Spoken guidance reduces dependence on reading while explicitly avoiding voice cloning. |

Model identifiers are configurable because preview availability may change.
Live features require model access and available API quota, while fixture mode runs the complete core flow without external credentials.

## What Makes Gemini Essential

ANCHOR is not a generic form with an AI button.
Its live personalized loop depends on Gemini's multimodal capabilities:

- Gemini interprets the actual pixels in a caregiver's room photo.
- Gemini returns normalized object locations that become large interactive regions.
- Gemini independently compares generated and source images before any generated room can be shown.
- Gemini creates a consented visual guide and optional room transformations.
- Gemini produces exact approved speech and an optional short guide clip.
- Gemma turns only caregiver-approved evidence identifiers into a coherent six-activity lesson plan.

The application remains in control of approvals, state transitions, patient-facing wording, and fallbacks.
Model output is always treated as an untrusted proposal.

## Grounding and Safety

Every personalized fact follows one inspectable proof chain:

```text
source room pixels
    -> model observation
    -> caregiver correction or confirmation
    -> approved grounding record
    -> lesson activity
    -> answer and visual cue
```

The core safety rules are:

- Use only visually observed or caregiver-confirmed facts.
- Never invent a memory, relationship, possession, routine, preference, or quote.
- Require caregiver consent before generating a person's likeness.
- Label generated guide images and video as AI-generated and not live.
- Never clone or imitate a family member's voice.
- Validate generated room and guide media before displaying it.
- Reject malformed, unsupported, or ungrounded model output at runtime.
- Never diagnose, score, assess, treat, or claim to improve dementia or memory.
- Respond to incorrect answers with neutral encouragement and progressively clearer help.

See [`docs/SAFETY.md`](docs/SAFETY.md) for the full safety and privacy contract.

## Architecture

ANCHOR is a strict TypeScript Next.js application with separate caregiver and patient routes.
AI providers, deterministic domain logic, and storage are isolated behind interfaces.

```text
Caregiver browser                 Patient browser
       |                                |
       v                                v
Next.js caregiver routes         Next.js patient routes
       |                                |
       +----------> Server actions <----+
                         |
             +-----------+-----------+
             |                       |
             v                       v
     Gemini and Gemma          Deterministic engines
     provider adapters         lesson, cue, session
             |                       |
             +-----------+-----------+
                         |
                         v
              Private local demo storage
```

Generated media is an enhancement, never a dependency.
If image, video, speech, or network access fails, the verified room, static guide, visible text, and application-controlled cue sequence remain usable.

## Technology Stack

- Next.js 16 App Router and React 19
- TypeScript with strict compiler settings
- Tailwind CSS
- Zod runtime validation
- Google Gen AI JavaScript SDK
- Local private filesystem persistence for the hackathon demo
- Browser speech synthesis as an audio fallback
- Optional constrained browser speech recognition
- Vitest for domain and provider contract tests
- Playwright and axe-core for end-to-end and accessibility checks
- Remotion for the under-three-minute submission film

## Run Locally

### Fixture mode

Fixture mode runs the complete deterministic flow without an API key.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), then choose the caregiver or patient path.

### Live Gemini mode

Copy the environment template and add a Gemini API key created in Google AI Studio.

```bash
cp .env.example .env.local
```

Set these values in `.env.local`:

```dotenv
GEMINI_API_KEY=your_server_side_key
ANCHOR_DEMO_MODE=false
ANCHOR_ENABLE_IMAGE_GENERATION=true
ANCHOR_ENABLE_VIDEO_GENERATION=true
```

Never expose the key through a `NEXT_PUBLIC_` variable or commit `.env.local`.
See [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for all model and feature settings.

## Verification

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Real-provider smoke tests are opt-in because they consume quota and use nondeterministic external models.

## Demo Film

The repository includes the complete Remotion source, product captures, narration, and asset credits for the 2-minute 48-second submission film.

```bash
cd demo-video
npm install
npm run render
```

The reproducible render is written to `demo-video/out/anchor-demo.mp4`.
Rendered video files are intentionally ignored by Git.

## Repository Guide

| Path | Purpose |
| --- | --- |
| [`src/app`](src/app) | Caregiver and patient routes, server actions, and private media handlers |
| [`src/domain`](src/domain) | Runtime schemas, deterministic lesson compiler, spatial geometry, cue engine, and session state |
| [`src/providers`](src/providers) | Gemini, Gemma, fake-provider, generation, and validation boundaries |
| [`src/storage`](src/storage) | Private local storage adapters |
| [`tests/e2e`](tests/e2e) | Tablet, accessibility, fallback, and complete-flow coverage |
| [`tests/live`](tests/live) | Opt-in real-provider acceptance tests |
| [`demo-video`](demo-video) | Under-three-minute Remotion submission film source |
| [`docs`](docs) | Product, architecture, AI contract, safety, testing, and decision records |

## Product Boundary

ANCHOR supports one patient, one familiar room, one trusted person, and one caregiver-approved six-activity lesson for the hackathon demo.
Authentication, multi-patient support, clinical scoring, medication features, reminders, long-term analytics, open-ended chat, whole-home mapping, and production compliance are intentionally outside this MVP.

## Documentation

- [Product requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [AI and data contracts](docs/AI_CONTRACTS.md)
- [Safety and privacy](docs/SAFETY.md)
- [Implementation plan](docs/IMPLEMENTATION_PLAN.md)
- [Testing strategy](docs/TESTING.md)
- [Demo runbook](docs/DEMO_RUNBOOK.md)
- [Environment setup](docs/ENVIRONMENT.md)
- [Decision log](docs/DECISIONS.md)
- [Current status](docs/STATUS.md)

## License and Data

Personal photos, generated likenesses, private profiles, and local session data are stored outside version control.
Public presentation assets and their attribution are documented in [`demo-video/ASSET_CREDITS.md`](demo-video/ASSET_CREDITS.md).
