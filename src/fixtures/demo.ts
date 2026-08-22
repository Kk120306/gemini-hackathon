import {
  anchorStateSchema,
  type AnchorState,
  type GroundingRecord,
  type Lesson,
  type WorldModel,
} from "@/domain/anchor";
import { compileGroundedLesson } from "@/domain/lesson-compiler";

const confirmedAt = "2026-08-22T09:00:00.000Z";

const preparedWorldModel: WorldModel = {
  id: "world-bedroom-1",
  roomName: "Bedroom",
  revision: 1,
  approval: "approved",
  objects: [
    {
      id: "object-glasses",
      name: "Reading glasses",
      location: "bedside table",
      description: "Dark blue reading glasses",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-glasses",
      boundingBox: { x: 0.76, y: 0.56, width: 0.16, height: 0.09 },
      approval: "approved",
    },
    {
      id: "object-lamp",
      name: "Lamp",
      location: "bedside table",
      description: "Cream lamp with a green base",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-lamp",
      boundingBox: { x: 0.77, y: 0.2, width: 0.14, height: 0.37 },
      approval: "approved",
    },
    {
      id: "object-mug",
      name: "Blue mug",
      location: "dresser",
      description: "Small blue ceramic mug",
      sourceImageId: "room-bedroom-1",
      groundingRecordId: "grounding-mug",
      boundingBox: { x: 0.165, y: 0.5, width: 0.115, height: 0.2 },
      approval: "approved",
    },
  ],
};

const preparedGroundingRecords: GroundingRecord[] = [
  {
    id: "grounding-glasses",
    sourceType: "visual",
    sourceImageId: "room-bedroom-1",
    sourceCrop: preparedWorldModel.objects[0]?.boundingBox,
    modelObservation: "Dark glasses are visible on the table beside the bed.",
    caregiverValue: "Reading glasses on the bedside table",
    caregiverConfirmedAt: confirmedAt,
    caregiverConfirmedBy: "Demo caregiver",
    approval: "approved",
  },
  {
    id: "grounding-lamp",
    sourceType: "visual",
    sourceImageId: "room-bedroom-1",
    sourceCrop: preparedWorldModel.objects[1]?.boundingBox,
    modelObservation: "A lamp is visible on the table beside the bed.",
    caregiverValue: "Lamp on the bedside table",
    caregiverConfirmedAt: confirmedAt,
    caregiverConfirmedBy: "Demo caregiver",
    approval: "approved",
  },
  {
    id: "grounding-mug",
    sourceType: "visual",
    sourceImageId: "room-bedroom-1",
    sourceCrop: preparedWorldModel.objects[2]?.boundingBox,
    modelObservation: "A blue mug is visible on the dresser.",
    caregiverValue: "Blue mug on the dresser",
    caregiverConfirmedAt: confirmedAt,
    caregiverConfirmedBy: "Demo caregiver",
    approval: "approved",
  },
];

const compiledPreparedLesson = compileGroundedLesson(
  {
    questions: [
      {
        type: "object_recognition",
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-lamp", "object-mug"],
      },
      {
        type: "location_matching",
        targetObjectId: "object-mug",
        choiceObjectIds: ["object-mug", "object-glasses"],
      },
      {
        type: "visual_search",
        targetObjectId: "object-lamp",
        choiceObjectIds: ["object-lamp", "object-glasses", "object-mug"],
      },
      {
        type: "object_recognition",
        targetObjectId: "object-mug",
        choiceObjectIds: ["object-mug", "object-glasses", "object-lamp"],
      },
      {
        type: "visual_recall",
        targetObjectId: "object-lamp",
        choiceObjectIds: ["object-lamp", "object-glasses", "object-mug"],
      },
      {
        type: "association",
        targetObjectId: "object-glasses",
        choiceObjectIds: ["object-glasses", "object-lamp", "object-mug"],
      },
    ],
  },
  preparedWorldModel,
  preparedGroundingRecords,
);

const preparedLesson: Lesson = {
  ...compiledPreparedLesson,
  id: "lesson-bedroom-1",
  approval: "approved",
};

const preparedState = anchorStateSchema.parse({
  version: 1,
  patient: { id: "patient-maya", firstName: "Maya" },
  room: {
    id: "room-bedroom-1",
    name: "Bedroom",
    imageSrc: "/fixtures/bedroom.svg",
    uploadStatus: "analyzed",
  },
  worldModel: preparedWorldModel,
  groundingRecords: preparedGroundingRecords,
  trustedPerson: {
    id: "trusted-elena",
    name: "Elena",
    relationship: "daughter",
    referenceImageSrcs: [
      "/fixtures/elena-reference-1.svg",
      "/fixtures/elena-reference-2.svg",
    ],
    likenessConsent: true,
    consentedBy: "Demo caregiver",
    consentedAt: confirmedAt,
  },
  guide: {
    id: "guide-elena",
    trustedPersonId: "trusted-elena",
    presentation: "stylized_likeness",
    imageSrc: "/fixtures/elena-guide.svg",
    label: "AI-generated guide based on Elena",
    approval: "approved",
  },
  lesson: preparedLesson,
  mediaJobs: [
    {
      id: "media-guide-fixture",
      kind: "guide_image",
      status: "completed",
      fallbackSrc: "/fixtures/neutral-guide.svg",
      outputSrc: "/fixtures/elena-guide.svg",
      validationPassed: true,
    },
  ],
  session: {
    lessonId: preparedLesson.id,
    questionIndex: 0,
    cueLevel: "none",
    status: "idle",
    feedback: "idle",
  },
});

function cloneState(state: AnchorState): AnchorState {
  return anchorStateSchema.parse(structuredClone(state));
}

export function createPreparedAnchorState(): AnchorState {
  return cloneState(preparedState);
}

export function createDraftAnchorState(): AnchorState {
  const state = cloneState(preparedState);
  state.room.uploadStatus = "ready";
  state.worldModel.approval = "draft";
  state.worldModel.objects = state.worldModel.objects.map((object) => ({
    ...object,
    approval: "draft",
  }));
  state.groundingRecords = state.groundingRecords.map((record) => ({
    ...record,
    caregiverConfirmedAt: undefined,
    caregiverConfirmedBy: undefined,
    approval: "draft",
  }));
  state.trustedPerson = {
    ...state.trustedPerson,
    likenessConsent: false,
    consentedAt: undefined,
    consentedBy: undefined,
  };
  state.guide = null;
  state.lesson = null;
  state.mediaJobs = [];
  state.session = {
    lessonId: preparedLesson.id,
    questionIndex: 0,
    cueLevel: "none",
    status: "idle",
    feedback: "idle",
  };

  return anchorStateSchema.parse(state);
}

export const demoFixture = {
  patient: preparedState.patient,
  room: preparedState.room,
  objects: preparedState.worldModel.objects,
  groundingRecords: preparedState.groundingRecords,
  trustedPerson: {
    ...preparedState.trustedPerson,
    guideImageSrc:
      preparedState.guide?.imageSrc ?? "/fixtures/neutral-guide.svg",
  },
  questions: preparedLesson.questions,
};
