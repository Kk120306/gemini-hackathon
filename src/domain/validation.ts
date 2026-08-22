import type { GroundingRecord, Lesson, WorldModel } from "@/domain/anchor";
import { lessonSchema } from "@/domain/anchor";
import { compileGroundedLesson } from "@/domain/lesson-compiler";
import { lessonPlanSchema } from "@/providers/provider-contracts";

export function validateGroundedLesson(
  candidate: unknown,
  worldModel: WorldModel,
  groundingRecords: GroundingRecord[],
): Lesson {
  const lesson = lessonSchema.parse(candidate);

  if (worldModel.approval !== "approved") {
    throw new Error("Lesson generation requires an approved world model.");
  }

  if (
    lesson.worldModelId !== worldModel.id ||
    lesson.worldModelRevision !== worldModel.revision
  ) {
    throw new Error("Lesson does not match the approved world model revision.");
  }

  const approvedObjects = new Map(
    worldModel.objects
      .filter(({ approval }) => approval === "approved")
      .map((object) => [object.id, object]),
  );
  const approvedGrounding = new Map(
    groundingRecords
      .filter(({ approval }) => approval === "approved")
      .map((record) => [record.id, record]),
  );

  for (const question of lesson.questions) {
    const referencedObjectIds = [
      ...question.objectIds,
      ...(question.referenceObjectId ? [question.referenceObjectId] : []),
    ];
    for (const objectId of referencedObjectIds) {
      const object = approvedObjects.get(objectId);
      if (!object || object.sourceImageId !== question.sourceImageId) {
        throw new Error(
          `Question ${question.id} references an unapproved object.`,
        );
      }
    }

    for (const groundingId of question.groundingRecordIds) {
      if (!approvedGrounding.has(groundingId)) {
        throw new Error(
          `Question ${question.id} references unapproved grounding evidence.`,
        );
      }
    }
  }

  const plan = lessonPlanSchema.parse({
    questions: lesson.questions.map((question) => ({
      type: question.type,
      targetObjectId: question.targetObjectId,
      choiceObjectIds: question.objectIds,
    })),
  });
  const expected = compileGroundedLesson(plan, worldModel, groundingRecords);
  if (JSON.stringify(lesson.questions) !== JSON.stringify(expected.questions)) {
    throw new Error(
      "Lesson prompts, answers, choices, or cues contain ungrounded content.",
    );
  }

  return lesson;
}
