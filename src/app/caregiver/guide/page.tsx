import { GuideReview } from "@/components/guide-review";
import { StepHeading } from "@/components/step-heading";

export default function GuidePage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 4 of 5"
        title="Approve a familiar guide."
        description="Confirm permission before creating a lightly stylized guide, or choose the neutral non-likeness fallback."
      />
      <GuideReview />
    </main>
  );
}
