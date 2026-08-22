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
import {
  horizontalZoneFor,
  relationBetween,
  relationMatches,
  zoneLabel,
  type SpatialRelation,
} from "@/domain/spatial-scene";

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

function objectsWithoutReference(
  choiceObjects: WorldObject[],
  reference: WorldObject | null,
) {
  return reference
    ? choiceObjects.filter(({ id }) => id !== reference.id)
    : choiceObjects;
}

function validSpatialReference(
  target: WorldObject,
  candidate: WorldObject,
  selectableObjects: WorldObject[],
): SpatialRelation | null {
  const relation = relationBetween(target, candidate);
  if (!relation) {
    return null;
  }
  return selectableObjects.every(
    (object) =>
      object.id === target.id || !relationMatches(object, candidate, relation),
  )
    ? relation
    : null;
}

function chooseReference(input: {
  type: LessonQuestion["type"];
  target: WorldObject;
  choiceObjects: WorldObject[];
  approvedObjects: WorldObject[];
}) {
  if (!["visual_search", "association"].includes(input.type)) {
    return { reference: null, relation: null };
  }

  const candidates = input.approvedObjects.filter(
    (object) =>
      object.id !== input.target.id &&
      object.sourceImageId === input.target.sourceImageId,
  );
  if (input.type === "association") {
    for (const candidate of candidates) {
      const selectable = objectsWithoutReference(
        input.choiceObjects,
        candidate,
      );
      if (
        selectable.length >= 2 &&
        candidate.location.toLowerCase() ===
          input.target.location.toLowerCase() &&
        selectable.every(
          (object) =>
            object.id === input.target.id ||
            object.location.toLowerCase() !==
              input.target.location.toLowerCase(),
        )
      ) {
        return { reference: candidate, relation: null };
      }
    }
  }

  for (const candidate of candidates) {
    const selectable = objectsWithoutReference(input.choiceObjects, candidate);
    if (selectable.length < 2) {
      continue;
    }
    const relation = validSpatialReference(input.target, candidate, selectable);
    if (relation) {
      return { reference: candidate, relation };
    }
  }

  return { reference: null, relation: null };
}

function compileQuestionContent(input: {
  type: LessonQuestion["type"];
  target: WorldObject;
  reference: WorldObject | null;
  relation: SpatialRelation | null;
}) {
  const description = input.target.description.toLowerCase();
  const name = input.target.name.toLowerCase();
  const location = input.target.location.toLowerCase();
  const verifiedAnswer = `That matches the verified room: ${input.target.description} on the ${input.target.location}.`;

  switch (input.type) {
    case "object_recognition":
      return {
        prompt: `Find the ${description} on the ${location}.`,
        instruction: "Touch the matching object area in the room.",
        verbalCue: `Use the visible color, shape, or material in the clue, then scan the ${location}.`,
        answerExplanation: verifiedAnswer,
      };
    case "location_matching":
      return {
        prompt: `Touch the ${name} exactly where it appears on the ${location}.`,
        instruction: "Use the room image itself, not a list of answers.",
        verbalCue: `Scan the ${location} slowly from one side to the other.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_search":
      if (input.reference && input.relation) {
        return {
          prompt: `Find the ${description} that appears ${input.relation} the ${input.reference.name.toLowerCase()} in this image.`,
          instruction: "Use the landmark, then touch the matching object area.",
          verbalCue: `Use the ${input.reference.name.toLowerCase()} as a landmark and look ${input.relation}.`,
          answerExplanation: `${verifiedAnswer} In the image, it appears ${input.relation} the ${input.reference.name.toLowerCase()}.`,
        };
      }
      return {
        prompt: `Search the room for the ${description} on the ${location}.`,
        instruction: "Touch it when you find it.",
        verbalCue: `Look carefully across the ${location}.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_recall": {
      const zone = horizontalZoneFor(input.target.boundingBox);
      return {
        prompt: `After the room is hidden, choose the side where the ${description} appeared.`,
        instruction:
          "Study the whole room first. Hide it only when you feel ready.",
        verbalCue:
          "Picture the room as three calm areas: left, middle, and right.",
        answerExplanation: `The ${input.target.name} appears on the ${zoneLabel(zone).toLowerCase()} of the image, on the ${location}.`,
      };
    }
    case "association":
      if (
        input.reference &&
        input.reference.location.toLowerCase() === location
      ) {
        return {
          prompt: `Which other object shares the ${location} with the ${input.reference.description.toLowerCase()}?`,
          instruction:
            "Touch the object that belongs in the same verified area.",
          verbalCue: `Look for the second object on the same ${location}.`,
          answerExplanation: `The ${input.target.name} and ${input.reference.name} are both verified on the ${input.target.location}.`,
        };
      }
      if (input.reference && input.relation) {
        return {
          prompt: `Which object appears ${input.relation} the ${input.reference.name.toLowerCase()} in this room image?`,
          instruction: "Connect the landmark to the matching object area.",
          verbalCue: `Start at the ${input.reference.name.toLowerCase()}, then look ${input.relation}.`,
          answerExplanation: `In the verified image, the ${input.target.name} appears ${input.relation} the ${input.reference.name}.`,
        };
      }
      return {
        prompt: `Which object matches both clues: ${description}, on the ${location}?`,
        instruction: "Use both details together, then touch the object.",
        verbalCue: `Match the visible detail first, then check the ${location}.`,
        answerExplanation: verifiedAnswer,
      };
    case "sequencing":
      throw new Error(
        "Sequencing requires an explicit caregiver-confirmed sequence.",
      );
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
    const { reference, relation } = chooseReference({
      type: question.type,
      target,
      choiceObjects: groundedChoiceObjects,
      approvedObjects: [...evidence.objects.values()],
    });
    const selectableObjects =
      question.type === "visual_recall"
        ? []
        : objectsWithoutReference(groundedChoiceObjects, reference);
    if (question.type !== "visual_recall" && selectableObjects.length < 2) {
      throw new Error(
        `Question ${index + 1} does not have two spatial answer anchors.`,
      );
    }
    const recallZone =
      question.type === "visual_recall"
        ? horizontalZoneFor(target.boundingBox)
        : undefined;
    const choices = recallZone
      ? (["left", "center", "right"] as const).map(zoneLabel)
      : selectableObjects.map(({ name }) => name);
    if (new Set(choices).size !== choices.length) {
      throw new Error(
        `Question ${index + 1} produces duplicate grounded choices.`,
      );
    }
    const content = compileQuestionContent({
      type: question.type,
      target,
      reference,
      relation,
    });
    const evidenceObjects = reference
      ? [
          ...groundedChoiceObjects,
          ...(!groundedChoiceObjects.some(({ id }) => id === reference.id)
            ? [reference]
            : []),
        ]
      : groundedChoiceObjects;

    return {
      id: `question-${index + 1}`,
      type: question.type,
      cognitiveSkill: skillFor(question.type),
      prompt: content.prompt,
      instruction: content.instruction,
      targetObjectId: target.id,
      objectIds: groundedChoiceObjects.map(({ id }) => id),
      selectableObjectIds: selectableObjects.map(({ id }) => id),
      referenceObjectId: reference?.id,
      sourceImageId: target.sourceImageId,
      groundingRecordIds: evidenceObjects.map(
        ({ groundingRecordId }) => groundingRecordId,
      ),
      correctAnswer: recallZone ? zoneLabel(recallZone) : target.name,
      choices,
      interactionMode: recallZone ? "recall_zone" : "tap_object",
      recallZone,
      verbalCue: content.verbalCue,
      encouragement,
      answerExplanation: content.answerExplanation,
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
