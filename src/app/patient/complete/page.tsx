import Image from "next/image";
import Link from "next/link";

import { CareIcon, ReplayIcon } from "@/components/icons";
import { demoFixture } from "@/fixtures/demo";

export default function PatientCompletePage() {
  return (
    <main className="patient-complete">
      <div className="patient-complete__sun" aria-hidden="true" />
      <section>
        <div className="patient-complete__guide">
          <Image
            src={demoFixture.trustedPerson.guideImageSrc}
            alt="AI-generated guide fixture based on Elena"
            fill
            sizes="220px"
            unoptimized
          />
        </div>
        <span className="patient-complete__label">AI-generated guide</span>
        <CareIcon className="patient-complete__care" />
        <h1>Thank you for looking together.</h1>
        <p>
          You have reached the end of this activity. There is nothing else you
          need to do.
        </p>
        <div>
          <Link className="secondary-button" href="/patient">
            <ReplayIcon /> Try it again
          </Link>
          <Link className="primary-button" href="/">
            Finish
          </Link>
        </div>
      </section>
    </main>
  );
}
