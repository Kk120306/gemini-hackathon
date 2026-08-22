"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

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
  const [file, setFile] = useState<File>();
  const [previewSrc, setPreviewSrc] = useState(state.room.imageSrc);
  const [error, setError] = useState<string | null>(null);
  const previewObjectUrl = useRef<string | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) {
        URL.revokeObjectURL(previewObjectUrl.current);
      }
    };
  }, []);

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

    if (previewObjectUrl.current) {
      URL.revokeObjectURL(previewObjectUrl.current);
    }
    previewObjectUrl.current = URL.createObjectURL(file);
    setPreviewSrc(previewObjectUrl.current);
    setFile(file);
    setError(null);
  }

  async function handleAnalyze() {
    setError(null);
    try {
      await analyzeRoom(file);
      router.push("/caregiver/world-model");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis failed.");
    }
  }

  const analyzing = state.room.uploadStatus === "analyzing";
  const preparedFixture = !file && state.room.imageSrc.startsWith("/fixtures/");

  return (
    <>
      <div className="room-grid">
        <section className="panel room-preview-card">
          <div className="room-preview-card__image image-frame">
            <Image
              src={previewSrc}
              alt={
                preparedFixture ? "Synthetic bedroom fixture" : "Selected room"
              }
              fill
              priority
              sizes="(max-width: 820px) 100vw, 58vw"
              unoptimized
            />
            {preparedFixture ? (
              <span className="fixture-ribbon">
                <CheckIcon /> Synthetic fixture
              </span>
            ) : null}
          </div>
          <div className="room-preview-card__meta">
            <div>
              <strong>{file?.name ?? "bedroom-fixture.png"}</strong>
              <span>
                {state.room.uploadStatus === "analyzed"
                  ? `${state.worldModel.objects.length} ${state.room.analysisSource === "gemma" ? "live Gemma" : "fixture"} proposals ready`
                  : preparedFixture
                    ? "Prepared image • No personal data"
                    : "Caregiver-selected image • Stored privately"}
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
