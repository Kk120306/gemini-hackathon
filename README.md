# ANCHOR

ANCHOR is a hackathon MVP for personalized cognitive engagement using a patient's real environment and a caregiver-approved family guide.

The demo covers one bedroom, one patient, one trusted person, three to five verified objects, and one six-question lesson.
Two questions are explicit cognitive activities.
Progressive visual cues use live Gemini image generation with an immediate deterministic fallback.
One short Gemini-generated video demonstrates the family guide without making video a dependency for every question.

## Primary Demo

```text
Upload bedroom and family photos
        ->
Detect and confirm familiar objects
        ->
Generate and approve a family guide
        ->
Generate six questions
        ->
Run the patient lesson
        ->
Answer incorrectly
        ->
Receive progressively clearer visual cues
        ->
Answer correctly
```

## Current Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Zod for runtime validation
- Google Gen AI JavaScript SDK
- Gemma through the Gemini API for world-model extraction and lesson generation
- Gemini native image generation for the avatar and simplified room scenes
- Gemini Omni Flash for one short video-generation moment
- Browser speech synthesis
- Browser speech recognition as an optional enhancement
- Local filesystem persistence for the hackathon demo
- Playwright for end-to-end tests
- Vitest for isolated domain and contract tests

## Run Locally

Fixture mode needs no external credential.

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and choose caregiver or patient mode.

Run the quality gates with:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

## Documentation

- [Room-to-cue interactive prototype](Room%20to%20Cue%20v2.dc.html)
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

## Environment

The local environment template has already been created as `.env.local`.
Add a valid `GEMINI_API_KEY` before running AI-backed features.

See [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) for every variable and its purpose.

## Product Boundary

ANCHOR does not diagnose, monitor, or treat dementia.
It does not invent memories, relationships, routines, or preferences.
Every personalized lesson must use visually observed information or caregiver-confirmed information.
