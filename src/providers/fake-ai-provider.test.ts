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

    const lesson = await provider.generateLesson(
      state.worldModel,
      state.groundingRecords,
    );

    expect(lesson.questions[1]?.correctAnswer).toBe("On the reading table");
    expect(lesson.questions[1]?.verbalCue).toBe("Look near the reading table.");
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
