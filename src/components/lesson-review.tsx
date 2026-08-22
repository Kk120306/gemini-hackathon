"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { ArrowRightIcon, CheckIcon, EyeIcon } from "@/components/icons";
import type { LessonQuestion } from "@/domain/anchor";

const typeLabels: Record<LessonQuestion["type"], string> = {
  object_recognition: "Recognition",
  location_matching: "Location",
  visual_search: "Visual search",
  visual_recall: "Visual recall",
  sequencing: "Sequence",
  association: "Association",
};

export function LessonReview() {
  const router = useRouter();
  const { state, generateLesson, approveLesson } = useAnchorState();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createLesson() {
    setBusy(true);
    setError(null);
    try {
      await generateLesson();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    approveLesson();
    router.push("/patient");
  }

  return (
    <>
      <section className="panel lesson-panel">
        <div className="panel__header">
          <h2>{state.patient.firstName}&apos;s bedroom activity</h2>
          <span className="muted-note">No score or timer</span>
        </div>
        {state.lesson ? (
          <ol className="lesson-list">
            {state.lesson.questions.map((question, index) => (
              <li key={question.id}>
                <span className="lesson-list__number">{index + 1}</span>
                <div className="lesson-list__question">
                  <span>{typeLabels[question.type]}</span>
                  <strong>{question.prompt}</strong>
                  <small>
                    {question.interactionMode === "recall_zone"
                      ? "Spatial recall map"
                      : question.selectableObjectIds.length +
                        " room anchors"}{" "}
                    · Answer: {question.correctAnswer}
                  </small>
                  <small>{question.answerExplanation}</small>
                </div>
                <span className="lesson-list__evidence">
                  <EyeIcon /> Grounded
                </span>
                <span className="lesson-list__check">
                  <CheckIcon />
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <div className="lesson-empty">
            <EyeIcon />
            <h2>Generate from approved evidence</h2>
            <p>
              {state.room.analysisSource === "gemma"
                ? "Gemma will plan exactly six questions from approved identifiers. ANCHOR compiles every prompt, answer, choice, and cue from approved facts."
                : "The fixture provider will return exactly six validated questions, including one visual recall and one association activity."}
            </p>
            <button
              className="primary-button"
              type="button"
              onClick={createLesson}
              disabled={busy || state.worldModel.approval !== "approved"}
            >
              {busy ? "Generating six questions…" : "Generate six questions"}
            </button>
            {error ? (
              <p className="form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <div className="lesson-summary">
        <div>
          <CheckIcon />
          <span>
            <strong>Composition enforced in code</strong>4 familiar-room
            questions + 2 gentle cognitive activities
          </span>
        </div>
        <div className="form-actions">
          <Link className="quiet-button" href="/caregiver/guide">
            Back
          </Link>
          <button
            className="primary-button"
            type="button"
            onClick={approve}
            disabled={!state.lesson}
          >
            Approve and open patient mode
            <ArrowRightIcon />
          </button>
        </div>
      </div>
    </>
  );
}
