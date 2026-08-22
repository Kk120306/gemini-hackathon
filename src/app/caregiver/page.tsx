import Image from "next/image";
import { CaregiverStartAction } from "@/components/caregiver-start-action";
import { CheckIcon, ShieldIcon, SparkIcon } from "@/components/icons";
import { StepHeading } from "@/components/step-heading";

const checklist = [
  "One real familiar-room image",
  "Gemini-detected visible objects",
  "A consented family portrait",
  "Six grounded cognitive challenges",
] as const;

export default function CaregiverStartPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Prepared demonstration"
        title="Turn a real room into cognitive practice."
        description="Gemini detects what is truly visible, then ANCHOR builds detailed attention, spatial recall, recognition, and association challenges. Nothing reaches the patient until you review it."
      />

      <div className="start-grid">
        <section className="panel start-card">
          <div className="start-card__visual">
            <Image
              src="/fixtures/bedroom.svg"
              alt="Synthetic bedroom prepared for the demonstration"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 52vw"
              unoptimized
            />
            <span>
              <SparkIcon /> Prepared fixture
            </span>
          </div>
          <div className="start-card__copy">
            <p className="eyebrow">About 90 seconds</p>
            <h2>Review the prepared path</h2>
            <p>
              Move through profile, room evidence, family guide, and lesson
              approval before opening patient mode.
            </p>
            <CaregiverStartAction />
          </div>
        </section>

        <aside className="start-aside">
          <section className="panel readiness-card">
            <div className="panel__header">
              <h2>Ready for review</h2>
              <span className="status-chip">Offline</span>
            </div>
            <div className="panel__body">
              <ul className="check-list">
                {checklist.map((item) => (
                  <li key={item}>
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="safety-note">
            <ShieldIcon />
            <div>
              <strong>Caregiver approval is the boundary.</strong>
              <p>
                ANCHOR uses only visually observed or caregiver-confirmed
                information.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
