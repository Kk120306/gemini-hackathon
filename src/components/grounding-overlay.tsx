"use client";

import { useLayoutEffect, useRef } from "react";

import type { BoundingBox } from "@/domain/anchor";
import {
  projectBoxIntoContain,
  projectBoxIntoCover,
} from "@/domain/cover-geometry";

type GroundingOverlayProps = {
  box: BoundingBox;
  className: string;
  label?: string;
  imageWidth?: number;
  imageHeight?: number;
  positionX?: number;
  positionY?: number;
  fit?: "cover" | "contain";
};

export function GroundingOverlay({
  box,
  className,
  label,
  imageWidth = 1200,
  imageHeight = 780,
  positionX = 0.5,
  positionY = 0.5,
  fit = "cover",
}: GroundingOverlayProps) {
  const overlayRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const overlay = overlayRef.current;
    const container = overlay?.parentElement;
    if (!overlay || !container) {
      return;
    }
    const currentOverlay = overlay;
    const currentContainer = container;
    const image = currentContainer.querySelector<HTMLImageElement>(
      "img.session-scene__base, img.evidence-card__base",
    );

    function positionOverlay() {
      const containerSize = {
        width: currentContainer.clientWidth,
        height: currentContainer.clientHeight,
      };
      const imageSize = {
        width: image?.naturalWidth || imageWidth,
        height: image?.naturalHeight || imageHeight,
      };
      const projected =
        fit === "contain"
          ? projectBoxIntoContain(box, containerSize, imageSize)
          : projectBoxIntoCover(
              box,
              containerSize,
              imageSize,
              positionX,
              positionY,
            );
      currentOverlay.style.left = `${projected.left}px`;
      currentOverlay.style.top = `${projected.top}px`;
      currentOverlay.style.width = `${projected.width}px`;
      currentOverlay.style.height = `${projected.height}px`;
      currentOverlay.style.visibility = "visible";
    }

    positionOverlay();
    image?.addEventListener("load", positionOverlay);
    const observer = new ResizeObserver(positionOverlay);
    observer.observe(currentContainer);
    return () => {
      image?.removeEventListener("load", positionOverlay);
      observer.disconnect();
    };
  }, [box, fit, imageHeight, imageWidth, positionX, positionY]);

  return (
    <span
      ref={overlayRef}
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ visibility: "hidden" }}
    />
  );
}
