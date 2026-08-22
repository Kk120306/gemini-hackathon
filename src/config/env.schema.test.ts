import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "@/config/env.schema";

describe("server environment", () => {
  it("starts in fixture mode without an API credential", () => {
    const environment = serverEnvSchema.parse({ ANCHOR_DEMO_MODE: "true" });

    expect(environment.ANCHOR_DEMO_MODE).toBe(true);
    expect(environment.GEMINI_API_KEY).toBeUndefined();
  });

  it("requires an API credential in live mode", () => {
    expect(() => serverEnvSchema.parse({ ANCHOR_DEMO_MODE: "false" })).toThrow(
      "GEMINI_API_KEY is required",
    );
  });
});
