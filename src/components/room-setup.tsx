"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import {
  ArrowRightIcon,
  CheckIcon,
  ImageIcon,
  UploadIcon,
} from "@/components/icons";

const allowedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export function RoomSetup() {
  const router = useRouter();
  const { state, analyzeRoom } = useAnchorState();
  const [fileName, setFileName] = useState("bedroom-fixture.svg");
  const [error, setError] = useState<string | null>(null);

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Choose a JPG, PNG, WebP, or SVG image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);
    setError(null);
  }

  async function handleAnalyze() {
    setError(null);
    try {
      await analyzeRoom();
      router.push("/caregiver/world-model");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    }
  }

  const analyzing = state.room.uploadStatus === "analyzing";

  return (
    <>
      <div className="room-grid">
        <section className="panel room-preview-card">
          <div className="room-preview-card__image image-frame">
            <Image
              src={state.room.imageSrc}
              alt="Synthetic bedroom fixture"
              fill
              priority
              sizes="(max-width: 820px) 100vw, 58vw"
              unoptimized
            />
            <span className="fixture-ribbon">
              <CheckIcon /> Synthetic fixture
            </span>
          </div>
          <div className="room-preview-card__meta">
            <div>
              <strong>{fileName}</strong>
              <span>
                {state.room.uploadStatus === "analyzed"
                  ? "Three proposals ready"
                  : "Prepared image • No personal data"}
              </span>
            </div>
            <label className="quiet-button file-button" htmlFor="room-image">
              Replace image
            </label>
            <input
              className="visually-hidden"
              id="room-image"
              name="room-image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={handleFile}
            />
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
          {error ? (
            <p className="form-error" role="alert">
              {error}
            </p>
          ) : null}
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/profile">
          Back
        </Link>
        <button
          className="primary-button"
          type="button"
          onClick={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? "Finding visible objects…" : "Find visible objects"}
          <ArrowRightIcon />
        </button>
      </div>
    </>
  );
}
