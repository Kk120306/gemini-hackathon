"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAnchorState } from "@/components/anchor-state-provider";
import { CareIcon, ReplayIcon } from "@/components/icons";

export function PatientCompletion() {
  const router = useRouter();
  const { state, ready, resetSession } = useAnchorState();
  const guide = state.guide;

  function replay() {
    resetSession();
    router.push("/patient");
  }

  if (!ready) {
    return (
      <main className="patient-complete" aria-busy>
        <section>
          <p>Loading the approved activity.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="patient-complete">
      <div className="patient-complete__sun" aria-hidden="true" />
      <section>
        {guide ? (
          <div className="patient-complete__guide">
            <Image
              src={guide.imageSrc}
              alt={guide.label}
              fill
              sizes="220px"
              unoptimized
            />
          </div>
        ) : null}
        <span className="patient-complete__label">
          {guide?.label ?? "AI-generated neutral guide"}
        </span>
        <CareIcon className="patient-complete__care" />
        <h1>Thank you for looking together.</h1>
        <p>
          You have reached the end of this activity. There is nothing else you
          need to do.
        </p>
        <div>
          <button className="secondary-button" type="button" onClick={replay}>
            <ReplayIcon /> Try it again
          </button>
          <Link className="primary-button" href="/">
            Finish
          </Link>
        </div>
      </section>
    </main>
  );
}
