import Image from "next/image";
import Link from "next/link";

import {
  ArrowRightIcon,
  CareIcon,
  EyeIcon,
  ShieldIcon,
  SparkIcon,
} from "@/components/icons";
import { SiteHeader } from "@/components/site-header";

const proofSteps = [
  {
    number: "01",
    title: "Detect",
    text: "Gemini finds and boxes the real objects visible in one familiar room.",
  },
  {
    number: "02",
    title: "Verify",
    text: "A caregiver confirms every object, location, and family likeness.",
  },
  {
    number: "03",
    title: "Exercise",
    text: "Six grounded challenges practice attention, recall, and association.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="landing-page">
      <SiteHeader />

      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__copy">
          <p className="eyebrow">Room-grounded cognitive engagement</p>
          <h1 id="hero-title">
            Train attention.
            <span>Rehearse familiar spaces.</span>
          </h1>
          <p className="hero__lede">
            ANCHOR turns a real room photo into six detailed visual challenges
            for attention, spatial recall, recognition, and association. It is
            designed for older adults and people living with dementia, with
            every object verified by a caregiver first.
          </p>
          <div className="hero__actions">
            <Link className="primary-button" href="/caregiver">
              Prepare an activity
              <ArrowRightIcon />
            </Link>
            <Link className="secondary-button" href="/patient">
              <CareIcon />
              Enter patient view
            </Link>
          </div>
          <div className="hero__boundary">
            <ShieldIcon />
            <p>
              Cognitive engagement and familiarity support, not dementia
              prevention, diagnosis, treatment, or assessment.
            </p>
          </div>
        </div>

        <div className="hero-scene" aria-label="Verified room preview">
          <div className="hero-scene__image">
            <Image
              src="/fixtures/bedroom.svg"
              alt="Synthetic bedroom with a mug, glasses, and lamp"
              fill
              priority
              sizes="(max-width: 900px) 100vw, 48vw"
              unoptimized
            />
            <span className="hero-scene__focus" aria-hidden="true" />
            <div className="hero-scene__label">
              <EyeIcon />
              <span>
                Gemma observed
                <strong>Reading glasses on the bedside table</strong>
              </span>
            </div>
          </div>
          <div className="hero-scene__approval">
            <span className="approval-check" aria-hidden="true">
              ✓
            </span>
            <span>
              Caregiver approved
              <small>Ready to become a gentle cue</small>
            </span>
          </div>
          <div className="hero-scene__guide">
            <Image
              src="/fixtures/elena-guide.svg"
              alt="Lightly stylized AI-generated guide fixture"
              width={120}
              height={144}
              unoptimized
            />
            <span>
              Elena
              <small>AI-generated guide</small>
            </span>
          </div>
        </div>
      </section>

      <section className="proof-strip" aria-label="How grounding works">
        <div className="proof-strip__intro">
          <SparkIcon />
          <p>
            <strong>One visible proof chain</strong>
            from room image to patient cue
          </p>
        </div>
        {proofSteps.map((step) => (
          <article key={step.number}>
            <span>{step.number}</span>
            <div>
              <h2>{step.title}</h2>
              <p>{step.text}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
