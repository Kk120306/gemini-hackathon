"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAnchorState } from "@/components/anchor-state-provider";
import { GroundingOverlay } from "@/components/grounding-overlay";
import { ArrowRightIcon, CheckIcon, EyeIcon } from "@/components/icons";
import { chooseHorizontalObjectPosition } from "@/domain/cover-geometry";

export function WorldModelReview() {
  const router = useRouter();
  const { state, updateObject, approveWorldModel } = useAnchorState();
  const [selectedId, setSelectedId] = useState(
    state.worldModel.objects[0]?.id ?? "",
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const selectedObject =
    state.worldModel.objects.find(({ id }) => id === selectedId) ??
    state.worldModel.objects[0];
  const evidence = state.groundingRecords.find(
    ({ id }) => id === selectedObject?.groundingRecordId,
  );
  const objectPositionX = selectedObject
    ? chooseHorizontalObjectPosition(selectedObject.boundingBox)
    : 0.5;

  function approve() {
    approveWorldModel();
    router.push("/caregiver/guide");
  }

  return (
    <>
      <div className="verify-grid">
        <section className="panel object-list-card">
          <div className="panel__header">
            <h2>Visible objects</h2>
            <span className="muted-note">
              {state.worldModel.objects.length}{" "}
              {state.room.analysisSource === "fixture"
                ? "fixture"
                : `by ${state.room.analysisSource === "gemini" ? "Gemini" : "Gemma"}`}
            </span>
          </div>
          <div className="object-list">
            {state.worldModel.objects.map((object, index) => {
              const editing = editingId === object.id;
              return (
                <article
                  key={object.id}
                  className={`object-row${selectedId === object.id ? " object-row--selected" : ""}`}
                >
                  <button
                    className="object-row__select"
                    type="button"
                    onClick={() => setSelectedId(object.id)}
                    aria-label={`Inspect evidence for ${object.name}`}
                  >
                    <EyeIcon />
                  </button>
                  <span className="object-row__number">0{index + 1}</span>
                  {editing ? (
                    <form
                      className="object-row__edit"
                      onSubmit={(event) => {
                        event.preventDefault();
                        const form = new FormData(event.currentTarget);
                        updateObject(
                          object.id,
                          String(form.get("name")),
                          String(form.get("location")),
                        );
                        setEditingId(null);
                      }}
                    >
                      <label>
                        Object name
                        <input
                          name="name"
                          defaultValue={object.name}
                          required
                        />
                      </label>
                      <label>
                        Location
                        <input
                          name="location"
                          defaultValue={object.location}
                          required
                        />
                      </label>
                      <button type="submit">Save</button>
                    </form>
                  ) : (
                    <div>
                      <strong>{object.name}</strong>
                      <span>{object.location}</span>
                      <small>
                        {object.detectionConfidence} visual confidence
                      </small>
                    </div>
                  )}
                  {!editing ? (
                    <button
                      type="button"
                      onClick={() => setEditingId(object.id)}
                    >
                      Edit
                    </button>
                  ) : null}
                </article>
              );
            })}
          </div>
        </section>

        <aside className="panel evidence-card">
          <div className="evidence-card__image image-frame">
            <Image
              src={state.room.imageSrc}
              alt={`Source image with ${selectedObject?.name ?? "object"} area identified`}
              fill
              priority
              sizes="(max-width: 860px) 100vw, 40vw"
              unoptimized
              style={{ objectPosition: `${objectPositionX * 100}% 50%` }}
            />
            {selectedObject ? (
              <GroundingOverlay
                className="evidence-card__focus evidence-card__focus--dynamic"
                box={selectedObject.boundingBox}
                positionX={objectPositionX}
              />
            ) : null}
          </div>
          <div className="evidence-card__body">
            <p className="eyebrow">
              <EyeIcon /> Grounding proof
            </p>
            <h2>{evidence?.caregiverValue}</h2>
            <dl>
              <div>
                <dt>
                  {state.room.analysisSource === "fixture"
                    ? "Fixture proposed"
                    : `${state.room.analysisSource === "gemini" ? "Gemini" : "Gemma"} detected`}
                </dt>
                <dd>{evidence?.modelObservation}</dd>
              </div>
              <div>
                <dt>Caregiver value</dt>
                <dd>{evidence?.caregiverValue}</dd>
              </div>
            </dl>
            <span className="approval-pending-line">
              <EyeIcon /> Waiting for caregiver approval
            </span>
          </div>
        </aside>
      </div>

      <div className="form-actions">
        <Link className="quiet-button" href="/caregiver/room">
          Back
        </Link>
        <button className="primary-button" type="button" onClick={approve}>
          <CheckIcon /> Approve room model
          <ArrowRightIcon />
        </button>
      </div>
    </>
  );
}
