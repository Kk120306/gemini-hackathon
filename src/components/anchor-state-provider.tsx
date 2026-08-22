"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";

import type { AnchorState, TrustedPerson } from "@/domain/anchor";
import { anchorReducer } from "@/domain/anchor-reducer";
import {
  createPendingSimplifiedRoomJob,
  runSimplifiedRoomJob,
} from "@/domain/media-job-runner";
import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState } from "@/fixtures/demo";
import {
  BrowserAiProvider,
  prepareRoomAnalysisInput,
} from "@/providers/browser-ai-provider";
import { BrowserAnchorStorage } from "@/storage/browser-storage-adapter";

type AnchorContextValue = {
  state: AnchorState;
  ready: boolean;
  beginCaregiverReview(): void;
  saveProfile(firstName: string, roomName: string): void;
  analyzeRoom(file?: File): Promise<void>;
  updateObject(objectId: string, name: string, location: string): void;
  approveWorldModel(): void;
  saveTrustedPerson(input: {
    name: string;
    relationship: string;
    likenessConsent: boolean;
  }): void;
  generateGuide(): Promise<void>;
  useNeutralGuide(): void;
  approveGuide(): void;
  generateLesson(): Promise<void>;
  approveLesson(): void;
  prepareSpatialScene(): void;
  startSession(): void;
  answer(choice: string): void;
  requestHelp(): void;
  continueSession(): void;
  resetSession(): void;
};

const AnchorContext = createContext<AnchorContextValue | null>(null);

