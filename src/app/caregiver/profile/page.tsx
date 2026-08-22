import { ProfileForm } from "@/components/profile-form";
import { StepHeading } from "@/components/step-heading";

export default function ProfilePage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 1 of 5"
        title="Who are we preparing this for?"
        description="Use only the name they prefer to hear. No diagnosis or health information is needed."
      />

      <ProfileForm />
    </main>
  );
}
