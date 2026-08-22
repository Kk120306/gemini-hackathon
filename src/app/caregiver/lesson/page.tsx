import Link from "next/link";

import { ArrowRightIcon, CheckIcon, EyeIcon } from "@/components/icons";
import { StepHeading } from "@/components/step-heading";
import { demoFixture } from "@/fixtures/demo";

const typeLabels: Record<
  (typeof demoFixture.questions)[number]["type"],
  string
> = {
  object_recognition: "Recognition",
  location_matching: "Location",
  visual_search: "Visual search",
  visual_recall: "Visual recall",
  sequencing: "Sequence",
  association: "Association",
};

export default function LessonPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 5 of 5"
        title="Review the six-question activity."
        description="Four familiar-room questions and exactly two gentle cognitive activities. There is no score or clinical interpretation."
        aside={<span className="status-chip">6 questions grounded</span>}
      />

      <section className="panel lesson-panel">
        <div className="panel__header">
          <h2>Maya&apos;s bedroom activity</h2>
          <span className="muted-note">About 4 minutes</span>
        </div>
        <ol className="lesson-list">
          {demoFixture.questions.map((question, index) => (
            <li key={question.id}>
              <span className="lesson-list__number">{index + 1}</span>
              <div className="lesson-list__question">
                <span>{typeLabels[question.type]}</span>
                <strong>{question.prompt}</strong>
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
      </section>

      <div className="lesson-summary">
        <div>
          <CheckIcon />
          <span>
            <strong>Composition verified</strong>4 familiar-room questions + 2
            cognitive activities
          </span>
        </div>
        <div className="form-actions">
          <Link className="quiet-button" href="/caregiver/guide">
            Back
          </Link>
          <Link className="primary-button" href="/patient">
            Approve and open patient mode
            <ArrowRightIcon />
          </Link>
        </div>
      </div>
    </main>
  );
}
