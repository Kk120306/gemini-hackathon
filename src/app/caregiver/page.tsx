import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { StepHeading } from "@/components/step-heading";

const checklist = [
  "One synthetic bedroom image",
  "Three visible room objects",
  "Two synthetic guide references",
  "Six grounded activity questions",
] as const;

export default function CaregiverStartPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Prepared demonstration"
        title="Create one calm, familiar activity."
        description="You stay in control. ANCHOR will propose visible details, and nothing reaches the patient until you review and approve it."
      />

      <div className="start-grid">
        <section className="panel start-card">
          <div className="start-card__visual">
            <Image
              src="/fixtures/bedroom.svg"
              alt="Synthetic bedroom prepared for the demonstration"
              fill
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
            <Link className="primary-button" href="/caregiver/profile">
              Begin caregiver setup
              <ArrowRightIcon />
            </Link>
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
