import Image from "next/image";
import Link from "next/link";

import { PlayIcon, ShieldIcon, VolumeIcon } from "@/components/icons";
import { demoFixture } from "@/fixtures/demo";

export default function PatientStartPage() {
  return (
    <main className="patient-start">
      <section className="patient-start__card">
        <div className="patient-start__guide">
          <Image
            src={demoFixture.trustedPerson.guideImageSrc}
            alt="AI-generated guide fixture based on Elena"
            fill
            sizes="260px"
            unoptimized
          />
          <span>AI-generated guide based on Elena</span>
        </div>
        <div className="patient-start__copy">
          <p className="eyebrow">A familiar-room activity</p>
          <h1>Hello, {demoFixture.patient.firstName}.</h1>
          <p>
            We will look around a familiar bedroom together. Take your time. You
            can ask for help whenever you like.
          </p>
          <Link className="patient-start-button" href="/patient/session">
            <PlayIcon />
            Start activity
          </Link>
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
    </main>
  );
}
