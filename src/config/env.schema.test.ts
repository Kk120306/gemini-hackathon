import { describe, expect, it } from "vitest";

import { serverEnvSchema } from "@/config/env.schema";

describe("server environment", () => {
  it("starts in fixture mode without an API credential", () => {
    const environment = serverEnvSchema.parse({ ANCHOR_DEMO_MODE: "true" });

    expect(environment.ANCHOR_DEMO_MODE).toBe(true);
    expect(environment.GEMINI_API_KEY).toBeUndefined();
    expect(environment.GEMINI_IMAGE_MODEL).toBe("gemini-3.1-flash-lite-image");
    expect(environment.GEMINI_VIDEO_MODEL).toBe("gemini-omni-flash-preview");
    expect(environment.GEMINI_TTS_MODEL).toBe("gemini-3.1-flash-tts-preview");
    expect(environment.GEMINI_TTS_VOICE).toBe("Sulafat");
  });

  it("requires an API credential in live mode", () => {
    expect(() => serverEnvSchema.parse({ ANCHOR_DEMO_MODE: "false" })).toThrow(
      "GEMINI_API_KEY is required",
    );
  });
});
