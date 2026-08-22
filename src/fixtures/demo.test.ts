import { describe, expect, it } from "vitest";

import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState, demoFixture } from "@/fixtures/demo";

describe("seeded demonstration fixture", () => {
  it("contains three grounded objects and exactly six questions", () => {
    expect(demoFixture.objects).toHaveLength(3);
    expect(demoFixture.questions).toHaveLength(6);

    const evidenceIds = new Set(
      demoFixture.groundingRecords.map((record) => record.id),
    );

    for (const question of demoFixture.questions) {
      expect(
        question.groundingRecordIds.every((id) => evidenceIds.has(id)),
      ).toBe(true);
    }
  });

  it("contains exactly two cognitive activities", () => {
    const cognitiveActivities = demoFixture.questions.filter((question) =>
      ["visual_recall", "sequencing", "association"].includes(question.type),
    );

    expect(cognitiveActivities).toHaveLength(2);
    expect(cognitiveActivities.map((question) => question.type)).toEqual([
      "visual_recall",
      "association",
    ]);
  });

  it("keeps every prepared prompt, answer, choice, and cue grounded", () => {
    const state = createPreparedAnchorState();
    expect(() =>
      validateGroundedLesson(
        state.lesson,
        state.worldModel,
        state.groundingRecords,
      ),
    ).not.toThrow();
  });
});
