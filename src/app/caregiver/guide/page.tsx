import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/icons";
import { StepHeading } from "@/components/step-heading";
import { demoFixture } from "@/fixtures/demo";

export default function GuidePage() {
  return (
    <main>
      <StepHeading
        eyebrow="Step 4 of 5"
        title="Approve a familiar guide."
        description="This lightly stylized fixture is based on synthetic references. It stays clearly labeled and never speaks as the real person."
      />

      <div className="guide-grid">
        <section className="panel reference-card">
          <div className="panel__header">
            <h2>Trusted person</h2>
            <span className="status-chip">Consent recorded</span>
          </div>
          <div className="panel__body">
            <div className="field-grid">
              <div className="field">
                <label>Name</label>
                <div className="field-display">
                  {demoFixture.trustedPerson.name}
                </div>
              </div>
              <div className="field">
                <label>Relationship</label>
                <div className="field-display">
                  {demoFixture.trustedPerson.relationship}
                </div>
              </div>
            </div>
            <div className="reference-images">
              {demoFixture.trustedPerson.referenceImageSrcs.map(
                (source, index) => (
                  <div className="image-frame" key={source}>
                    <Image
                      src={source}
                      alt={`Synthetic reference ${index + 1} for Elena`}
                      fill
                      sizes="180px"
                      unoptimized
                    />
                  </div>
                ),
              )}
            </div>
            <div className="consent-line">
              <ShieldIcon />
              <span>
                <strong>Likeness permission confirmed</strong>
                Synthetic assets are used in fixture mode.
              </span>
            </div>
          </div>
        </section>

        <aside className="panel guide-candidate">
          <div className="guide-candidate__portrait image-frame">
            <Image
              src={demoFixture.trustedPerson.guideImageSrc}
              alt="Lightly stylized AI-generated guide fixture of Elena"
              fill
              sizes="(max-width: 840px) 100vw, 34vw"
              unoptimized
            />
            <span>AI-generated guide</span>
          </div>
          <div className="guide-candidate__copy">
            <div>
              <p className="eyebrow">Guide candidate</p>
              <h2>{demoFixture.trustedPerson.name}</h2>
              <p>
                Based on the caregiver-approved{" "}
                {demoFixture.trustedPerson.relationship}.
              </p>
            </div>
            <span className="approved-line">
              <CheckIcon /> Ready to approve
            </span>
          </div>
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/world-model">
          Back
        </Link>
        <Link className="primary-button" href="/caregiver/lesson">
          Approve guide
          <ArrowRightIcon />
        </Link>
      </div>
    </main>
  );
}
