"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { ArrowRightIcon, CheckIcon, ShieldIcon } from "@/components/icons";

export function GuideReview() {
  const router = useRouter();
  const {
    state,
    saveTrustedPerson,
    generateGuide,
    useNeutralGuide,
    approveGuide,
  } = useAnchorState();
  const [name, setName] = useState(state.trustedPerson.name);
  const [relationship, setRelationship] = useState(
    state.trustedPerson.relationship,
  );
  const [consent, setConsent] = useState(state.trustedPerson.likenessConsent);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    saveTrustedPerson({ name, relationship, likenessConsent: consent });
    setMessage(
      consent
        ? "Consent details saved. You can generate the fixture guide."
        : "Details saved. Choose the neutral guide or confirm likeness permission.",
    );
  }

  async function createGuide() {
    setBusy(true);
    setMessage(null);
    try {
      await generateGuide();
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : "Generation failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  function approve() {
    approveGuide();
    router.push("/caregiver/lesson");
  }

  return (
    <>
      <div className="guide-grid">
        <section className="panel reference-card">
          <div className="panel__header">
            <h2>Trusted person</h2>
            <span className="status-chip">
              {state.trustedPerson.likenessConsent
                ? "Consent recorded"
                : "Consent required"}
            </span>
          </div>
          <form className="panel__body" onSubmit={saveDetails}>
            <div className="field-grid">
              <div className="field">
                <label htmlFor="trusted-name">Name</label>
                <input
                  id="trusted-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="trusted-relationship">Relationship</label>
                <input
                  id="trusted-relationship"
                  value={relationship}
                  onChange={(event) => setRelationship(event.target.value)}
                  required
                />
              </div>
            </div>
            <div className="reference-images">
              {state.trustedPerson.referenceImageSrcs.map((source, index) => (
                <div className="image-frame" key={source}>
                  <Image
                    src={source}
                    alt={`Synthetic reference ${index + 1} for ${name}`}
                    fill
                    sizes="180px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
            <label className="consent-line consent-line--control">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => setConsent(event.target.checked)}
              />
              <ShieldIcon />
              <span>
                <strong>I confirm permission to generate this likeness.</strong>
                The guide remains labeled and never represents a live call.
              </span>
            </label>
            <div className="guide-actions">
              <button className="secondary-button" type="submit">
                Save details
              </button>
              <button
                className="quiet-button"
                type="button"
                onClick={useNeutralGuide}
              >
                Use neutral guide
              </button>
            </div>
            {message ? (
              <p className="form-message" role="status">
                {message}
              </p>
            ) : null}
          </form>
        </section>

        <aside className="panel guide-candidate">
          {state.guide ? (
            <>
              <div className="guide-candidate__portrait image-frame">
                <Image
                  src={state.guide.imageSrc}
                  alt={state.guide.label}
                  fill
                  sizes="(max-width: 840px) 100vw, 34vw"
                  unoptimized
                />
                <span>{state.guide.label}</span>
              </div>
              <div className="guide-candidate__copy">
                <div>
                  <p className="eyebrow">Guide candidate</p>
                  <h2>
                    {state.guide.presentation === "neutral" ? "ANCHOR" : name}
                  </h2>
                  <p>
                    {state.guide.presentation === "neutral"
                      ? "No family likeness is shown."
                      : `Based on the caregiver-approved ${relationship}.`}
                  </p>
                </div>
                <span className="approved-line">
                  <CheckIcon /> Ready to approve
                </span>
              </div>
            </>
          ) : (
            <div className="guide-candidate__empty">
              <ShieldIcon />
              <h2>No guide generated yet</h2>
              <p>
                Save the consent details, then generate the stylized fixture or
                use the neutral fallback.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={createGuide}
                disabled={busy || !state.trustedPerson.likenessConsent}
              >
                {busy ? "Generating guide…" : "Generate fixture guide"}
              </button>
            </div>
          )}
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/world-model">
          Back
        </Link>
        <button
          className="primary-button"
          type="button"
          onClick={approve}
          disabled={!state.guide}
        >
          Approve guide
          <ArrowRightIcon />
        </button>
      </div>
    </>
  );
}
