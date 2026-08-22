import { describe, expect, it } from "vitest";

import {
  buildSpatialScene,
  horizontalZoneFor,
  recallZoneFor,
  relationBetween,
  relationMatches,
} from "@/domain/spatial-scene";
import { createPreparedAnchorState } from "@/fixtures/demo";

describe("spatial room model", () => {
  it("derives stable room zones from approved image coordinates", () => {
    const state = createPreparedAnchorState();
    const scene = buildSpatialScene(state.worldModel);

    expect(scene.anchors).toMatchObject([
      { objectId: "object-glasses", horizontalZone: "right" },
      { objectId: "object-lamp", horizontalZone: "right" },
      { objectId: "object-mug", horizontalZone: "left" },
    ]);
    expect(
      horizontalZoneFor({ x: 0.42, y: 0.2, width: 0.1, height: 0.1 }),
    ).toBe("center");
    expect(recallZoneFor({ x: 0.72, y: 0.66, width: 0.1, height: 0.1 })).toBe(
      "lower_right",
    );
    expect(recallZoneFor({ x: 0.42, y: 0.14, width: 0.1, height: 0.1 })).toBe(
      "upper_center",
    );
  });

  it("states only clear image-plane relationships", () => {
    const state = createPreparedAnchorState();
    const [glasses, lamp, mug] = state.worldModel.objects;
    if (!glasses || !lamp || !mug) {
      throw new Error("Prepared objects are unavailable.");
    }

    expect(relationBetween(lamp, glasses)).toBe("above");
    expect(relationBetween(mug, glasses)).toBe("left of");
    expect(relationMatches(mug, glasses, "left of")).toBe(true);
    expect(relationMatches(lamp, glasses, "left of")).toBe(false);
  });
});
