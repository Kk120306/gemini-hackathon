import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  CheckIcon,
  ImageIcon,
  UploadIcon,
} from "@/components/icons";
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

      <div className="room-grid">
        <section className="panel room-preview-card">
          <div className="room-preview-card__image image-frame">
            <Image
              src="/fixtures/bedroom.svg"
              alt="Synthetic bedroom fixture"
              fill
              sizes="(max-width: 820px) 100vw, 58vw"
              unoptimized
            />
            <span className="fixture-ribbon">
              <CheckIcon /> Synthetic fixture
            </span>
          </div>
          <div className="room-preview-card__meta">
            <div>
              <strong>bedroom-fixture.svg</strong>
              <span>Prepared image • No personal data</span>
            </div>
            <button className="quiet-button" type="button">
              Replace image
            </button>
          </div>
        </section>

        <aside className="panel upload-card">
          <div className="upload-card__icon">
            <UploadIcon />
          </div>
          <h2>Clear and well lit works best</h2>
          <p>
            Include the floor or furniture around each object so its location
            can be verified.
          </p>
          <ul>
            <li>
              <ImageIcon /> JPG, PNG, WebP, or fixture SVG
            </li>
            <li>
              <CheckIcon /> Up to 10 MB per image
            </li>
          </ul>
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/profile">
          Back
        </Link>
        <Link className="primary-button" href="/caregiver/world-model">
          Find visible objects
          <ArrowRightIcon />
        </Link>
      </div>
    </main>
  );
}
