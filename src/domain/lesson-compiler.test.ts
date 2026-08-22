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
        targetObjectId: "object-mug",
        choiceObjectIds: ["object-mug", "object-glasses"],
      },
      {
        type: "visual_search" as const,
        targetObjectId: "object-lamp",
        choiceObjectIds: ["object-lamp", "object-glasses", "object-mug"],
      },
      {
        type: "object_recognition" as const,
        targetObjectId: "object-mug",
        choiceObjectIds: ["object-mug", "object-glasses", "object-lamp"],
      },
      {
        type: "visual_recall" as const,
        targetObjectId: "object-lamp",
        choiceObjectIds: ["object-lamp", "object-glasses", "object-mug"],
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
  it("turns the six questions into one room-memory progression", () => {
    const state = createPreparedAnchorState();
    const lesson = compileGroundedLesson(
      strongPlan(),
      state.worldModel,
      state.groundingRecords,
    );

    const objectActivities = lesson.questions.filter(
      ({ interactionMode }) => interactionMode === "tap_object",
    );
    expect(
      lesson.questions.map(({ challengeTitle }) => challengeTitle),
    ).toEqual([
      "Learn a room anchor",
      "Link the object and place",
      "Find it from a landmark",
      "Picture it, then find it",
      "Study, hide, remember",
      "Link two room objects",
    ]);
    expect(lesson.questions.map(({ prompt }) => prompt).join(" ")).toMatch(
      /learn one anchor.*object-place memory.*starting at.*after picturing.*room is hidden.*picture the lamp/is,
    );
    expect(lesson.questions.map(({ prompt }) => prompt).join(" ")).not.toMatch(
      /constraint|eliminate|complete location claim|multi-evidence/i,
    );
    expect(objectActivities).toHaveLength(5);
    for (const question of lesson.questions) {
      expect(question.prompt.match(/[.!?](?:\s|$)/g)).toHaveLength(1);
    }
    for (const question of objectActivities) {
      expect(question.selectableObjectIds.length).toBeGreaterThanOrEqual(2);
      expect(question.selectableObjectIds).toContain(question.targetObjectId);
      expect(question.correctAnswer).not.toMatch(/^On the /);
      expect(question.answerExplanation).toMatch(/approved bedroom image/i);
      expect(question.evidenceClues).toHaveLength(3);
      expect(new Set(question.evidenceClues.map(({ kind }) => kind)).size).toBe(
        3,
      );
      expect(question.prompt.length).toBeGreaterThan(45);
      expect(
        question.evidenceClues.map(({ detail }) => detail).join(" ").length,
      ).toBeGreaterThan(70);
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

    expect(
      new Set(lesson.questions.map(({ challengeTitle }) => challengeTitle))
        .size,
    ).toBe(6);

    expect(search?.evidenceClues).toContainEqual(
      expect.objectContaining({ detail: "Above the landmark" }),
    );
    expect(search?.referenceObjectId).toBe("object-glasses");
    expect(recall).toMatchObject({
      interactionMode: "recall_zone",
      recallZone: "upper_right",
      correctAnswer: "Upper right",
      selectableObjectIds: [],
    });
    expect(recall?.prompt).toMatch(
      /study where.*room is hidden.*upper or lower/i,
    );
    expect(recall?.instruction).toContain('"Lamp on the bedside table"');
    expect(recall?.choices).toHaveLength(6);
    expect(recall?.evidenceClues).toHaveLength(3);
    expect(association?.evidenceClues).toContainEqual(
      expect.objectContaining({
        detail: "Choose a different object on the same bedside table",
      }),
    );
    expect(association?.referenceObjectId).toBe("object-lamp");
    expect(association?.prompt).toMatch(/picture the lamp.*shares that place/i);
    expect(association?.selectableObjectIds).toEqual([
      "object-glasses",
      "object-mug",
    ]);
  });
});
