# ANCHOR Agent Guide

This file is the working contract for anyone implementing ANCHOR.

## Read First

Read the project documents in this order before making substantial changes:

1. `docs/STATUS.md`
2. `docs/PRD.md`
3. `docs/SAFETY.md`
4. `docs/ARCHITECTURE.md`
5. `docs/AI_CONTRACTS.md`
6. `docs/IMPLEMENTATION_PLAN.md`
7. `docs/TESTING.md`

Use `docs/DECISIONS.md` to understand why scope and architecture choices were made.

## Source of Truth

When documents conflict, use this order:

1. Safety and privacy requirements
2. Product requirements and acceptance criteria
3. Architecture and AI contracts
4. Implementation plan
5. Demo runbook

Update the relevant source document when a product or architecture decision changes.
Record durable technical decisions in `docs/DECISIONS.md`.
Keep `docs/STATUS.md` current as work progresses.

## Scope Lock

The core loop is more important than breadth.
Do not add authentication, multi-patient support, whole-home mapping, analytics, reminders, medication features, open-ended chat, or clinical scoring before the required demo flow passes end to end.

The lesson contains exactly six questions for the hackathon demo.
Exactly two questions should be cognitive activities, normally visual recall and caregiver-confirmed sequencing or association.

## Engineering Rules

- Use TypeScript with strict compiler settings.
- Validate all model outputs at runtime before storing or rendering them.
- Keep external model calls behind provider interfaces.
- Keep lesson and cue state transitions deterministic and testable without network access.
- Treat generated media as untrusted until it passes structural and content checks.
- Never expose `GEMINI_API_KEY` to client-side code.
- Store uploaded and generated media outside version control.
- Provide deterministic fallbacks for image generation, video generation, text-to-speech, and speech recognition.
- Prefer accessible semantic HTML and large touch targets.
- Respect `prefers-reduced-motion`.
- Never modify generated changelog files.

## Safety Invariants

- Use only visually observed or caregiver-confirmed facts.
- Never invent a memory, relationship, routine, possession, preference, or quote.
- Never present the generated guide as the real person or as a live call.
- Never clone a family member's voice in the MVP.
- Require caregiver consent before generating a person's likeness.
- Clearly label generated images and video.
- Never provide a diagnosis, cognitive score, severity estimate, or therapeutic claim.
- Use neutral encouragement after incorrect answers.
- Never shame, rush, or argue with the patient.

## Testing Workflow

For bug fixes, reproduce the problem through the closest available end-to-end path before changing code.
Add or update the smallest test that proves the user-visible behavior.
Run relevant unit, contract, end-to-end, accessibility, and visual checks before declaring work complete.
Inspect the rendered UI at the target tablet viewport and treat obvious visual defects as failures.

## Expected Commands

These commands become authoritative after the application scaffold is created:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Do not claim a command passed unless it was actually run successfully.

## Completion Updates

After each implementation phase:

1. Update `docs/STATUS.md`.
2. Mark completed items in `docs/IMPLEMENTATION_PLAN.md`.
3. Add newly discovered risks or fallback requirements.
4. Record the verification commands and results.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes - APIs, conventions, and file structure may all differ from your training data.
Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code.
Heed deprecation notices.

This block is written and re-added by `next dev` - verify at `node_modules/next/dist/server/lib/generate-agent-files.js`.
Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
