import { RoomSetup } from "@/components/room-setup";
import { StepHeading } from "@/components/step-heading";

export default function RoomPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 2 of 5"
        title="Add one familiar room."
        description="Choose a clear photo with three to five useful objects. The synthetic fixture is already prepared for this offline flow."
        aside={<span className="status-chip">1 image ready</span>}
      />

      <RoomSetup />
    </main>
  );
}
