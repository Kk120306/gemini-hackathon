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
import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState } from "@/fixtures/demo";
import { FakeAiProvider } from "@/providers/fake-ai-provider";
import { BrowserAnchorStorage } from "@/storage/browser-storage-adapter";

type AnchorContextValue = {
  state: AnchorState;
  ready: boolean;
  beginCaregiverReview(): void;
  saveProfile(firstName: string, roomName: string): void;
  analyzeRoom(): Promise<void>;
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
  const provider = useMemo(() => new FakeAiProvider(), []);
  const storageReady = useRef(false);
  const skipNextSave = useRef(false);

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

  const value = useMemo<AnchorContextValue>(
    () => ({
      state,
      ready,
      beginCaregiverReview() {
        dispatch({ type: "reset_draft" });
      },
      saveProfile(firstName, roomName) {
        dispatch({ type: "save_profile", firstName, roomName });
      },
      async analyzeRoom() {
        dispatch({ type: "room_status", status: "analyzing" });
        try {
          const analysis = await provider.analyzeRoom(state.room.name);
          dispatch({ type: "analysis_completed", ...analysis });
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
        dispatch({
          type: "lesson_generated",
          lesson: validateGroundedLesson(
            lesson,
            state.worldModel,
            state.groundingRecords,
          ),
        });
      },
      approveLesson() {
        dispatch({ type: "approve_lesson" });
      },
      startSession() {
        dispatch({ type: "start_session" });
      },
      answer(choice) {
        const question = state.lesson?.questions[state.session.questionIndex];
        if (question) {
          dispatch({
            type: "answer",
            correct: choice === question.correctAnswer,
          });
        }
      },
      requestHelp() {
        dispatch({ type: "help" });
      },
      continueSession() {
        dispatch({ type: "continue_session" });
      },
      resetSession() {
        dispatch({ type: "reset_session" });
      },
    }),
    [provider, ready, state],
  );

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
