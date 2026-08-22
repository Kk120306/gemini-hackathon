import Image from "next/image";
import Link from "next/link";

import { HelpIcon, ReplayIcon, VolumeIcon } from "@/components/icons";
import { demoFixture } from "@/fixtures/demo";

export default function PatientSessionPage() {
  const question = demoFixture.questions[0];

  return (
    <main className="patient-session">
      <div className="session-progress" aria-label="Question 1 of 6">
        <span>Question 1 of 6</span>
        <div aria-hidden="true">
          <i />
        </div>
        <Link href="/">Leave activity</Link>
      </div>

      <section className="session-stage" aria-labelledby="question-prompt">
        <div className="session-scene">
          <Image
            src={demoFixture.room.imageSrc}
            alt="Synthetic bedroom with reading glasses, a blue mug, and a lamp"
            fill
            priority
            sizes="(max-width: 900px) 100vw, 62vw"
            unoptimized
          />
          <span className="scene-label">Familiar bedroom</span>
        </div>

        <div className="session-panel">
          <div className="session-guide">
            <Image
              src={demoFixture.trustedPerson.guideImageSrc}
              alt="AI-generated guide fixture based on Elena"
              width={76}
              height={90}
              unoptimized
            />
            <span>
              Elena
              <small>AI-generated guide</small>
            </span>
          </div>

          <div className="session-question">
            <div className="session-question__label">
              <VolumeIcon />
              Look at the room
            </div>
            <h1 id="question-prompt">{question?.prompt}</h1>
          </div>

          <div className="answer-grid" aria-label="Answer choices">
            {question?.choices.map((choice, index) => (
              <button type="button" key={choice}>
                <span>{String.fromCharCode(65 + index)}</span>
                {choice}
              </button>
            ))}
          </div>

          <div className="session-controls">
            <button type="button">
              <ReplayIcon />
              Hear again
            </button>
            <button type="button">
              <HelpIcon />
              Help me
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
