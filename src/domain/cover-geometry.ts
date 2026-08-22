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

export function projectBoxIntoContain(
  box: BoundingBox,
  container: Size,
  image: Size,
): ProjectedBox {
  const scale = Math.min(
    container.width / image.width,
    container.height / image.height,
  );
  const renderedWidth = image.width * scale;
  const renderedHeight = image.height * scale;
  const offsetX = (container.width - renderedWidth) / 2;
  const offsetY = (container.height - renderedHeight) / 2;

  return {
    left: offsetX + box.x * renderedWidth,
    top: offsetY + box.y * renderedHeight,
    width: box.width * renderedWidth,
    height: box.height * renderedHeight,
  };
}

export function expandProjectedBox(
  box: ProjectedBox,
  container: Size,
  minimumSize = 72,
  edgePadding = 10,
): ProjectedBox {
  const width = Math.min(
    Math.max(box.width, minimumSize),
    container.width - edgePadding * 2,
  );
  const height = Math.min(
    Math.max(box.height, minimumSize),
    container.height - edgePadding * 2,
  );
  const centerX = box.left + box.width / 2;
  const centerY = box.top + box.height / 2;

  return {
    left: Math.min(
      Math.max(centerX - width / 2, edgePadding),
      container.width - width - edgePadding,
    ),
    top: Math.min(
      Math.max(centerY - height / 2, edgePadding),
      container.height - height - edgePadding,
    ),
    width,
    height,
  };
}
