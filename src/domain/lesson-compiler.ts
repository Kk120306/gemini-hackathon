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
  roomName: string;
}) {
  const description = input.target.description.toLowerCase();
  const name = input.target.name.toLowerCase();
  const location = input.target.location.toLowerCase();
  const roomName = input.roomName.toLowerCase();
  const imageRegion = recallZoneLabel(
    recallZoneFor(input.target.boundingBox),
  ).toLowerCase();
  const verifiedAnswer = `The approved ${roomName} image shows ${input.target.description.toLowerCase()} on the ${input.target.location}, in the ${imageRegion} region.`;
  const appearanceClue = {
    kind: "appearance" as const,
    label: "Object to remember",
    detail: input.target.description,
  };
  const placeClue = {
    kind: "place" as const,
    label: "Place to remember",
    detail: `On the ${input.target.location}`,
  };
  const regionClue = {
    kind: "spatial_rule" as const,
    label: "Room position",
    detail: `The ${imageRegion} of the approved ${roomName} image`,
  };

  switch (input.type) {
    case "object_recognition":
      if (input.typeOccurrence > 0) {
        return {
          challengeTitle: "Picture it, then find it",
          prompt: `After picturing where the ${name} appears in this ${roomName}, which numbered area shows ${description} on the ${location}, in the ${imageRegion} region?`,
          instruction:
            "Recall the object-place pair first, then use the visible room to check your memory before choosing.",
          evidenceClues: [
            appearanceClue,
            {
              ...placeClue,
              label: "Object-place pair",
            },
            {
              ...regionClue,
              label: "Position to picture",
            },
          ],
          verbalCue: `Picture the ${name} on the ${location}, then look toward the ${imageRegion}.`,
          answerExplanation: verifiedAnswer,
        };
      }
      return {
        challengeTitle: "Learn a room anchor",
        prompt: `To learn one anchor in this ${roomName}, which numbered object is ${description}, on the ${location}, in the ${imageRegion} region?`,
        instruction: `Touch it, then remember the pair "${input.target.name} on the ${input.target.location}."`,
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Think "${name} on the ${location}," then look in the ${imageRegion}.`,
        answerExplanation: verifiedAnswer,
      };
    case "location_matching":
      return {
        challengeTitle: "Link the object and place",
        prompt: `Which numbered area completes this ${roomName} object-place memory: the ${name} on the ${location}, in the ${imageRegion} region?`,
        instruction: `Say "${input.target.name} on the ${input.target.location}" if helpful, then touch that object in the room.`,
        evidenceClues: [
          {
            kind: "appearance" as const,
            label: "Object to link",
            detail: `${input.target.name}, visibly described as ${input.target.description.toLowerCase()}`,
          },
          placeClue,
          regionClue,
        ],
        verbalCue: `Recall the pair "${name} on the ${location}," then check the ${imageRegion}.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_search":
      if (input.reference && input.relation) {
        return {
          challengeTitle: "Find it from a landmark",
          prompt: `Starting at the ${input.reference.name.toLowerCase()} on the ${input.reference.location.toLowerCase()}, which object is ${input.relation} that landmark and looks like ${description}?`,
          instruction: `Use a route through the ${roomName}: find the landmark, move ${input.relation}, then confirm the object.`,
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "Start here",
              detail: `${input.reference.description} on the ${input.reference.location}`,
            },
            {
              kind: "spatial_rule" as const,
              label: "Move from it",
              detail: `${input.relation[0]?.toUpperCase()}${input.relation.slice(1)} the landmark`,
            },
            appearanceClue,
          ],
          verbalCue: `Picture the ${input.reference.name.toLowerCase()}, move ${input.relation}, then look for ${description}.`,
          answerExplanation: `${verifiedAnswer} It also appears ${input.relation} the ${input.reference.name.toLowerCase()} in the approved image.`,
        };
      }
      return {
        challengeTitle: "Rehearse a room location",
        prompt: `Which object shows where the ${name} appears in this ${roomName}: ${description} on the ${location}, in the ${imageRegion} region?`,
        instruction:
          "Look across the room in one steady direction, then connect the object with its place.",
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Picture the ${location}, look toward the ${imageRegion}, then find ${description}.`,
        answerExplanation: verifiedAnswer,
      };
    case "visual_recall": {
      const zone = recallZoneFor(input.target.boundingBox);
      return {
        challengeTitle: "Study, hide, remember",
        prompt: `Study where the ${name} appears in this ${roomName} and, after the room is hidden, recall its exact region: upper or lower, then left, middle, or right.`,
        instruction: `Hold the pair "${input.target.name} on the ${input.target.location}" in mind, then remember one row and one column. Hide the room when you feel ready.`,
        evidenceClues: [
          appearanceClue,
          {
            ...placeClue,
            label: "Object-place pair",
          },
          {
            kind: "spatial_rule" as const,
            label: "Position to hold",
            detail:
              "One row (upper or lower) and one column (left, middle, or right)",
          },
        ],
        verbalCue: `Picture the ${input.target.name.toLowerCase()} on the ${location}, then recall one row and one column.`,
        answerExplanation: `The approved ${roomName} image places the ${input.target.name} on the ${location}, in the ${recallZoneLabel(zone).toLowerCase()} region.`,
      };
    }
    case "association":
      if (
        input.reference &&
        input.reference.location.toLowerCase() === location
      ) {
        return {
          challengeTitle: "Link two room objects",
          prompt: `While you picture the ${input.reference.name.toLowerCase()} on the ${location}, which different object shares that place and looks like ${description}?`,
          instruction:
            "Hold the first object and shared place in mind, then choose the second object that completes the pair.",
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "First object",
              detail: input.reference.description,
            },
            {
              kind: "place" as const,
              label: "Shared place",
              detail: `Choose a different object on the same ${input.target.location}`,
            },
            appearanceClue,
          ],
          verbalCue: `Picture the ${input.reference.name.toLowerCase()} on the ${location}, then add ${description} beside it.`,
          answerExplanation: `The approved ${roomName} image shows both the ${input.reference.name} and the ${input.target.name} on the ${input.target.location}.`,
        };
      }
      if (input.reference && input.relation) {
        return {
          challengeTitle: "Connect two room landmarks",
          prompt: `After you picture the ${input.reference.name.toLowerCase()}, which object is ${input.relation} it and looks like ${description}?`,
          instruction:
            "Connect the two objects by their visible direction, then choose the object that completes the pair.",
          evidenceClues: [
            {
              kind: "landmark" as const,
              label: "First object",
              detail: input.reference.description,
            },
            {
              kind: "spatial_rule" as const,
              label: "How they connect",
              detail: `${input.relation[0]?.toUpperCase()}${input.relation.slice(1)} the landmark`,
            },
            appearanceClue,
          ],
          verbalCue: `Picture the ${input.reference.name.toLowerCase()}, move ${input.relation}, then add ${description}.`,
          answerExplanation: `${verifiedAnswer} It appears ${input.relation} the ${input.reference.name}.`,
        };
      }
      return {
        challengeTitle: "Connect an object with its place",
        prompt: `Complete this ${roomName} connection: which object looks like ${description} and appears on the ${location}, in the ${imageRegion} region?`,
        instruction:
          "Picture the place first, then choose the object that completes the room connection.",
        evidenceClues: [appearanceClue, placeClue, regionClue],
        verbalCue: `Picture the ${location} in the ${imageRegion}, then add ${description}.`,
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
      roomName: evidence.worldModel.roomName,
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
