import { describe, expect, it } from "vitest";

import {
  anchorStateSchema,
  boundingBoxSchema,
  lessonSchema,
  mediaValidationSchema,
} from "@/domain/anchor";
import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState } from "@/fixtures/demo";

describe("ANCHOR runtime contracts", () => {
  it("accepts the prepared state and rejects overflowing bounding boxes", () => {
    expect(anchorStateSchema.parse(createPreparedAnchorState())).toBeTruthy();
    expect(() =>
      boundingBoxSchema.parse({ x: 0.9, y: 0.2, width: 0.2, height: 0.2 }),
    ).toThrow(/image width/);
  });

  it("enforces exactly two configured cognitive activities", () => {
    const state = createPreparedAnchorState();
    const lesson = structuredClone(state.lesson);
    if (!lesson) {
      throw new Error("Prepared lesson is missing.");
    }
    lesson.questions[5] = {
      ...lesson.questions[5]!,
      type: "object_recognition",
      cognitiveSkill: "recognition",
    };

    expect(() => lessonSchema.parse(lesson)).toThrow(
      /sequencing or association/,
    );
  });

  it("blocks a lesson that references unapproved evidence", () => {
    const state = createPreparedAnchorState();
    if (!state.lesson) {
      throw new Error("Prepared lesson is missing.");
    }
    state.groundingRecords[0] = {
      ...state.groundingRecords[0]!,
      approval: "draft",
    };

    expect(() =>
      validateGroundedLesson(
        state.lesson,
        state.worldModel,
        state.groundingRecords,
      ),
    ).toThrow(/unapproved grounding evidence/);
  });

  it("fails closed when a media validation claims unsafe output is safe", () => {
    expect(() =>
      mediaValidationSchema.parse({
        targetObjectPresent: false,
        targetLocationPreserved: true,
        roomIdentityPreserved: true,
        misleadingContentIntroduced: false,
        safeToDisplay: true,
        conciseReason: "The target object is missing.",
      }),
    ).toThrow(/preservation check/);

    expect(
      mediaValidationSchema.parse({
        targetObjectPresent: false,
        targetLocationPreserved: true,
        roomIdentityPreserved: true,
        misleadingContentIntroduced: false,
        safeToDisplay: false,
        conciseReason: "The target object is missing.",
      }).safeToDisplay,
    ).toBe(false);
  });
});
