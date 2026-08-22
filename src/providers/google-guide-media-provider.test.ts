import { describe, expect, it } from "vitest";

import { createPreparedAnchorState } from "@/fixtures/demo";
import type {
  GeneratedImage,
  GenAiRequest,
  GenAiTransport,
  ImageGenAiRequest,
  ImageGenAiTransport,
} from "@/providers/genai-transport";
import { GoogleGuideMediaProvider } from "@/providers/google-guide-media-provider";
import type { GuideReferenceImageInput } from "@/providers/provider-contracts";

const pngData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const safeValidation = {
  recognizableLikeness: true,
  consistentWithReferences: true,
  lightlyStylized: true,
  singlePersonOnly: true,
  noCallOrMessagingUi: true,
  safeToDisplay: true,
  conciseReason: "The candidate is a consistent, lightly stylized portrait.",
};

class CapturedImageTransport implements ImageGenAiTransport {
  readonly requests: ImageGenAiRequest[] = [];

  constructor(private readonly output: GeneratedImage) {}

  async generateImage(request: ImageGenAiRequest) {
    this.requests.push(request);
    return this.output;
  }
}

class CapturedValidationTransport implements GenAiTransport {
  readonly requests: GenAiRequest[] = [];

  constructor(private readonly responses: string[]) {}

  async generate(request: GenAiRequest) {
    this.requests.push(request);
    const response = this.responses.shift();
    if (!response) {
      throw new Error("No validation response remains.");
    }
    return response;
  }
}

function providerInput() {
  const state = createPreparedAnchorState();
  const referenceImages: GuideReferenceImageInput[] = [1, 2].map((index) => ({
    data: pngData,
    mimeType: "image/png",
    fileName: `reference-${index}.png`,
  }));
  return {
    trustedPerson: state.trustedPerson,
    referenceImages,
  };
}

describe("Google guide media contracts", () => {
  it("uses every approved reference and independently checks the candidate", async () => {
    const imageTransport = new CapturedImageTransport({
      data: pngData,
      mimeType: "image/png",
    });
    const validationTransport = new CapturedValidationTransport([
      JSON.stringify(safeValidation),
    ]);
    const provider = new GoogleGuideMediaProvider(
      imageTransport,
      validationTransport,
      "gemini-image-test",
      "gemini-validation-test",
    );

    const result = await provider.generateGuide(providerInput());

    expect(result.validation.safeToDisplay).toBe(true);
    expect(result.generationModel).toBe("gemini-image-test");
    expect(result.validationModel).toBe("gemini-validation-test");
    expect(imageTransport.requests[0]?.images).toHaveLength(2);
    expect(validationTransport.requests[0]?.images).toHaveLength(3);
    expect(imageTransport.requests[0]?.prompt).toContain("lightly stylized");
    expect(imageTransport.requests[0]?.prompt).toContain("one person only");
  });

  it("returns an independently rejected candidate without marking it safe", async () => {
    const rejected = {
      ...safeValidation,
      recognizableLikeness: false,
      consistentWithReferences: false,
      safeToDisplay: false,
      conciseReason: "The face is not consistently recognizable.",
    };
    const provider = new GoogleGuideMediaProvider(
      new CapturedImageTransport({ data: pngData, mimeType: "image/png" }),
      new CapturedValidationTransport([JSON.stringify(rejected)]),
      "gemini-image-test",
      "gemini-validation-test",
    );

    await expect(
      provider.generateGuide(providerInput()),
    ).resolves.toMatchObject({
      validation: {
        recognizableLikeness: false,
        safeToDisplay: false,
      },
    });
  });

  it("requires consent before sending any reference image", async () => {
    const imageTransport = new CapturedImageTransport({
      data: pngData,
      mimeType: "image/png",
    });
    const input = providerInput();
    input.trustedPerson = {
      ...input.trustedPerson,
      likenessConsent: false,
      consentedAt: undefined,
      consentedBy: undefined,
    };
    const provider = new GoogleGuideMediaProvider(
      imageTransport,
      new CapturedValidationTransport([]),
      "gemini-image-test",
      "gemini-validation-test",
    );

    await expect(provider.generateGuide(input)).rejects.toThrow(
      /Likeness consent/,
    );
    expect(imageTransport.requests).toHaveLength(0);
  });
});
