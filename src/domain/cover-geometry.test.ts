import { describe, expect, it } from "vitest";

import {
  chooseHorizontalObjectPosition,
  expandProjectedBox,
  projectBoxIntoCover,
  projectBoxIntoContain,
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

  it("projects the full source into a contained interactive canvas", () => {
    const projected = projectBoxIntoContain(
      { x: 0.76, y: 0.56, width: 0.16, height: 0.09 },
      { width: 700, height: 520 },
      { width: 1200, height: 780 },
    );

    expect(projected.left).toBeGreaterThan(500);
    expect(projected.top).toBeGreaterThan(280);
    expect(projected.left + projected.width).toBeLessThan(700);
  });

  it("expands small objects into tablet-sized touch targets", () => {
    expect(
      expandProjectedBox(
        { left: 650, top: 470, width: 20, height: 16 },
        { width: 700, height: 520 },
      ),
    ).toEqual({ left: 618, top: 438, width: 72, height: 72 });
  });
});
