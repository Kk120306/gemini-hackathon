import { describe, expect, it } from "vitest";

import {
  chooseHorizontalObjectPosition,
  projectBoxIntoCover,
} from "@/domain/cover-geometry";

describe("grounding overlay projection", () => {
  it("keeps an edge target visible while preserving source coordinates", () => {
    const glasses = { x: 0.76, y: 0.56, width: 0.16, height: 0.09 };
    const position = chooseHorizontalObjectPosition(glasses);
    const projected = projectBoxIntoCover(
      glasses,
      { width: 724, height: 655 },
      { width: 1200, height: 780 },
      position,
    );

    expect(position).toBe(1);
    expect(projected.left).toBeGreaterThan(470);
    expect(projected.left + projected.width).toBeLessThanOrEqual(724);
  });

  it("uses the left edge for a left-side target", () => {
    expect(
      chooseHorizontalObjectPosition({
        x: 0.165,
        y: 0.5,
        width: 0.115,
        height: 0.2,
      }),
    ).toBe(0);
  });
});
