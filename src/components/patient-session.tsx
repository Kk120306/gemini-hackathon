"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { GroundingOverlay } from "@/components/grounding-overlay";
import {
  ArrowRightIcon,
  CheckIcon,
  HelpIcon,
  ReplayIcon,
  VolumeIcon,
} from "@/components/icons";
import { SpatialChoiceLayer } from "@/components/spatial-choice-layer";
import { cueIncludes } from "@/domain/cue-engine";
import { recallZoneLabel } from "@/domain/spatial-scene";

const recallZones = [
  "upper_left",
  "upper_center",
  "upper_right",
  "lower_left",
  "lower_center",
  "lower_right",
] as const;

export function PatientSession() {
  const router = useRouter();
  const { state, ready, startSession, answer, requestHelp, continueSession } =
    useAnchorState();
  const [speechMessage, setSpeechMessage] = useState<string | null>(null);
  const [recallReadyQuestionId, setRecallReadyQuestionId] = useState<
    string | null
  >(null);
  const [exploredObjectId, setExploredObjectId] = useState<string | null>(null);
  const question = state.lesson?.questions[state.session.questionIndex];
  const target = useMemo(
    () =>
      state.worldModel.objects.find(
        (object) => object.id === question?.targetObjectId,
      ),
    [question?.targetObjectId, state.worldModel.objects],
  );
  const reference = useMemo(
    () =>
      state.worldModel.objects.find(
        (object) => object.id === question?.referenceObjectId,
      ),
    [question?.referenceObjectId, state.worldModel.objects],
  );
  const selectableObjects = useMemo(
    () =>
      question?.selectableObjectIds.flatMap((objectId) => {
        const object = state.worldModel.objects.find(
          ({ id }) => id === objectId,
        );
        return object ? [object] : [];
      }) ?? [],
    [question?.selectableObjectIds, state.worldModel.objects],
  );
  const exploredObject = useMemo(
    () =>
      state.worldModel.objects.find(({ id }) => id === exploredObjectId) ??
      null,
    [exploredObjectId, state.worldModel.objects],
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

  if (!question || !state.lesson || !state.guide || !target) {
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
  const isRecall = activeQuestion.interactionMode === "recall_zone";
  const recallReady = recallReadyQuestionId === activeQuestion.id;
  const showVerbal = cueIncludes(state.session.cueLevel, "verbal");
  const showFocus = cueIncludes(state.session.cueLevel, "focus");
  const showSimplified = cueIncludes(state.session.cueLevel, "simplified");
  const showReveal = cueIncludes(state.session.cueLevel, "reveal");
  const correct = state.session.feedback === "correct";
  const recallRoomHidden = isRecall && recallReady && !correct && !showFocus;
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
  const cameraObject = exploredObject ?? (showFocus ? target : null);
  const cameraCenter = cameraObject
    ? {
        x: cameraObject.boundingBox.x + cameraObject.boundingBox.width / 2,
        y: cameraObject.boundingBox.y + cameraObject.boundingBox.height / 2,
      }
    : null;
  const displayPrompt = activeQuestion.prompt;

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
      ? `${displayPrompt} ${activeQuestion.verbalCue}`
      : displayPrompt;
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
          className={`session-scene${showFocus ? " session-scene--focused" : ""}${showSimplified ? " session-scene--simplified" : ""}${generatedSceneReady ? " session-scene--generated" : ""}${recallRoomHidden ? " session-scene--recall-hidden" : ""}`}
          data-cue-level={state.session.cueLevel}
          data-media-status={mediaJob?.status ?? "idle"}
          data-scene-source={generatedSceneReady ? "generated" : "verified"}
          data-interaction-mode={activeQuestion.interactionMode}
        >
          <div
            className="session-scene__world"
            data-camera-active={cameraCenter ? true : undefined}
            style={{
              transformOrigin: cameraCenter
                ? `${cameraCenter.x * 100}% ${cameraCenter.y * 100}%`
                : "50% 50%",
            }}
          >
            <Image
              className="session-scene__base"
              src={state.room.imageSrc}
              alt={`Approved ${state.room.name.toLowerCase()} view`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 68vw"
              unoptimized
            />
            {mediaJob?.outputSrc ? (
              <Image
                className="session-scene__generated"
                src={mediaJob.outputSrc}
                alt={`${generatedSceneLabel} of the approved ${state.room.name.toLowerCase()}`}
                fill
                sizes="(max-width: 900px) 100vw, 68vw"
                unoptimized
              />
            ) : null}
            {showFocus && !generatedSceneReady ? (
              <GroundingOverlay
                className="session-scene__focus"
                box={target.boundingBox}
                fit="contain"
                label={`Visual focus around ${target.name}`}
              />
            ) : null}
            {!isRecall || correct ? (
              <SpatialChoiceLayer
                objects={correct ? [target] : selectableObjects}
                {...(!correct && reference ? { reference } : {})}
                targetObjectId={target.id}
                cueLevel={state.session.cueLevel}
                correct={correct}
                disabled={correct}
                onSelect={(object) => answer(object.name)}
                onExplore={(object) => setExploredObjectId(object?.id ?? null)}
              />
            ) : null}
          </div>

          {isRecall && recallReady && !correct ? (
            <div
              className="recall-zone-layer"
              aria-label="Choose the remembered area of the room"
            >
              {recallZones.map((zone) => {
                const label = recallZoneLabel(zone);
                return (
                  <button
                    type="button"
                    key={zone}
                    className={
                      showReveal && label === activeQuestion.correctAnswer
                        ? "recall-zone-layer__revealed"
                        : undefined
                    }
                    aria-label={`Choose ${label.toLowerCase()} region of the room`}
                    onClick={(event) => {
                      event.currentTarget.blur();
                      answer(label);
                    }}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          ) : null}

          <span className="scene-label">
            {generatedSceneReady
              ? generatedSceneLabel
              : recallRoomHidden
                ? "Room hidden for recall"
                : showSimplified
                  ? "Verified simplified fallback"
                  : showFocus
                    ? "Verified target highlighted"
                    : isRecall
                      ? recallReady
                        ? "Six-region recall map"
                        : "Study object, surface, row, and column"
                      : "Touch a numbered object area"}
          </span>
          {mediaJob?.status === "pending" && !showSimplified ? (
            <span className="scene-media-status" role="status">
              Preparing next visual cue
            </span>
          ) : null}
        </div>

        <div
          className={`session-panel session-panel--dense${isRecall ? " session-panel--recall" : ""}`}
        >
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
              {activeQuestion.challengeTitle}
            </div>
            <h1 id="question-prompt">{displayPrompt}</h1>
            <p className="session-question__instruction">
              {activeQuestion.instruction}
            </p>
          </div>

          <section
            className="reasoning-path"
            aria-label="Three-part evidence path"
          >
            <span>Evidence path</span>
            <ol>
              {activeQuestion.evidenceClues.map((clue, index) => (
                <li key={`${activeQuestion.id}-${clue.kind}`}>
                  <i aria-hidden="true">{index + 1}</i>
                  <p>
                    <strong>{clue.label}</strong>
                    <small>{clue.detail}</small>
                  </p>
                </li>
              ))}
            </ol>
          </section>

          <div className="session-feedback" aria-live="polite">
            {correct ? (
              <p className="session-feedback--correct">
                <CheckIcon /> {activeQuestion.answerExplanation}
              </p>
            ) : showReveal ? (
              <p>
                The verified answer is <strong>{question.correctAnswer}</strong>
                . Choose the highlighted area when you are ready.
              </p>
            ) : showVerbal ? (
              <p>
                {question.encouragement} <strong>{question.verbalCue}</strong>
              </p>
            ) : isRecall && !recallReady ? (
              <p>
                Take your time. Hide the room when both row and column feel
                clear.
              </p>
            ) : (
              <p>
                {isRecall
                  ? "Choose one exact region using both row and column."
                  : "Use the full evidence path, then choose one numbered area."}
              </p>
            )}
          </div>

          {correct ? (
            <button
              key={`continue-${activeQuestion.id}`}
              className="session-continue"
              type="button"
              onClick={moveNext}
            >
              {state.session.questionIndex === 5
                ? "Finish activity"
                : "Next question"}
              <ArrowRightIcon />
            </button>
          ) : isRecall && !recallReady ? (
            <button
              key={`recall-ready-${activeQuestion.id}`}
              className="recall-ready-button"
              type="button"
              onClick={(event) => {
                event.currentTarget.blur();
                setRecallReadyQuestionId(activeQuestion.id);
              }}
            >
              I&apos;m ready. Hide the room.
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
