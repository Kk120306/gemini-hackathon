import { describe, expect, it } from "vitest";

import {
  anchorStateSchema,
  boundingBoxSchema,
  guideValidationSchema,
  lessonSchema,
  mediaValidationSchema,
} from "@/domain/anchor";
import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState } from "@/fixtures/demo";
import {
  guideQuestionVideoActionResultSchema,
  guideVideoValidationSchema,
} from "@/providers/provider-contracts";

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

  it("fails closed when an inconsistent guide candidate is marked safe", () => {
    expect(() =>
      guideValidationSchema.parse({
        recognizableLikeness: true,
        consistentWithReferences: false,
        lightlyStylized: true,
        singlePersonOnly: true,
        noCallOrMessagingUi: true,
        safeToDisplay: true,
        conciseReason: "The face changed between references and candidate.",
      }),
    ).toThrow(/every likeness check/);
  });

  it("fails closed when a guide video misses any trust-boundary check", () => {
    expect(() =>
      guideVideoValidationSchema.parse({
        singlePersonOnly: true,
        recognizableAsApprovedGuide: true,
        noCallOrMessagingUi: false,
        neutralSafeDialogue: true,
        safeToDisplay: true,
        conciseReason: "A video-call frame was introduced.",
      }),
    ).toThrow(/every content check/);
  });

  it("accepts only server-issued MP4 paths for completed guide video", () => {
    expect(
      guideQuestionVideoActionResultSchema.parse({
        status: "completed",
        outputSrc:
          "/api/generated-guide-video/1359a8a6-0fbf-468f-8667-f18947b0aa20.mp4",
        model: "gemini-omni-flash-preview",
      }).status,
    ).toBe("completed");

    expect(() =>
      guideQuestionVideoActionResultSchema.parse({
        status: "completed",
        outputSrc: "https://example.com/untrusted.mp4",
        model: "gemini-omni-flash-preview",
      }),
    ).toThrow();
  });
});
