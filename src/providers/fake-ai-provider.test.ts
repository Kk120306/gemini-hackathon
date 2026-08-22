import { describe, expect, it } from "vitest";

import { FakeAiProvider } from "@/providers/fake-ai-provider";
import { createPreparedAnchorState } from "@/fixtures/demo";

describe("fake AI provider", () => {
  it("carries a caregiver correction into the generated lesson", async () => {
    const provider = new FakeAiProvider();
    const state = createPreparedAnchorState();
    state.worldModel.objects[0] = {
      ...state.worldModel.objects[0]!,
      location: "reading table",
    };
    state.groundingRecords[0] = {
      ...state.groundingRecords[0]!,
      caregiverValue: "Reading glasses on the reading table",
    };

    const lesson = await provider.generateLesson(
      state.worldModel,
      state.groundingRecords,
    );

    expect(lesson.questions[0]?.correctAnswer).toBe("Reading glasses");
    expect(lesson.questions[0]?.prompt).toContain("reading table");
    expect(lesson.questions[0]?.verbalCue).toContain("reading table");
  });

  it("refuses to generate a likeness without consent", async () => {
    const provider = new FakeAiProvider();
    const state = createPreparedAnchorState();
    state.trustedPerson = {
      ...state.trustedPerson,
      likenessConsent: false,
      consentedAt: undefined,
      consentedBy: undefined,
    };

    await expect(provider.generateGuide(state.trustedPerson)).rejects.toThrow(
      /Likeness consent/,
    );
  });
});
