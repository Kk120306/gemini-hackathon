"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
  UploadIcon,
} from "@/components/icons";

export function GuideReview() {
  const router = useRouter();
  const {
    state,
    saveTrustedPerson,
    uploadGuideReferences,
    generateGuide,
    rejectGuide,
    useNeutralGuide: selectNeutralGuide,
    approveGuide,
  } = useAnchorState();
  const [name, setName] = useState(state.trustedPerson.name);
  const [relationship, setRelationship] = useState(
    state.trustedPerson.relationship,
  );
  const [consent, setConsent] = useState(state.trustedPerson.likenessConsent);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState<"saving" | "generating" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setSelectedFiles(files);
    setMessage(
      files.length > 0
        ? `${files.length} reference photo${files.length === 1 ? "" : "s"} selected.`
        : null,
    );
  }

  async function saveDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy("saving");
    setMessage(null);
    try {
      let referenceImageSrcs = state.trustedPerson.referenceImageSrcs;
      if (selectedFiles.length > 0) {
        if (selectedFiles.length < 1 || selectedFiles.length > 3) {
          throw new Error("Choose one to three clear reference photos.");
        }
        referenceImageSrcs = await uploadGuideReferences(selectedFiles);
      }
      saveTrustedPerson({
        name,
        relationship,
        likenessConsent: consent,
        referenceImageSrcs,
      });
      setSelectedFiles([]);
      setMessage(
        consent
          ? "References and consent are saved. You can generate a guide candidate."
          : "Details are saved. Confirm likeness permission or use the neutral guide.",
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error
          ? caught.message
          : "The trusted-person details could not be saved.",
      );
    } finally {
      setBusy(null);
    }
  }

  async function createGuide() {
    setBusy("generating");
    setMessage(null);
    try {
      await generateGuide();
      setMessage(
        "The candidate passed the independent likeness check. Review it before approval.",
      );
    } catch (caught) {
      setMessage(
        caught instanceof Error ? caught.message : "Generation failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  function chooseNeutralGuide() {
    selectNeutralGuide();
    setMessage("Neutral guide selected. No family likeness will be shown.");
  }

  function rejectCandidate() {
    rejectGuide();
    setMessage(
      "Candidate rejected by the caregiver. It cannot enter patient mode.",
    );
  }

  function approve() {
    approveGuide();
    router.push("/caregiver/lesson");
  }

  const guideRejected = state.guide?.approval === "rejected";
  const guideValidated = Boolean(state.guide?.validation?.safeToDisplay);

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

            <div className="guide-reference-upload">
              <label htmlFor="guide-references">
                <UploadIcon />
                <span>
                  <strong>Choose one to three reference photos</strong>
                  One clear portrait works. Extra face angles improve
                  consistency.
                </span>
              </label>
              <input
                id="guide-references"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={chooseFiles}
              />
              <small>
                Photos are stored in private server paths and never committed to
                the repository.
              </small>
            </div>

            <div className="reference-images">
              {state.trustedPerson.referenceImageSrcs.map((source, index) => (
                <div className="image-frame" key={source}>
                  <Image
                    src={source}
                    alt={`Caregiver-approved reference ${index + 1} for ${name}`}
                    fill
                    sizes="180px"
                    unoptimized
                  />
                  <span>Reference {index + 1}</span>
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
                The guide stays labeled and never represents a live call.
              </span>
            </label>
            <div className="guide-actions">
              <button
                className="secondary-button"
                type="submit"
                disabled={busy !== null}
              >
                {busy === "saving" ? "Saving references..." : "Save details"}
              </button>
              <button
                className="quiet-button"
                type="button"
                onClick={chooseNeutralGuide}
                disabled={busy !== null}
              >
                Use neutral guide
              </button>
            </div>
            {message ? (
              <p
                className={`form-message${guideRejected ? " form-message--warning" : ""}`}
                role="status"
              >
                {message}
              </p>
            ) : null}
          </form>
        </section>

        <aside className="panel guide-candidate">
          {state.guide ? (
            <>
              <div
                className={`guide-candidate__portrait image-frame${guideRejected ? " guide-candidate__portrait--rejected" : ""}`}
              >
                <Image
                  src={state.guide.imageSrc}
                  alt={state.guide.label}
                  fill
                  sizes="(max-width: 840px) 100vw, 34vw"
                  loading="eager"
                  unoptimized
                />
                <span>{state.guide.label}</span>
                {guideRejected ? <strong>Rejected</strong> : null}
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
                {state.guide.presentation === "neutral" ? (
                  <span className="approved-line">
                    <ShieldIcon /> Neutral fallback ready
                  </span>
                ) : guideRejected ? (
                  <span className="rejected-line">Caregiver rejected</span>
                ) : guideValidated ? (
                  <span className="approved-line">
                    <CheckIcon /> Independent check passed
                  </span>
                ) : null}
                {state.guide.validation && !guideRejected ? (
                  <p className="guide-validation-reason">
                    {state.guide.validation.conciseReason}
                  </p>
                ) : null}
                {state.guide.presentation === "stylized_likeness" ? (
                  <div className="guide-candidate__actions">
                    <button
                      className="quiet-button"
                      type="button"
                      onClick={rejectCandidate}
                      disabled={busy !== null || guideRejected}
                    >
                      Reject candidate
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={createGuide}
                      disabled={
                        busy !== null || !state.trustedPerson.likenessConsent
                      }
                    >
                      {busy === "generating"
                        ? "Generating..."
                        : "Generate another"}
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <div className="guide-candidate__empty">
              <ShieldIcon />
              <h2>No guide generated yet</h2>
              <p>
                Save the references and consent, then generate a validated
                stylized candidate or use the neutral fallback.
              </p>
              <button
                className="primary-button"
                type="button"
                onClick={createGuide}
                disabled={busy !== null || !state.trustedPerson.likenessConsent}
              >
                {busy === "generating"
                  ? "Generating and checking..."
                  : "Generate guide candidate"}
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
          disabled={!state.guide || guideRejected}
        >
          Approve guide
          <ArrowRightIcon />
        </button>
      </div>
    </>
  );
}
