import { StepHeading } from "@/components/step-heading";
import { WorldModelReview } from "@/components/world-model-review";

export default function WorldModelPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 3 of 5"
        title="Verify what Gemma observed."
        description="These are proposals, not facts. Correct the name or location before approving the room model."
        aside={<span className="status-chip">3 proposals</span>}
      />

      <WorldModelReview />
    </main>
  );
}
