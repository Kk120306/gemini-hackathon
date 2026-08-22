import { describe, expect, it } from "vitest";

import { compileGroundedLesson } from "@/domain/lesson-compiler";
import { createPreparedAnchorState } from "@/fixtures/demo";

function strongPlan() {
  return {
    questions: [
      {
        type: "object_recognition" as const,
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-lamp", "object-mug"],
      },
      {
        type: "location_matching" as const,
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-mug"],
      },
      {
        type: "visual_search" as const,
        targetObjectId: "object-mug",
        choiceObjectIds: ["object-mug", "object-glasses", "object-lamp"],
      },
      {
        type: "object_recognition" as const,
        targetObjectId: "object-lamp",
        choiceObjectIds: ["object-lamp", "object-glasses", "object-mug"],
      },
      {
        type: "visual_recall" as const,
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-lamp", "object-mug"],
      },
      {
        type: "association" as const,
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-lamp", "object-mug"],
      },
    ],
  };
}

describe("grounded spatial lesson compiler", () => {
  it("turns every non-recall activity into direct room interaction", () => {
    const state = createPreparedAnchorState();
    const lesson = compileGroundedLesson(
      strongPlan(),
      state.worldModel,
      state.groundingRecords,
    );

    const objectActivities = lesson.questions.filter(
      ({ interactionMode }) => interactionMode === "tap_object",
    );
    expect(objectActivities).toHaveLength(5);
    for (const question of objectActivities) {
      expect(question.selectableObjectIds.length).toBeGreaterThanOrEqual(2);
      expect(question.selectableObjectIds).toContain(question.targetObjectId);
      expect(question.correctAnswer).not.toMatch(/^On the /);
      expect(question.answerExplanation).toMatch(/verified/i);
    }
  });

  it("uses a landmark relationship and a distinct hide-and-recall task", () => {
    const state = createPreparedAnchorState();
    const lesson = compileGroundedLesson(
      strongPlan(),
      state.worldModel,
      state.groundingRecords,
    );
    const search = lesson.questions[2];
    const recall = lesson.questions[4];
    const association = lesson.questions[5];

    expect(search?.prompt).toContain("left of the reading glasses");
    expect(search?.referenceObjectId).toBe("object-glasses");
    expect(recall).toMatchObject({
      interactionMode: "recall_zone",
      recallZone: "right",
      correctAnswer: "Right side",
      selectableObjectIds: [],
    });
    expect(association?.prompt).toContain("shares the bedside table");
    expect(association?.referenceObjectId).toBe("object-lamp");
    expect(association?.selectableObjectIds).toEqual([
      "object-glasses",
      "object-mug",
    ]);
  });
});
