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
  recallZoneFor,
  recallZoneLabel,
  relationBetween,
  relationMatches,
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
  typeOccurrence: number;
}) {
  const description = input.target.description.toLowerCase();
  const name = input.target.name.toLowerCase();
  const location = input.target.location.toLowerCase();
  const imageRegion = recallZoneLabel(
    recallZoneFor(input.target.boundingBox),
  ).toLowerCase();
  const verifiedAnswer = `All three verified clues agree: ${input.target.description} on the ${input.target.location}, in the ${imageRegion} region of the room image.`;
  const appearanceClue = {
    kind: "appearance" as const,
    label: "Visible signature",
    detail: input.target.description,
  };
  const placeClue = {
    kind: "place" as const,
    label: "Verified place",
    detail: `On the ${input.target.location}`,
  };
  const regionClue = {
    kind: "spatial_rule" as const,
    label: "Image region",
    detail: `The ${imageRegion} of the approved room image`,
  };

  switch (input.type) {
    case "object_recognition":
      if (input.typeOccurrence > 0) {
        return {
          challengeTitle: "Constraint-elimination challenge",
          prompt: `Which numbered object remains after you eliminate anything that is not ${description}, not on the ${location}, or outside the ${imageRegion} region?`,
          instruction:
            "Reject any object with the wrong visible signature, verified surface, or image region.",
          evidenceClues: [
            appearanceClue,
            {
              ...placeClue,
              label: "Surface filter",
            },
            {
              ...regionClue,
              label: "Region filter",
            },
          ],
          verbalCue: `Eliminate anything that does not match ${description}, the ${location}, and the ${imageRegion} region together.`,
          answerExplanation: verifiedAnswer,
        };
      }
      return {
        challengeTitle: "Three-clue identification",
        prompt: `Which numbered object matches ${description}, on the ${location}, in the ${imageRegion} region?`,
        instruction:
          "Check the visible signature, verified place, and image region before choosing one numbered area.",
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Begin with the visible signature, then verify the ${location}, and finally check the ${imageRegion} region.`,
        answerExplanation: verifiedAnswer,
      };
    case "location_matching":
      return {
        challengeTitle: "Complete location claim",
        prompt: `Which numbered area verifies the ${name} on the ${location} in the ${imageRegion} region?`,
        instruction:
          "Reject any area that matches only one or two details. Choose the area that makes the whole claim true.",
        evidenceClues: [
          {
            kind: "appearance" as const,
            label: "Object identity",
            detail: `${input.target.name}, visibly described as ${input.target.description.toLowerCase()}`,
          },
          placeClue,
          regionClue,
        ],
        verbalCue: `Find the ${location} first, then confirm both the ${name} and its ${imageRegion} position.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_search":
      if (input.reference && input.relation) {
        return {
          challengeTitle: "Landmark-guided search",
          prompt: `Starting at ${input.reference.description.toLowerCase()} on the ${input.reference.location.toLowerCase()}, which object is ${input.relation} the landmark and has the visible signature ${description}?`,
          instruction:
            "Follow the landmark, direction, and target signature in order before choosing.",
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "Start landmark",
              detail: `${input.reference.description} on the ${input.reference.location}`,
            },
            {
              kind: "spatial_rule" as const,
              label: "Move through image",
              detail: `${input.relation[0]?.toUpperCase()}${input.relation.slice(1)} the landmark`,
            },
            appearanceClue,
          ],
          verbalCue: `Anchor your eyes on the ${input.reference.name.toLowerCase()}, move ${input.relation}, then confirm ${description}.`,
          answerExplanation: `${verifiedAnswer} It also appears ${input.relation} the ${input.reference.name.toLowerCase()} in the approved image.`,
        };
      }
      return {
        challengeTitle: "Systematic scene search",
        prompt: `Which object matches ${description}, on the ${location}, in the ${imageRegion} region?`,
        instruction:
          "Scan the room in a steady path and stop only when all three clues align.",
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Scan toward the ${imageRegion}, locate the ${location}, then check the visible signature.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_recall": {
      const zone = recallZoneFor(input.target.boundingBox);
      return {
        challengeTitle: "Six-region object-place recall",
        prompt: `Study the ${name}'s exact six-region position before the room is hidden.`,
        instruction:
          "Remember the target, its surface, one row, and one column. Hide the room when you feel ready.",
        evidenceClues: [
          appearanceClue,
          placeClue,
          {
            kind: "spatial_rule" as const,
            label: "Memory rule",
            detail:
              "Store one row (upper/lower) and one column (left/middle/right)",
          },
        ],
        verbalCue: `Picture the ${input.target.name.toLowerCase()} on the ${location}, then recall both its row and column.`,
        answerExplanation: `The ${input.target.name} is verified on the ${location} in the ${recallZoneLabel(zone).toLowerCase()} region of the image.`,
      };
    }
    case "association":
      if (
        input.reference &&
        input.reference.location.toLowerCase() === location
      ) {
        return {
          challengeTitle: "Shared-surface association",
          prompt: `The ${input.reference.name.toLowerCase()} and one different object share the ${location}. Which option matches ${description}?`,
          instruction:
            "Connect the landmark to the shared surface, then confirm the second object's visible signature.",
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "Fixed landmark",
              detail: input.reference.description,
            },
            {
              kind: "place" as const,
              label: "Association rule",
              detail: `Choose a different object on the same ${input.target.location}`,
            },
            appearanceClue,
          ],
          verbalCue: `Start with the ${input.reference.name.toLowerCase()}, stay on the same ${location}, then find ${description}.`,
          answerExplanation: `The ${input.target.name} and ${input.reference.name} are both verified on the ${input.target.location}; the target is ${input.target.description.toLowerCase()}.`,
        };
      }
      if (input.reference && input.relation) {
        return {
          challengeTitle: "Landmark relation association",
          prompt: `Which object is ${input.relation} the ${input.reference.name.toLowerCase()} and also matches ${description}?`,
          instruction:
            "Use the landmark relation and the target's visible signature together.",
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "Fixed landmark",
              detail: input.reference.description,
            },
            {
              kind: "spatial_rule" as const,
              label: "Relation",
              detail: `${input.relation[0]?.toUpperCase()}${input.relation.slice(1)} the landmark`,
            },
            appearanceClue,
          ],
          verbalCue: `Start at the ${input.reference.name.toLowerCase()}, move ${input.relation}, and confirm ${description}.`,
          answerExplanation: `${verifiedAnswer} It appears ${input.relation} the ${input.reference.name}.`,
        };
      }
      return {
        challengeTitle: "Multi-evidence association",
        prompt: `Which object matches ${description}, the ${location}, and the ${imageRegion} region together?`,
        instruction:
          "Use all three evidence types together before choosing an object.",
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Match the visible signature, check the ${location}, then confirm the ${imageRegion}.`,
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
  const questionTypeOccurrences = new Map<LessonQuestion["type"], number>();
  const questions = plan.questions.map((question, index) => {
    const typeOccurrence = questionTypeOccurrences.get(question.type) ?? 0;
    questionTypeOccurrences.set(question.type, typeOccurrence + 1);
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
        ? recallZoneFor(target.boundingBox)
        : undefined;
    const choices = recallZone
      ? (
          [
            "upper_left",
            "upper_center",
            "upper_right",
            "lower_left",
            "lower_center",
            "lower_right",
          ] as const
        ).map(recallZoneLabel)
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
      typeOccurrence,
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
      correctAnswer: recallZone ? recallZoneLabel(recallZone) : target.name,
      choices,
      interactionMode: recallZone ? "recall_zone" : "tap_object",
      recallZone,
      challengeTitle: content.challengeTitle,
      evidenceClues: content.evidenceClues,
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
