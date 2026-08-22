import { LessonReview } from "@/components/lesson-review";
import { StepHeading } from "@/components/step-heading";

export default function LessonPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 5 of 5"
        title="Review six familiar-room memory questions."
        description="Each question uses approved room pixels to rehearse what is visible, where it sits, and which landmarks are nearby. There is no score, prevention claim, or clinical interpretation."
        aside={<span className="status-chip">Runtime validated</span>}
      />
      <LessonReview />
    </main>
  );
}
