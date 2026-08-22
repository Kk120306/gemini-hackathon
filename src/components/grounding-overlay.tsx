"use client";

import { useLayoutEffect, useRef } from "react";

import type { BoundingBox } from "@/domain/anchor";
import { projectBoxIntoCover } from "@/domain/cover-geometry";

type GroundingOverlayProps = {
  box: BoundingBox;
  className: string;
  label?: string;
  imageWidth?: number;
  imageHeight?: number;
  positionX?: number;
  positionY?: number;
};

export function GroundingOverlay({
  box,
  className,
  label,
  imageWidth = 1200,
  imageHeight = 780,
  positionX = 0.5,
  positionY = 0.5,
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

    function positionOverlay() {
      const projected = projectBoxIntoCover(
        box,
        {
          width: currentContainer.clientWidth,
          height: currentContainer.clientHeight,
        },
        { width: imageWidth, height: imageHeight },
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
    const observer = new ResizeObserver(positionOverlay);
    observer.observe(currentContainer);
    return () => observer.disconnect();
  }, [box, imageHeight, imageWidth, positionX, positionY]);

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
