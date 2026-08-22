import { LessonReview } from "@/components/lesson-review";
import { StepHeading } from "@/components/step-heading";

export default function LessonPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 5 of 5"
        title="Review six grounded cognitive challenges."
        description="Each challenge uses the approved room pixels to exercise attention, spatial orientation, recognition, recall, or association. There is no score, prevention claim, or clinical interpretation."
        aside={<span className="status-chip">Runtime validated</span>}
      />
      <LessonReview />
    </main>
  );
}
