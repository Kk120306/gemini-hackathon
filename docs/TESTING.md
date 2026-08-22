# ANCHOR Testing Strategy

## Quality Bar

Tests should verify behavior visible through a stable public interface.
Domain tests should not assert prompt wording, private helper calls, or component implementation details.
End-to-end tests should follow the same caregiver and patient paths used during the demonstration.

## Primary End-to-End Scenario

The first automated test should cover this exact seeded flow:

1. Open caregiver mode.
2. Enter the patient's first name.
3. Upload a synthetic bedroom image.
4. Receive three fixture object proposals.
5. Edit one proposal and approve the world model.
6. Upload synthetic trusted-person references.
7. Confirm likeness consent.
8. Approve the fixture guide.
9. Generate and approve six fixture questions.
10. Start patient mode.
11. Play the first prompt.
12. Select an incorrect answer.
13. Observe a verbal cue.
14. Select another incorrect answer or request help.
15. Observe dimming and target highlighting.
16. Advance to the simplified cue.
17. Observe a generated-media result or deterministic fallback.
18. Select the correct answer.
19. Finish the remaining questions.
20. Reach the completion state without a score.
21. Open one grounding card and verify its image, model observation, caregiver value, and approval state.

## End-to-End Failure Scenarios

- Object analysis returns malformed data.
- Image generation times out.
- Generated media is rejected by validation.
- Video generation fails.
- Speech synthesis is unavailable.
- Speech recognition is unsupported.
- The page reloads during caregiver setup.
- A storage write fails.
- A user attempts to enter patient mode before approvals are complete.
- A question references a missing or unapproved grounding record.
- A generated guide is rejected or disabled.

Each scenario must produce a visible recovery path.

## Domain Tests

### World Model

- Reject objects without a source image.
- Reject invalid normalized bounding boxes.
- Separate model proposals from caregiver-approved objects.
- Increment the world-model revision after an approved change.
- Prevent lesson generation from a draft world model.

### Lesson Engine

- Require exactly six questions.
- Require exactly one visual-recall question.
- Require exactly one sequencing or association question.
- Require every answer to reference approved data.
- Reject invented locations and missing object identifiers.
- Reject sequencing content without caregiver verification.
- Reject duplicate or missing correct choices.

### Cue Engine

- Advance one level for an incorrect answer.
- Advance one level for a help request.
- Never skip directly from `none` to `reveal`.
- Stay at `reveal` after further incorrect input.
- Reset to `none` for the next question.
- Mark a correct answer without adding clinical scoring.

### Media Jobs

- Return a deterministic fallback immediately.
- Represent pending, completed, failed, rejected, and timed-out states.
- Display only media that passes validation.
- Preserve lesson progress after failure.

### Grounding Ledger

- Preserve the original model observation after caregiver correction.
- Resolve every approved question, answer, and cue to approved grounding records.
- Block lesson approval when a grounding record is missing or unapproved.
- Render a caregiver-facing evidence card without raw JSON.

## AI Contract Tests

Use captured synthetic responses rather than real network calls in the default suite.

Test:

- Valid Gemma object analysis.
- Markdown-wrapped JSON.
- Missing fields.
- Out-of-range bounding boxes.
- Unsupported personal inferences.
- Valid six-question lesson composition.
- Wrong question counts.
- Ungrounded object or location references.
- Invalid generated-media validation responses.
- Lesson content with a valid object but an unapproved location claim.
- Guide content that implies a live message or invented memory.

Keep real-provider tests opt-in and clearly labeled because they consume quota and may be nondeterministic.

## Accessibility Tests

- Run automated checks on every primary route.
- Verify keyboard operation for all caregiver and patient controls.
- Verify visible focus indicators.
- Verify that color is not the only cue.
- Verify accessible names for upload, replay, help, answer, and exit controls.
- Verify at least 64 by 64 CSS pixel patient touch targets.
- Verify reduced-motion behavior.
- Verify readable text remains when audio or video fails.
- Verify the AI-generated guide label remains visible at every patient cue level.
- Verify the room scene and answers remain visually dominant over the guide.

## Visual Testing

Use a tablet viewport as the primary patient target.
Capture screenshots for:

- Initial question.
- Verbal cue.
- Focus cue.
- Simplified generated scene.
- Revealed answer.
- Correct answer celebration.
- Video loading and fallback.
- Completion state.

Inspect screenshots manually for clipping, unintended scrolling, weak contrast, inconsistent spacing, distorted images, and controls placed too close together.

## Performance Checks

- Deterministic answer feedback should appear within 200 milliseconds on a typical development machine.
- A media-generation request must not block navigation or answer controls.
- Image and video operations must have visible timeouts.
- The stage path must continue after eight seconds without waiting for generated media.
- Large uploads must be rejected before model invocation.
- The patient route should avoid unnecessary client JavaScript and layout shifts.
- The prepared caregiver flow must complete within 90 seconds during rehearsal.

## Demo Reliability Gate

Before optional speech recognition or additional visual variants begin:

- The primary end-to-end flow must pass three consecutive times.
- The all-media-disabled fallback flow must pass three consecutive times.
- The three-minute presentation must complete three consecutive times.
- At least one live image request must succeed and one forced timeout must degrade cleanly.
- The final patient UI must be inspected at the target tablet viewport.

## Pre-Demo Verification

Run these commands after the app is scaffolded:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

Then run the live-provider smoke test once with the actual demo assets.
Record the results in `docs/STATUS.md`.
