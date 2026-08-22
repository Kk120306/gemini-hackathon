import { LessonReview } from "@/components/lesson-review";
import { StepHeading } from "@/components/step-heading";

export default function LessonPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 5 of 5"
        title="Review the six-question activity."
        description="Four familiar-room questions and exactly two gentle cognitive activities. There is no score or clinical interpretation."
        aside={<span className="status-chip">Runtime validated</span>}
      />
      <LessonReview />
    </main>
  );
}
