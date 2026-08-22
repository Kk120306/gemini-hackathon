import { RoomSetup } from "@/components/room-setup";
import { StepHeading } from "@/components/step-heading";

export default function RoomPage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 2 of 5"
        title="Add one familiar room."
        description="Choose a clear room photo. Gemini will propose six to ten distinct visible objects when the image supports them, while the prepared fixture keeps the offline flow available."
        aside={<span className="status-chip">1 image ready</span>}
      />

      <RoomSetup />
    </main>
  );
}
