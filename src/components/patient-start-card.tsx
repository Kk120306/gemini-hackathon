"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAnchorState } from "@/components/anchor-state-provider";
import { PlayIcon, ShieldIcon, VolumeIcon } from "@/components/icons";

export function PatientStartCard() {
  const router = useRouter();
  const { state, ready, startSession } = useAnchorState();
  const activityReady =
    state.worldModel.approval === "approved" &&
    state.guide?.approval === "approved" &&
    state.lesson?.approval === "approved";

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
      <div className="patient-start__guide">
        <Image
          src={state.guide.imageSrc}
          alt={state.guide.label}
          fill
          sizes="260px"
          unoptimized
        />
        <span>{state.guide.label}</span>
      </div>
      <div className="patient-start__copy">
        <p className="eyebrow">A familiar-room activity</p>
        <h1>Hello, {state.patient.firstName}.</h1>
        <p>
          We will look around a familiar bedroom together. Take your time. You
          can ask for help whenever you like.
        </p>
        <button className="patient-start-button" type="button" onClick={begin}>
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
    </section>
  );
}
