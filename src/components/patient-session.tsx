"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import {
  ArrowRightIcon,
  CheckIcon,
  HelpIcon,
  ReplayIcon,
  VolumeIcon,
} from "@/components/icons";
import { GroundingOverlay } from "@/components/grounding-overlay";
import { cueIncludes } from "@/domain/cue-engine";
import { chooseHorizontalObjectPosition } from "@/domain/cover-geometry";

export function PatientSession() {
  const router = useRouter();
  const { state, ready, startSession, answer, requestHelp, continueSession } =
    useAnchorState();
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const question = state.lesson?.questions[state.session.questionIndex];
  const target = useMemo(
    () =>
      state.worldModel.objects.find(
        (object) => object.id === question?.targetObjectId,
      ),
    [question, state.worldModel.objects],
  );
  const mediaJob = useMemo(
    () =>
      state.mediaJobs.find(
        (job) =>
          job.kind === "simplified_room" &&
          job.lessonId === state.lesson?.id &&
          job.questionId === question?.id,
      ),
    [question?.id, state.lesson?.id, state.mediaJobs],
  );

  useEffect(() => {
    if (
      ready &&
      state.session.status === "idle" &&
      state.lesson?.approval === "approved" &&
      state.guide?.approval === "approved"
    ) {
      startSession();
    }
  }, [
    startSession,
    ready,
    state.guide?.approval,
    state.lesson?.approval,
    state.session.status,
  ]);

  if (!ready) {
    return (
      <main className="patient-session patient-session--blocked" aria-busy>
        <section className="panel lesson-gate">
          <h1>Loading the approved activity.</h1>
          <p>Checking the caregiver-approved guide and questions.</p>
        </section>
      </main>
    );
  }

  if (!question || !state.lesson || !state.guide) {
    return (
      <main className="patient-session patient-session--blocked">
        <section className="panel lesson-gate">
          <h1>This activity needs caregiver approval.</h1>
          <p>No unapproved question or guide can appear in patient mode.</p>
          <Link className="primary-button" href="/caregiver">
            Return to caregiver setup
          </Link>
        </section>
      </main>
    );
  }

  const activeQuestion = question;

  const showVerbal = cueIncludes(state.session.cueLevel, "verbal");
  const showFocus = cueIncludes(state.session.cueLevel, "focus");
  const showSimplified = cueIncludes(state.session.cueLevel, "simplified");
  const showReveal = cueIncludes(state.session.cueLevel, "reveal");
  const generatedSceneReady = Boolean(
    showSimplified &&
    mediaJob?.status === "completed" &&
    mediaJob.validationPassed &&
    mediaJob.validation?.safeToDisplay &&
    mediaJob.outputSrc,
  );
  const generatedSceneLabel =
    mediaJob?.generationModel === "fixture-simplifier-v1"
      ? "Prepared simplified view"
      : "AI-generated simplified view";
  const correct = state.session.feedback === "correct";
  const objectPositionX = target
    ? chooseHorizontalObjectPosition(target.boundingBox)
    : 0.5;

  function speakPrompt() {
    const speech = window.speechSynthesis;
    if (!speech || typeof SpeechSynthesisUtterance === "undefined") {
      setSpeechMessage(
        "Audio is unavailable. The full prompt remains visible.",
      );
      return;
    }

    speech.cancel();
    const text = showVerbal
      ? `${activeQuestion.prompt} ${activeQuestion.verbalCue}`
      : activeQuestion.prompt;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1;
    speech.speak(utterance);
    setSpeechMessage("Reading the prompt aloud with a generic device voice.");
  }

  function moveNext() {
    const finalQuestion = state.session.questionIndex === 5;
    continueSession();
    if (finalQuestion) {
      router.push("/patient/complete");
    }
  }

  return (
    <main className="patient-session">
      <div
        className="session-progress"
        aria-label={`Question ${state.session.questionIndex + 1} of 6`}
      >
        <div className="session-progress__dots" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <i
              key={index}
              className={
                index < state.session.questionIndex
                  ? "session-progress__dot--complete"
                  : index === state.session.questionIndex
                    ? "session-progress__dot--current"
                    : undefined
              }
            />
          ))}
        </div>
        <span>Question {state.session.questionIndex + 1} of 6</span>
        <Link href="/">Leave activity</Link>
      </div>

      <section className="session-stage" aria-labelledby="question-prompt">
        <div
          className={`session-scene${showSimplified ? " session-scene--simplified" : ""}${generatedSceneReady ? " session-scene--generated" : ""}`}
          data-cue-level={state.session.cueLevel}
          data-media-status={mediaJob?.status ?? "idle"}
          data-scene-source={generatedSceneReady ? "generated" : "verified"}
        >
          <Image
            className="session-scene__base"
            src={state.room.imageSrc}
            alt={`Approved ${state.room.name.toLowerCase()} view`}
            fill
            priority
            sizes="(max-width: 900px) 100vw, 62vw"
            unoptimized
            style={{ objectPosition: `${objectPositionX * 100}% 50%` }}
          />
          {mediaJob?.outputSrc ? (
            <Image
              className="session-scene__generated"
              src={mediaJob.outputSrc}
              alt={`${generatedSceneLabel} of the approved ${state.room.name.toLowerCase()}`}
              fill
              sizes="(max-width: 900px) 100vw, 62vw"
              unoptimized
            />
          ) : null}
          {showFocus && target && !generatedSceneReady ? (
            <GroundingOverlay
              className="session-scene__focus"
              box={target.boundingBox}
              positionX={objectPositionX}
              label={`Visual focus around ${target.name}`}
            />
          ) : null}
          <span className="scene-label">
            {generatedSceneReady
              ? generatedSceneLabel
              : showSimplified
                ? "Verified simplified fallback"
                : showFocus
                  ? "Verified area highlighted"
                  : "Familiar bedroom"}
          </span>
          {mediaJob?.status === "pending" && !showSimplified ? (
            <span className="scene-media-status" role="status">
              Preparing next visual cue
            </span>
          ) : null}
        </div>

        <div className="session-panel">
          <div className="session-guide">
            <Image
              src={state.guide.imageSrc}
              alt={state.guide.label}
              width={76}
              height={90}
              unoptimized
            />
            <span>
              {state.guide.presentation === "neutral"
                ? "ANCHOR"
                : state.trustedPerson.name}
              <small>{state.guide.label}</small>
            </span>
          </div>

          <div className="session-question">
            <div className="session-question__label">
              <VolumeIcon />
              Look at the room
            </div>
            <h1 id="question-prompt">{question.prompt}</h1>
          </div>

          <div className="answer-grid" aria-label="Answer choices">
            {question.choices.map((choice, index) => (
              <button
                type="button"
                key={choice}
                onClick={() => answer(choice)}
                disabled={correct}
                aria-label={`Answer ${choice}`}
                className={
                  choice === question.correctAnswer
                    ? correct
                      ? "answer-grid__correct"
                      : showReveal
                        ? "answer-grid__revealed"
                        : undefined
                    : undefined
                }
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {choice}
              </button>
            ))}
          </div>

          <div className="session-feedback" aria-live="polite">
            {correct ? (
              <p className="session-feedback--correct">
                <CheckIcon /> That matches the room. We can keep going.
              </p>
            ) : showReveal ? (
              <p>
                The answer is <strong>{question.correctAnswer}</strong>. You can
                choose it when you are ready.
              </p>
            ) : showVerbal ? (
              <p>
                {question.encouragement} <strong>{question.verbalCue}</strong>
              </p>
            ) : (
              <p>Choose the answer that feels right.</p>
            )}
          </div>

          {correct ? (
            <button
              className="session-continue"
              type="button"
              onClick={moveNext}
            >
              {state.session.questionIndex === 5
                ? "Finish activity"
                : "Next question"}
              <ArrowRightIcon />
            </button>
          ) : (
            <div className="session-controls">
              <button type="button" onClick={speakPrompt}>
                <ReplayIcon />
                Hear again
              </button>
              <button type="button" onClick={requestHelp} aria-label="Help me">
                <HelpIcon />
                Need a hint?
              </button>
            </div>
          )}
          {speechMessage ? (
            <span className="visually-hidden" role="status">
              {speechMessage}
            </span>
          ) : null}
        </div>
      </section>
    </main>
  );
}
