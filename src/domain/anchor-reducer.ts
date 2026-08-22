import {
  anchorStateSchema,
  type AnchorState,
  type GroundingRecord,
  type Guide,
  type Lesson,
  type TrustedPerson,
  type WorldModel,
} from "@/domain/anchor";
import { advanceCue } from "@/domain/cue-engine";
import { createDraftAnchorState } from "@/fixtures/demo";

export type AnchorAction =
  | { type: "hydrate"; state: AnchorState }
  | { type: "reset_draft" }
  | { type: "save_profile"; firstName: string; roomName: string }
  | { type: "room_status"; status: AnchorState["room"]["uploadStatus"] }
  | {
      type: "analysis_completed";
      worldModel: WorldModel;
      groundingRecords: GroundingRecord[];
    }
  | { type: "update_object"; objectId: string; name: string; location: string }
  | { type: "approve_world_model"; confirmedAt: string }
  | { type: "save_trusted_person"; trustedPerson: TrustedPerson }
  | { type: "guide_generated"; guide: Guide }
  | { type: "use_neutral_guide" }
  | { type: "approve_guide" }
  | { type: "lesson_generated"; lesson: Lesson }
  | { type: "approve_lesson" }
  | { type: "start_session" }
  | { type: "answer"; correct: boolean }
  | { type: "help" }
  | { type: "continue_session" }
  | { type: "reset_session" };

export function anchorReducer(
  state: AnchorState,
  action: AnchorAction,
): AnchorState {
  let next: AnchorState;

  switch (action.type) {
    case "hydrate":
      return anchorStateSchema.parse(action.state);
    case "reset_draft":
      return createDraftAnchorState();
    case "save_profile":
      next = {
        ...state,
        patient: { ...state.patient, firstName: action.firstName.trim() },
        room: { ...state.room, name: action.roomName.trim() },
        worldModel: { ...state.worldModel, roomName: action.roomName.trim() },
      };
      break;
    case "room_status":
      next = { ...state, room: { ...state.room, uploadStatus: action.status } };
      break;
    case "analysis_completed":
      next = {
        ...state,
        room: { ...state.room, uploadStatus: "analyzed" },
        worldModel: action.worldModel,
        groundingRecords: action.groundingRecords,
        guide: null,
        lesson: null,
      };
      break;
    case "update_object": {
      const caregiverValue = `${action.name.trim()} on the ${action.location.trim()}`;
      next = {
        ...state,
        worldModel: {
          ...state.worldModel,
          approval: "draft",
          objects: state.worldModel.objects.map((object) =>
            object.id === action.objectId
              ? {
                  ...object,
                  name: action.name.trim(),
                  location: action.location.trim(),
                  approval: "draft",
                }
              : object,
          ),
        },
        groundingRecords: state.groundingRecords.map((record) =>
          record.id ===
          state.worldModel.objects.find(({ id }) => id === action.objectId)
            ?.groundingRecordId
            ? { ...record, caregiverValue, approval: "draft" }
            : record,
        ),
      };
      break;
    }
    case "approve_world_model":
      next = {
        ...state,
        worldModel: {
          ...state.worldModel,
          revision: state.worldModel.revision + 1,
          approval: "approved",
          objects: state.worldModel.objects.map((object) => ({
            ...object,
            approval: "approved",
          })),
        },
        groundingRecords: state.groundingRecords.map((record) => ({
          ...record,
          caregiverConfirmedAt: action.confirmedAt,
          caregiverConfirmedBy: "Demo caregiver",
          approval: "approved",
        })),
      };
      break;
    case "save_trusted_person":
      next = { ...state, trustedPerson: action.trustedPerson, guide: null };
      break;
    case "guide_generated":
      next = { ...state, guide: action.guide };
      break;
    case "use_neutral_guide":
      next = {
        ...state,
        guide: {
          id: "guide-neutral",
          trustedPersonId: state.trustedPerson.id,
          presentation: "neutral",
          imageSrc: "/fixtures/neutral-guide.svg",
          label: "AI-generated neutral guide",
          approval: "draft",
        },
      };
      break;
    case "approve_guide":
      if (!state.guide) {
        return state;
      }
      next = { ...state, guide: { ...state.guide, approval: "approved" } };
      break;
    case "lesson_generated":
      next = { ...state, lesson: action.lesson };
      break;
    case "approve_lesson":
      if (!state.lesson) {
        return state;
      }
      next = {
        ...state,
        lesson: { ...state.lesson, approval: "approved" },
        session: {
          lessonId: state.lesson.id,
          questionIndex: 0,
          cueLevel: "none",
          status: "idle",
          feedback: "idle",
        },
      };
      break;
    case "start_session":
      if (
        state.lesson?.approval !== "approved" ||
        state.guide?.approval !== "approved"
      ) {
        return state;
      }
      next = {
        ...state,
        session: {
          ...state.session,
          questionIndex: 0,
          cueLevel: "none",
          status: "active",
          feedback: "idle",
        },
      };
      break;
    case "answer": {
      const cueLevel = action.correct
        ? state.session.cueLevel
        : advanceCue(state.session.cueLevel);
      next = {
        ...state,
        session: {
          ...state.session,
          cueLevel,
          feedback: action.correct
            ? "correct"
            : cueLevel === "reveal"
              ? "revealed"
              : "encouragement",
        },
      };
      break;
    }
    case "help": {
      const cueLevel = advanceCue(state.session.cueLevel);
      next = {
        ...state,
        session: {
          ...state.session,
          cueLevel,
          feedback: cueLevel === "reveal" ? "revealed" : "encouragement",
        },
      };
      break;
    }
    case "continue_session":
      next = {
        ...state,
        session:
          state.session.questionIndex === 5
            ? { ...state.session, status: "complete", feedback: "idle" }
            : {
                ...state.session,
                questionIndex: state.session.questionIndex + 1,
                cueLevel: "none",
                feedback: "idle",
              },
      };
      break;
    case "reset_session":
      next = {
        ...state,
        session: {
          ...state.session,
          questionIndex: 0,
          cueLevel: "none",
          status: "idle",
          feedback: "idle",
        },
      };
      break;
  }

  return anchorStateSchema.parse(next);
}
