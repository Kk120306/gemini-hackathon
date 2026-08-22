"use client";

import { useLayoutEffect, useRef } from "react";

import type { CueLevel, WorldObject } from "@/domain/anchor";
import {
  expandProjectedBox,
  projectBoxIntoContain,
} from "@/domain/cover-geometry";
import { horizontalZoneFor } from "@/domain/spatial-scene";

type SpatialChoiceLayerProps = {
  objects: WorldObject[];
  reference?: WorldObject;
  targetObjectId: string;
  cueLevel: CueLevel;
  correct: boolean;
  disabled: boolean;
  onSelect(object: WorldObject): void;
  onExplore(object: WorldObject | null): void;
};

export function SpatialChoiceLayer({
  objects,
  reference,
  targetObjectId,
  cueLevel,
  correct,
  disabled,
  onSelect,
  onExplore,
}: SpatialChoiceLayerProps) {
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    const container = layer?.parentElement;
    const image = container?.querySelector<HTMLImageElement>(
      "img.session-scene__base",
    );
    if (!layer || !container || !image) {
      return;
    }
    const currentLayer = layer;
    const currentContainer = container;
    const currentImage = image;

    const boxes = new Map(
      [...objects, ...(reference ? [reference] : [])].map((object) => [
        object.id,
        object.boundingBox,
      ]),
    );

    function positionAnchors() {
      const containerSize = {
        width: currentContainer.clientWidth,
        height: currentContainer.clientHeight,
      };
      const imageSize = {
        width: currentImage.naturalWidth || 1200,
        height: currentImage.naturalHeight || 780,
      };
      for (const element of currentLayer.querySelectorAll<HTMLElement>(
        "[data-anchor-id]",
      )) {
        const objectId = element.dataset.anchorId;
        const box = objectId ? boxes.get(objectId) : undefined;
        if (!box) {
          continue;
        }
        const projected = expandProjectedBox(
          projectBoxIntoContain(box, containerSize, imageSize),
          containerSize,
        );
        element.style.left = `${projected.left}px`;
        element.style.top = `${projected.top}px`;
        element.style.width = `${projected.width}px`;
        element.style.height = `${projected.height}px`;
        element.style.visibility = "visible";
      }
    }

    positionAnchors();
    currentImage.addEventListener("load", positionAnchors);
    const observer = new ResizeObserver(positionAnchors);
    observer.observe(currentContainer);
    return () => {
      currentImage.removeEventListener("load", positionAnchors);
      observer.disconnect();
    };
  }, [objects, reference]);

  return (
    <div
      ref={layerRef}
      className="spatial-choice-layer"
      aria-label="Interactive room objects"
    >
      {reference ? (
        <span
          className="spatial-landmark"
          data-anchor-id={reference.id}
          role="img"
          aria-label={`${reference.name}, the landmark named in the question`}
          style={{ visibility: "hidden" }}
        >
          <span>Landmark</span>
        </span>
      ) : null}
      {objects.map((object, index) => {
        const isTarget = object.id === targetObjectId;
        return (
          <button
            type="button"
            key={object.id}
            className="spatial-hotspot"
            data-anchor-id={object.id}
            data-horizontal-zone={horizontalZoneFor(object.boundingBox)}
            data-target={isTarget || undefined}
            data-focused={
              isTarget && ["focus", "simplified", "reveal"].includes(cueLevel)
                ? true
                : undefined
            }
            data-correct={isTarget && correct ? true : undefined}
            data-revealed={isTarget && cueLevel === "reveal" ? true : undefined}
            aria-label={`Choose ${object.name} in the room`}
            disabled={disabled}
            onClick={(event) => {
              event.currentTarget.blur();
              onExplore(null);
              onSelect(object);
            }}
            onPointerEnter={() => onExplore(object)}
            onPointerLeave={() => onExplore(null)}
            onFocus={() => onExplore(object)}
            onBlur={() => onExplore(null)}
            style={{
              visibility: "hidden",
              zIndex: Math.round(
                100 -
                  object.boundingBox.width * object.boundingBox.height * 100,
              ),
            }}
          >
            <span className="spatial-hotspot__number" aria-hidden="true">
              {index + 1}
            </span>
            <span className="visually-hidden">{object.name}</span>
            {isTarget && (correct || cueLevel === "reveal") ? (
              <strong>{object.name}</strong>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
