import {
  worldModelSchema,
  type BoundingBox,
  type HorizontalZone,
  type WorldModel,
  type WorldObject,
} from "@/domain/anchor";

export type VerticalZone = "upper" | "middle" | "lower";

export type SpatialAnchor = {
  objectId: string;
  centerX: number;
  centerY: number;
  horizontalZone: HorizontalZone;
  verticalZone: VerticalZone;
};

export type SpatialRelation = "left of" | "right of" | "above" | "below";

export type SpatialScene = {
  worldModelId: string;
  revision: number;
  anchors: SpatialAnchor[];
};

const relationThreshold = 0.14;

function center(box: BoundingBox) {
  return {
    x: box.x + box.width / 2,
    y: box.y + box.height / 2,
  };
}

export function horizontalZoneFor(box: BoundingBox): HorizontalZone {
  const { x } = center(box);
  if (x < 1 / 3) {
    return "left";
  }
  if (x > 2 / 3) {
    return "right";
  }
  return "center";
}

export function verticalZoneFor(box: BoundingBox): VerticalZone {
  const { y } = center(box);
  if (y < 1 / 3) {
    return "upper";
  }
  if (y > 2 / 3) {
    return "lower";
  }
  return "middle";
}

export function buildSpatialScene(worldModel: WorldModel): SpatialScene {
  const parsed = worldModelSchema.parse(worldModel);
  return {
    worldModelId: parsed.id,
    revision: parsed.revision,
    anchors: parsed.objects.map((object) => {
      const objectCenter = center(object.boundingBox);
      return {
        objectId: object.id,
        centerX: objectCenter.x,
        centerY: objectCenter.y,
        horizontalZone: horizontalZoneFor(object.boundingBox),
        verticalZone: verticalZoneFor(object.boundingBox),
      };
    }),
  };
}

export function relationBetween(
  subject: WorldObject,
  reference: WorldObject,
): SpatialRelation | null {
  const subjectCenter = center(subject.boundingBox);
  const referenceCenter = center(reference.boundingBox);
  const deltaX = subjectCenter.x - referenceCenter.x;
  const deltaY = subjectCenter.y - referenceCenter.y;

  const horizontalStrength = Math.abs(deltaX);
  const verticalStrength = Math.abs(deltaY);
  if (
    horizontalStrength < relationThreshold &&
    verticalStrength < relationThreshold
  ) {
    return null;
  }

  if (horizontalStrength >= verticalStrength) {
    return deltaX < 0 ? "left of" : "right of";
  }
  return deltaY < 0 ? "above" : "below";
}

export function relationMatches(
  subject: WorldObject,
  reference: WorldObject,
  relation: SpatialRelation,
) {
  const subjectCenter = center(subject.boundingBox);
  const referenceCenter = center(reference.boundingBox);
  switch (relation) {
    case "left of":
      return referenceCenter.x - subjectCenter.x >= relationThreshold;
    case "right of":
      return subjectCenter.x - referenceCenter.x >= relationThreshold;
    case "above":
      return referenceCenter.y - subjectCenter.y >= relationThreshold;
    case "below":
      return subjectCenter.y - referenceCenter.y >= relationThreshold;
  }
}

export function zoneLabel(zone: HorizontalZone) {
  switch (zone) {
    case "left":
      return "Left side";
    case "center":
      return "Middle";
    case "right":
      return "Right side";
  }
}
