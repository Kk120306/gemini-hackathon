# ANCHOR Design QA

## Comparison Target

Source visual truth: `/Users/kai/.codex/attachments/3e06e96f-f906-4a8f-959e-6cdb1bd9c01c/UI mockups project setup.zip`, primary patient-activity reference `.thumbnail`.
Secondary source context: `ANCHOR Prototype.dc.html` and `ANCHOR Prototype v2.dc.html` inside the same archive.
Implementation: `http://127.0.0.1:3001/patient/session` in the prepared fixture state.
Implementation screenshot: `/Users/kai/repos/gemini-hackathon/.data/design-qa/strong-initial.png`.
Recall screenshot: `/Users/kai/repos/gemini-hackathon/.data/design-qa/strong-recall-hidden.png`.
Association screenshot: `/Users/kai/repos/gemini-hackathon/.data/design-qa/strong-association.png`.
Combined comparison: `/Users/kai/repos/gemini-hackathon/.data/design-qa/comparison-strong.png`.

## Normalization

The source image is 640 by 457 pixels.
The implementation was captured in the in-app Chromium browser at a 1194 by 834 CSS-pixel viewport with device scale factor 1.
The combined comparison presents the source and implementation at the same aspect-preserving 644 by 452 frame.
The source shows a correct multiple-choice answer while the implementation shows a correct spatial answer because the updated product direction intentionally makes the room itself interactive.

## Core Design and Functionality

### Layout and Spacing

The implementation preserves the source's warm canvas, compact patient header, centered six-dot progress, large rounded room surface, and supporting panel on the right.
The room occupies about two thirds of the primary stage and remains the dominant product surface.
The scene and support panel align cleanly at the top with consistent 36-pixel rounding and generous separation.
The final tablet document is exactly 1194 by 834 pixels with no horizontal or vertical overflow.

### Typography

The implementation uses the locally bundled Figtree variable font from the reference direction.
Patient prompts use a compact display scale, a strong 600 weight, and line wrapping that remains readable in the narrow support panel.
Instructions, grounded explanations, and control labels retain clear hierarchy without truncation.

### Colors and Surfaces

The warm `#fbf4ea` canvas, soft white `#fffdf8` panels, sage `#6f9474` actions, deep green `#2e5d55` grounding markers, and quiet blue feedback preserve the reference palette.
State colors remain calm and never frame an incorrect response as failure.
The implementation intentionally omits decorative source elements that would compete with the verified room evidence.

### Image and Asset Fidelity

The full approved room image uses aspect-preserving containment, so no evidence object is cropped from arbitrary caregiver uploads.
All visible scene anchors are projected from approved normalized bounding boxes rather than approximate CSS art.
The fixture room and guide remain real project assets, and the guide retains its visible AI-generated label.
No placeholder image, emoji, handcrafted SVG illustration, or fake three-dimensional reconstruction was introduced.

### Copy and Content

The product copy intentionally diverges from the weak generic source question.
Every activity now combines exactly three verified clues selected from visible appearance, verified place, landmark, and image-region rules.
The six activities have distinct reasoning tasks, including constraint elimination, landmark-guided search, six-region object-place recall, and shared-surface association.
Each detailed prompt names the complete grounded claim, each instruction explains the reasoning operation, and each correct state explains why all evidence agrees.
The recall activity says there is no timer, hides the room only after explicit readiness, and requires both a row and a column.

### Icons

The existing application icon set remains consistent in stroke weight and optical size across replay, help, feedback, and continuation actions.
Hotspots use numbered circular markers because numbers remain legible and avoid ambiguous icon semantics.

## States and Interactions

The initial activity exposes three large touch regions directly on the room image and no detached answer-card grid.
Hover and focus subtly shift scene emphasis toward the explored object without changing the evidence coordinates.
An incorrect answer advances neutral verbal support and begins non-blocking media preparation.
The focus state dims irrelevant room areas and highlights the verified target.
The correct state disables alternative hotspots, retains the verified target label, explains the grounded answer, and exposes continuation.
The recall state presents the full room without a timer, then a hidden scene with six large upper or lower and left, middle, or right regions.
The association state distinguishes the named lamp as a landmark, requires a shared-surface rule and visible signature, and exposes only the two grounded candidates as answers.
All required primary controls, replay, help, spatial selection, recall, continuation, and exit interactions work in the browser.

## Accessibility and Resilience

Every object hotspot has a semantic button and an accessible name that identifies the approved object.
Small objects receive a minimum 72 by 72 CSS-pixel touch region while remaining centered on their verified location.
Focus indicators remain visible for keyboard interaction, and pointer selection clears stale explored state.
The verified room has descriptive alternative text, the landmark has a distinct accessible role, and feedback is announced through a polite live region.
Reduced motion removes scene movement without changing the interaction or cue meaning.
The 1194 by 834 tablet viewport has no clipping, overlap, or scroll.

## Browser Evidence

The strengthened six-question lesson was walked through in the in-app browser.
The initial three-evidence challenge, wrong-answer, focus, correct, six-region recall-study, recall-hidden, and multi-evidence association states were inspected.
Browser metrics reported a 1194-pixel document width, an 834-pixel document height, and no viewport overflow.
Visible object targets measured at least 72 CSS pixels in each dimension.
Browser logs contained no warnings or errors.

## Findings and Comparison History

### Iteration 1

Finding: the lamp hotspot initially covered the smaller reading-glasses hotspot because both approved evidence boxes overlap.
Impact: the primary target looked unavailable even though it remained in the DOM.
Fix: calculate visual stacking from approved box area so smaller nested objects remain selectable above larger landmarks.

### Iteration 2

Finding: a previously clicked wrong object could retain browser focus styling while the cue state changed.
Impact: the wrong object could look selected after neutral feedback appeared.
Fix: clear pointer exploration and blur the pressed spatial or recall button after activation while preserving keyboard `:focus-visible` behavior.

### Iteration 3

Finding: generic multiple-choice cards kept the room passive and weakened the core product thesis.
Impact: the patient was matching labels rather than interacting with a familiar space.
Fix: remove the detached answer grid and project accessible answer regions directly onto the complete contained room image.

### Iteration 4

Finding: generic prompt text and three broad recall columns made the activity look easier than the evidence model actually was.
Impact: the core lesson could be mistaken for a lightweight object-recognition quiz.
Fix: expose exactly three evidence cards for every activity, make the full grounded claim visible in the prompt, add six distinct reasoning-task titles, enforce target diversity, and replace three-column recall with a six-region row-and-column map.

### Iteration 5

Finding: the detailed prompt and evidence path initially extended the first and final activity below the tablet viewport.
Impact: replay and help controls were partially clipped despite the stronger content.
Fix: apply one dense but readable tablet panel treatment across all activities while preserving the 64-pixel touch targets and room dominance.

## Remaining Severity

No actionable P0, P1, or P2 visual or interaction findings remain for the strong spatial reasoning checkpoint.
The source mockup remains a visual-language reference rather than a behavioral constraint, as requested.

final result: passed
