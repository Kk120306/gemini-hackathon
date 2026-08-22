import { describe, expect, it } from "vitest";

import { createPreparedAnchorState } from "@/fixtures/demo";
import type {
  GeneratedImage,
  GenAiRequest,
  GenAiTransport,
  ImageGenAiRequest,
  ImageGenAiTransport,
} from "@/providers/genai-transport";
import { GoogleRoomMediaProvider } from "@/providers/google-room-media-provider";
import type { RoomImageInput } from "@/providers/provider-contracts";

const pngData =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

const safeValidation = {
  targetObjectPresent: true,
  targetLocationPreserved: true,
  roomIdentityPreserved: true,
  misleadingContentIntroduced: false,
  safeToDisplay: true,
  conciseReason: "The room and target remain clearly preserved.",
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
  const sourceImage: RoomImageInput = {
    data: pngData,
    mimeType: "image/png",
    fileName: "room-bedroom-1:fixture",
  };
  return {
    state,
    input: {
      sourceImage,
      worldModel: state.worldModel,
      groundingRecords: state.groundingRecords,
      targetObjectId: "object-glasses",
    },
  };
}

describe("Google simplified-room media contracts", () => {
  it("generates from approved evidence and validates source against output", async () => {
    const imageTransport = new CapturedImageTransport({
      data: pngData,
      mimeType: "image/png",
    });
    const validationTransport = new CapturedValidationTransport([
      JSON.stringify(safeValidation),
    ]);
    const provider = new GoogleRoomMediaProvider(
      imageTransport,
      validationTransport,
      "gemini-image-test",
      "gemini-validation-test",
    );
    const { input } = providerInput();

    const result = await provider.generateSimplifiedRoom(input);

    expect(result.validation.safeToDisplay).toBe(true);
    expect(result.generationModel).toBe("gemini-image-test");
    expect(imageTransport.requests[0]?.prompt).toContain(
      "Dark blue reading glasses",
    );
    expect(imageTransport.requests[0]?.prompt).toContain("bedside table");
    expect(validationTransport.requests[0]?.images).toHaveLength(2);
  });

  it("returns a valid rejection instead of publishing uncertain media", async () => {
    const rejection = {
      ...safeValidation,
      targetObjectPresent: false,
      targetLocationPreserved: false,
      safeToDisplay: false,
      conciseReason: "The target cannot be confirmed in the candidate.",
    };
    const provider = new GoogleRoomMediaProvider(
      new CapturedImageTransport({ data: pngData, mimeType: "image/png" }),
      new CapturedValidationTransport([JSON.stringify(rejection)]),
      "gemini-image-test",
      "gemini-validation-test",
    );

    await expect(
      provider.generateSimplifiedRoom(providerInput().input),
    ).resolves.toMatchObject({
      validation: { safeToDisplay: false, targetObjectPresent: false },
    });
  });

  it("repairs malformed validation once but never repairs image bytes", async () => {
    const validationTransport = new CapturedValidationTransport([
      "not json",
      JSON.stringify(safeValidation),
    ]);
    const provider = new GoogleRoomMediaProvider(
      new CapturedImageTransport({ data: pngData, mimeType: "image/png" }),
      validationTransport,
      "gemini-image-test",
      "gemini-validation-test",
    );

    await expect(
      provider.generateSimplifiedRoom(providerInput().input),
    ).resolves.toBeDefined();
    expect(validationTransport.requests).toHaveLength(2);
    expect(validationTransport.requests[1]?.prompt).toContain(
      "previous response was structurally invalid",
    );

    const invalidImageProvider = new GoogleRoomMediaProvider(
      new CapturedImageTransport({
        data: "bm90IGEgcG5n",
        mimeType: "image/png",
      }),
      new CapturedValidationTransport([]),
      "gemini-image-test",
      "gemini-validation-test",
    );
    await expect(
      invalidImageProvider.generateSimplifiedRoom(providerInput().input),
    ).rejects.toThrow(/declared image type/);
  });

  it("rejects a target that is not part of the approved room", async () => {
    const { input } = providerInput();
    input.targetObjectId = "object-invented";
    const provider = new GoogleRoomMediaProvider(
      new CapturedImageTransport({ data: pngData, mimeType: "image/png" }),
      new CapturedValidationTransport([]),
      "gemini-image-test",
      "gemini-validation-test",
    );

    await expect(provider.generateSimplifiedRoom(input)).rejects.toThrow(
      /approved target/,
    );
  });
});
