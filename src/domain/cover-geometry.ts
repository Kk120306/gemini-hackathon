import type { BoundingBox } from "@/domain/anchor";

type Size = { width: number; height: number };

export type ProjectedBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export function chooseHorizontalObjectPosition(box: BoundingBox): number {
  const center = box.x + box.width / 2;
  if (center < 0.35) {
    return 0;
  }
  if (center > 0.65) {
    return 1;
  }
  return 0.5;
}

export function projectBoxIntoCover(
  box: BoundingBox,
  container: Size,
  image: Size,
  positionX = 0.5,
  positionY = 0.5,
): ProjectedBox {
  const scale = Math.max(
    container.width / image.width,
    container.height / image.height,
  );
  const renderedWidth = image.width * scale;
  const renderedHeight = image.height * scale;
  const offsetX = (container.width - renderedWidth) * positionX;
  const offsetY = (container.height - renderedHeight) * positionY;

  return {
    left: offsetX + box.x * renderedWidth,
    top: offsetY + box.y * renderedHeight,
    width: box.width * renderedWidth,
    height: box.height * renderedHeight,
  };
}
