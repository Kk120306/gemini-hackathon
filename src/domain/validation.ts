import type { GroundingRecord, Lesson, WorldModel } from "@/domain/anchor";
import { lessonSchema } from "@/domain/anchor";

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
    for (const objectId of question.objectIds) {
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

  return lesson;
}
