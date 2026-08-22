"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { PlayIcon, ShieldIcon, VolumeIcon } from "@/components/icons";

export function PatientStartCard() {
  const router = useRouter();
  const { state, ready, prepareSpatialScene, startSession } = useAnchorState();
  const activityReady =
    state.worldModel.approval === "approved" &&
    state.guide?.approval === "approved" &&
    state.lesson?.approval === "approved";
  const spatialSceneJob = state.mediaJobs.find(
    (job) =>
      job.kind === "simplified_room" &&
      job.lessonId === state.lesson?.id &&
      job.status === "completed" &&
      job.validationPassed &&
      job.validation?.safeToDisplay &&
      job.outputSrc,
  );
  const spatialScenePending = state.mediaJobs.some(
    (job) =>
      job.kind === "simplified_room" &&
      job.lessonId === state.lesson?.id &&
      job.status === "pending",
  );
  const spatialSceneLabel =
    spatialSceneJob?.generationModel === "fixture-simplifier-v1"
      ? "Prepared 2.5D spatial interpretation"
      : "Gemini 2.5D spatial interpretation";

  useEffect(() => {
    if (ready && activityReady) {
      prepareSpatialScene();
    }
  }, [activityReady, prepareSpatialScene, ready]);

  if (!ready) {
    return (
      <section className="patient-start__blocked panel" aria-busy="true">
        <p className="eyebrow">Loading approved activity</p>
        <h1>Please wait a moment.</h1>
        <p>Checking the caregiver-approved room, guide, and questions.</p>
      </section>
    );
  }

  if (!activityReady || !state.guide) {
    return (
      <section className="patient-start__blocked panel">
        <ShieldIcon />
        <p className="eyebrow">Caregiver approval required</p>
        <h1>This activity is not ready yet.</h1>
        <p>
          The room evidence, guide, and all six questions must be approved
          before patient mode can begin.
        </p>
        <Link className="primary-button" href="/caregiver">
          Return to caregiver setup
        </Link>
      </section>
    );
  }

  function begin() {
    startSession();
    router.push("/patient/session");
  }

  return (
    <section className="patient-start__card">
      <div className="patient-start__room">
        <Image
          src={spatialSceneJob?.outputSrc ?? state.room.imageSrc}
          alt={
            spatialSceneJob
              ? "AI-generated spatial interpretation of the caregiver-approved bedroom"
              : "Caregiver-approved familiar bedroom"
          }
          fill
          priority
          sizes="(max-width: 760px) 100vw, 760px"
          unoptimized
        />
        <span role="status">
          {spatialSceneJob
            ? spatialSceneLabel
            : spatialScenePending
              ? "Gemini is composing the spatial room"
              : "Caregiver-approved room"}
        </span>
      </div>
      <div className="patient-start__copy">
        <div>
          <p className="eyebrow">Your activity is ready</p>
          <h1>Hello, {state.patient.firstName}.</h1>
          <p>
            Six gentle questions about this familiar room. Take your time and
            ask for help whenever you like.
          </p>
          <div className="patient-start__guide-label">
            <Image
              src={state.guide.imageSrc}
              alt=""
              width={52}
              height={58}
              unoptimized
            />
            <span>
              ANCHOR will guide the activity
              <small>{state.guide.label}</small>
            </span>
          </div>
        </div>
        <div className="patient-start__actions">
          <button
            className="patient-start-button"
            type="button"
            onClick={begin}
          >
            <PlayIcon />
            Start activity
          </button>
          <div className="patient-start__support">
            <span>
              <VolumeIcon /> Prompts can be read aloud
            </span>
            <span>
              <ShieldIcon /> No score or timer
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
