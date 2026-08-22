import { describe, expect, it } from "vitest";

import { advanceCue, cueIncludes } from "@/domain/cue-engine";

describe("deterministic cue engine", () => {
  it("advances exactly one level and remains at reveal", () => {
    expect(advanceCue("none")).toBe("verbal");
    expect(advanceCue("verbal")).toBe("focus");
    expect(advanceCue("focus")).toBe("simplified");
    expect(advanceCue("simplified")).toBe("reveal");
    expect(advanceCue("reveal")).toBe("reveal");
  });

  it("reports which deterministic presentation layers are active", () => {
    expect(cueIncludes("focus", "verbal")).toBe(true);
    expect(cueIncludes("focus", "simplified")).toBe(false);
  });
});
