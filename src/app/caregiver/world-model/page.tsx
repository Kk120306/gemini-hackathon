import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, CheckIcon, EyeIcon } from "@/components/icons";
import { StepHeading } from "@/components/step-heading";
import { demoFixture } from "@/fixtures/demo";

export default function WorldModelPage() {
  const evidence = demoFixture.groundingRecords[0];

  return (
    <main>
      <StepHeading
        eyebrow="Step 3 of 5"
        title="Verify what Gemma observed."
        description="These are proposals, not facts. Correct the name or location before approving the room model."
        aside={<span className="status-chip">3 proposals</span>}
      />

      <div className="verify-grid">
        <section className="panel object-list-card">
          <div className="panel__header">
            <h2>Visible objects</h2>
            <span className="muted-note">All 3 selected</span>
          </div>
          <div className="object-list">
            {demoFixture.objects.map((object, index) => (
              <article key={object.id} className="object-row">
                <span className="object-row__check">
                  <CheckIcon />
                </span>
                <span className="object-row__number">0{index + 1}</span>
                <div>
                  <strong>{object.name}</strong>
                  <span>{object.location}</span>
                </div>
                <button type="button">Edit</button>
              </article>
            ))}
          </div>
        </section>

        <aside className="panel evidence-card">
          <div className="evidence-card__image image-frame">
            <Image
              src={demoFixture.room.imageSrc}
              alt="Source image with reading glasses area identified"
              fill
              priority
              sizes="(max-width: 860px) 100vw, 40vw"
              unoptimized
            />
            <span className="evidence-card__focus" aria-hidden="true" />
          </div>
          <div className="evidence-card__body">
            <p className="eyebrow">
              <EyeIcon /> Grounding proof
            </p>
            <h2>{evidence?.caregiverValue}</h2>
            <dl>
              <div>
                <dt>Gemma observed</dt>
                <dd>{evidence?.modelObservation}</dd>
              </div>
              <div>
                <dt>Caregiver value</dt>
                <dd>{evidence?.caregiverValue}</dd>
              </div>
            </dl>
            <span className="approved-line">
              <CheckIcon /> Evidence approved
            </span>
          </div>
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/room">
          Back
        </Link>
        <Link className="primary-button" href="/caregiver/guide">
          Approve room model
          <ArrowRightIcon />
        </Link>
      </div>
    </main>
  );
}