export function AnchorStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    anchorReducer,
    undefined,
    createPreparedAnchorState,
  );
  const [ready, markReady] = useReducer(() => true, false);
  const storage = useMemo(() => new BrowserAnchorStorage(), []);
  const provider = useMemo(() => new BrowserAiProvider(), []);
  const storageReady = useRef(false);
  const skipNextSave = useRef(false);
  const activeMediaJobs = useRef(new Set<string>());
  const lateMediaJobs = useRef(
    new Map<string, AnchorState["mediaJobs"][number]>(),
  );

  useEffect(() => {
    const stored = storage.load();
    if (stored) {
      skipNextSave.current = true;
      dispatch({ type: "hydrate", state: stored });
    }
    storageReady.current = true;
    markReady();
  }, [storage]);

  useEffect(() => {
    if (!storageReady.current) {
      return;
    }
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    storage.save(state);
  }, [state, storage]);

  const value = useMemo<AnchorContextValue>(() => {
    function prefetchSimplifiedRoom(input?: {
      lesson: NonNullable<AnchorState["lesson"]>;
      questionIndex: number;
      spatialPreview?: boolean;
    }) {
      const lesson = input?.lesson ?? state.lesson;
      const question =
        lesson?.questions[input?.questionIndex ?? state.session.questionIndex];
      if (
        !lesson ||
        !question ||
        (!input?.spatialPreview && lesson.approval !== "approved")
      ) {
        return;
      }
      const pendingJob = createPendingSimplifiedRoomJob({
        lessonId: lesson.id,
        questionId: question.id,
        targetObjectId: question.targetObjectId,
        fallbackSrc: state.room.imageSrc,
      });
      if (
        activeMediaJobs.current.has(pendingJob.id) ||
        state.mediaJobs.some(({ id }) => id === pendingJob.id)
      ) {
        return;
      }
      activeMediaJobs.current.add(pendingJob.id);
      dispatch({ type: "media_job_updated", job: pendingJob });
      void runSimplifiedRoomJob({
        pendingJob,
        ...(input?.spatialPreview ? { budgetMs: 45_000 } : {}),
        onLateResult(job) {
          lateMediaJobs.current.set(job.id, job);
        },
        generate: () =>
          provider.generateSimplifiedRoom({
            sourceImageSrc: state.room.imageSrc,
            worldModel: state.worldModel,
            groundingRecords: state.groundingRecords,
            targetObjectId: question.targetObjectId,
          }),
      }).then((job) => {
        activeMediaJobs.current.delete(pendingJob.id);
        dispatch({ type: "media_job_updated", job });
      });
    }

    function publishLateMediaForCurrentQuestion() {
      const lesson = state.lesson;
      const question = lesson?.questions[state.session.questionIndex];
      if (!lesson || !question) {
        return;
      }
      const jobId = `media-room-${lesson.id}-${question.id}`;
      const job = lateMediaJobs.current.get(jobId);
      if (!job) {
        return;
      }
      lateMediaJobs.current.delete(jobId);
      dispatch({ type: "media_job_updated", job });
    }

    return {
      state,
      ready,
      beginCaregiverReview() {
        dispatch({ type: "reset_draft" });
      },
      saveProfile(firstName, roomName) {
        dispatch({ type: "save_profile", firstName, roomName });
      },
      async analyzeRoom(file) {
        dispatch({ type: "room_status", status: "analyzing" });
        try {
          const input = await prepareRoomAnalysisInput({
            roomId: state.room.id,
            roomName: state.room.name,
            ...(file ? { file } : {}),
          });
          const analysis = await provider.analyzeRoom(input);
          if (!analysis.imageSrc) {
            throw new Error("The analyzed room image was not stored.");
          }
          dispatch({
            type: "analysis_completed",
            ...analysis,
            imageSrc: analysis.imageSrc,
          });
        } catch {
          dispatch({ type: "room_status", status: "failed" });
          throw new Error("The prepared room could not be analyzed.");
        }
      },
      updateObject(objectId, name, location) {
        dispatch({ type: "update_object", objectId, name, location });
      },
      approveWorldModel() {
        dispatch({
          type: "approve_world_model",
          confirmedAt: new Date().toISOString(),
        });
      },
      saveTrustedPerson({ name, relationship, likenessConsent }) {
        const consentedAt = likenessConsent
          ? new Date().toISOString()
          : undefined;
        const trustedPerson: TrustedPerson = {
          ...state.trustedPerson,
          name: name.trim(),
          relationship: relationship.trim(),
          likenessConsent,
          consentedBy: likenessConsent ? "Demo caregiver" : undefined,
          consentedAt,
        };
        dispatch({ type: "save_trusted_person", trustedPerson });
      },
      async generateGuide() {
        const guide = await provider.generateGuide(state.trustedPerson);
        dispatch({ type: "guide_generated", guide });
      },
      useNeutralGuide() {
        dispatch({ type: "use_neutral_guide" });
      },
      approveGuide() {
        dispatch({ type: "approve_guide" });
      },
      async generateLesson() {
        const lesson = await provider.generateLesson(
          state.worldModel,
          state.groundingRecords,
        );
        const validatedLesson = validateGroundedLesson(
          lesson,
          state.worldModel,
          state.groundingRecords,
        );
        dispatch({
          type: "lesson_generated",
          lesson: validatedLesson,
        });
        prefetchSimplifiedRoom({
          lesson: validatedLesson,
          questionIndex: 0,
          spatialPreview: true,
        });
      },
      approveLesson() {
        dispatch({ type: "approve_lesson" });
      },
      prepareSpatialScene() {
        if (state.lesson) {
          prefetchSimplifiedRoom({
            lesson: state.lesson,
            questionIndex: 0,
            spatialPreview: true,
          });
        }
      },
      startSession() {
        dispatch({ type: "start_session" });
      },
      answer(choice) {
        const question = state.lesson?.questions[state.session.questionIndex];
        if (question) {
          publishLateMediaForCurrentQuestion();
          const correct = choice === question.correctAnswer;
          if (!correct) {
            prefetchSimplifiedRoom();
          }
          dispatch({
            type: "answer",
            correct,
          });
        }
      },
      requestHelp() {
        publishLateMediaForCurrentQuestion();
        prefetchSimplifiedRoom();
        dispatch({ type: "help" });
      },
      continueSession() {
        dispatch({ type: "continue_session" });
      },
      resetSession() {
        dispatch({ type: "reset_session" });
      },
    };
  }, [provider, ready, state]);

  return (
    <AnchorContext.Provider value={value}>{children}</AnchorContext.Provider>
  );
}

export function useAnchorState(): AnchorContextValue {
  const context = useContext(AnchorContext);
  if (!context) {
    throw new Error("useAnchorState must be used inside AnchorStateProvider.");
  }
  return context;
}
