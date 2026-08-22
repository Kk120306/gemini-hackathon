# ANCHOR Demo Voiceover

## Opening

Most learning apps turn a room photo into another generic quiz.
ANCHOR turns the familiar room itself into a grounded spatial activity.

## Problem

A one-clue question can be generated in seconds, but it throws away the richest context.
ANCHOR keeps the object, its verified location, and its position in the room working together.

## Inputs

This film uses licensed stock images for the room and portrait references.
In the product, a caregiver must confirm every fact, and consent is required before any person's likeness can be generated.
The generated guide is always labeled and never presented as a live call or the real person.

## Grounding

The pipeline is deliberately constrained.
First, the system observes only visible objects and spatial relationships.
Second, the caregiver confirms which facts are safe to use.
Third, Gemini creates a perspective-preserving two-and-a-half-D composition.
Finally, an independent validation pass rejects drift, invented objects, or broken framing.
If anything fails or takes too long, ANCHOR uses a deterministic fallback.

## Spatial room

The result is not claimed as a metric reconstruction from one photograph.
It is a realistic, depth-aware composition that preserves the approved camera view.
Foreground, middle distance, and background are easier to read.
Object hotspots remain tied to their verified positions, so the room becomes the interaction surface instead of a decoration behind a quiz card.

## Challenge

Now the question can demand real grounded reasoning.
The learner is not asked only for a color or a familiar name.
They must identify dark blue reading glasses, verify that the object is on the bedside table, and check that it appears in the lower-right region of the approved room image.
All three constraints must agree before the answer is correct.
The hackathon lesson contains exactly six questions, including two cognitive activities.

## Progressive support

When an answer is incorrect, ANCHOR does not shame, score, or rush the learner.
It first gives a neutral verbal cue using the same evidence path.
If more help is requested, it visually focuses the caregiver-confirmed target.
The next step removes visual competition with a simplified scene.
Finally, the grounded reveal explains why the verified clues agree.
Every stage is deterministic, testable without the network, and supported by the same safe fallback path.

## Close

That is the core ANCHOR loop: a familiar room, transformed into strong spatial reasoning with gentle progressive support.
Generated media stays labeled, facts stay caregiver-approved, and the experience never uses a score, a timer, or a diagnostic claim.
