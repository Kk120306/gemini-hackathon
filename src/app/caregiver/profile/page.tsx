import Link from "next/link";

import { ArrowRightIcon, ShieldIcon } from "@/components/icons";
import { StepHeading } from "@/components/step-heading";
import { demoFixture } from "@/fixtures/demo";

export default function ProfilePage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 1 of 5"
        title="Who are we preparing this for?"
        description="Use only the name they prefer to hear. No diagnosis or health information is needed."
      />

      <section className="panel form-panel">
        <div className="panel__header">
          <h2>Patient and room</h2>
          <span className="status-chip">Fixture filled</span>
        </div>
        <div className="panel__body">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="patient-name">Preferred first name</label>
              <input
                id="patient-name"
                name="patient-name"
                defaultValue={demoFixture.patient.firstName}
                autoComplete="off"
              />
            </div>
            <div className="field">
              <label htmlFor="room-name">Room name</label>
              <input
                id="room-name"
                name="room-name"
                defaultValue={demoFixture.room.name}
                autoComplete="off"
              />
            </div>
          </div>

          <div className="privacy-callout">
            <ShieldIcon />
            <p>
              ANCHOR stores fixture data locally and does not need an address,
              diagnosis, medication list, or health record.
            </p>
          </div>

          <div className="form-actions">
            <Link className="quiet-button" href="/caregiver">
              Back
            </Link>
            <Link className="primary-button" href="/caregiver/room">
              Continue to room
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
