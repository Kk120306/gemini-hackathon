import {
  lessonSchema,
  worldModelSchema,
  type GroundingRecord,
  type Lesson,
  type LessonQuestion,
  type WorldModel,
  type WorldObject,
} from "@/domain/anchor";
import type { LessonPlan } from "@/providers/provider-contracts";

const encouragement = "Take your time. We can look together.";

function getApprovedEvidence(
  worldModel: WorldModel,
  groundingRecords: GroundingRecord[],
) {
  const parsedWorldModel = worldModelSchema.parse(worldModel);
  if (parsedWorldModel.approval !== "approved") {
    throw new Error("An approved world model is required.");
  }

  const records = new Map(
    groundingRecords
      .filter(({ approval }) => approval === "approved")
      .map((record) => [record.id, record]),
  );
  const objects = new Map(
    parsedWorldModel.objects
      .filter(({ approval }) => approval === "approved")
      .map((object) => [object.id, object]),
  );

  for (const object of objects.values()) {
    const record = records.get(object.groundingRecordId);
    if (
      !record ||
      record.sourceImageId !== object.sourceImageId ||
      record.caregiverValue !== `${object.name} on the ${object.location}`
    ) {
      throw new Error(`Object ${object.id} has no approved visual evidence.`);
    }
  }

  return { objects, records, worldModel: parsedWorldModel };
}

export function assertApprovedGrounding(
  worldModel: WorldModel,
  groundingRecords: GroundingRecord[],
) {
  return getApprovedEvidence(worldModel, groundingRecords).worldModel;
}

function answerFor(type: LessonQuestion["type"], object: WorldObject) {
  return ["location_matching", "visual_search"].includes(type)
    ? `On the ${object.location}`
    : object.name;
}

function promptFor(type: LessonQuestion["type"], object: WorldObject) {
  switch (type) {
    case "object_recognition":
      return `Which object is described as ${object.description.toLowerCase()}?`;
    case "location_matching":
      return `Where are the ${object.name.toLowerCase()}?`;
    case "visual_search":
      return `Where can you find the ${object.name.toLowerCase()}?`;
    case "visual_recall":
      return `Which object did you see on the ${object.location}?`;
    case "association":
      return `Which object matches this approved description: ${object.description.toLowerCase()}?`;
    case "sequencing":
      throw new Error(
        "Sequencing requires an explicit caregiver-confirmed sequence.",
      );
  }
}

function skillFor(
  type: LessonQuestion["type"],
): LessonQuestion["cognitiveSkill"] {
  switch (type) {
    case "object_recognition":
      return "recognition";
    case "location_matching":
      return "spatial_orientation";
    case "visual_search":
      return "attention";
    case "visual_recall":
      return "short_term_memory";
    case "association":
      return "semantic_association";
    case "sequencing":
      return "sequencing";
  }
}

export function compileGroundedLesson(
  plan: LessonPlan,
  worldModel: WorldModel,
  groundingRecords: GroundingRecord[],
): Lesson {
  const evidence = getApprovedEvidence(worldModel, groundingRecords);
  const questions = plan.questions.map((question, index) => {
    const target = evidence.objects.get(question.targetObjectId);
    if (!target) {
      throw new Error(
        `Question ${index + 1} references an unapproved target object.`,
      );
    }

    const choiceObjects = question.choiceObjectIds.map((objectId) => {
      const object = evidence.objects.get(objectId);
      if (!object) {
        throw new Error(
          `Question ${index + 1} references an unapproved choice object.`,
        );
      }
      if (object.sourceImageId !== target.sourceImageId) {
        throw new Error(
          `Question ${index + 1} mixes objects from different images.`,
        );
      }
      return object;
    });
    const groundedChoiceObjects = [
      target,
      ...choiceObjects.filter(({ id }) => id !== target.id),
    ];
    const choices = groundedChoiceObjects.map((object) =>
      answerFor(question.type, object),
    );
    if (new Set(choices).size !== choices.length) {
      throw new Error(
        `Question ${index + 1} produces duplicate grounded choices.`,
      );
    }

    return {
      id: `question-${index + 1}`,
      type: question.type,
      cognitiveSkill: skillFor(question.type),
      prompt: promptFor(question.type, target),
      objectIds: groundedChoiceObjects.map(({ id }) => id),
      sourceImageId: target.sourceImageId,
      groundingRecordIds: groundedChoiceObjects.map(
        ({ groundingRecordId }) => groundingRecordId,
      ),
      correctAnswer: answerFor(question.type, target),
      choices,
      verbalCue: `Look on the ${target.location}.`,
      encouragement,
      visualCueStrategy: ["visual_recall", "association"].includes(
        question.type,
      )
        ? ("object_closeup" as const)
        : ("focus_box" as const),
      requiresCaregiverVerifiedSequence: false,
    } satisfies LessonQuestion;
  });

  return lessonSchema.parse({
    id: `lesson-${evidence.worldModel.id}-r${evidence.worldModel.revision}`,
    worldModelId: evidence.worldModel.id,
    worldModelRevision: evidence.worldModel.revision,
    questions,
    approval: "draft",
  });
}
