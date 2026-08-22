import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { describe, expect, test } from "vitest";

import { GoogleGenAiProvider } from "@/providers/google-genai-provider";
import { GoogleGenAiTransport } from "@/providers/google-genai-transport";
import { roomAnalysisInputSchema } from "@/providers/provider-contracts";

const officeImagePath = path.join(
  process.cwd(),
  ".data",
  "acceptance",
  "IMG_0280.JPG",
);
const canRun =
  Boolean(process.env.GEMINI_API_KEY) && existsSync(officeImagePath);

describe.skipIf(!canRun)("provided office-room acceptance image", () => {
  test("Gemini detects visible office objects instead of fixture placeholders", async () => {
    const bytes = await readFile(officeImagePath);
    const provider = new GoogleGenAiProvider(
      new GoogleGenAiTransport(process.env.GEMINI_API_KEY!, 90_000),
      process.env.GEMINI_VALIDATION_MODEL ?? "gemini-3.6-flash",
      "gemini",
    );
    const result = await provider.analyzeRoom(
      roomAnalysisInputSchema.parse({
        roomId: "office-acceptance",
        roomName: "Office",
        sourceKind: "caregiver_upload",
        image: {
          data: bytes.toString("base64"),
          mimeType: "image/jpeg",
          fileName: "IMG_0280.JPG",
        },
      }),
    );

    expect(result.analysisSource).toBe("gemini");
    expect(result.worldModel.objects.length).toBeGreaterThanOrEqual(6);

    const evidenceText = result.worldModel.objects
      .flatMap((object) => [object.name, object.description, object.location])
      .join(" ")
      .toLowerCase();
    const expectedVisibleAnchors = [
      /monitor|screen|display/,
      /keyboard/,
      /chair/,
      /desk|table/,
      /window/,
      /bottle/,
      /computer|tower|speaker/,
    ];
    expect(
      expectedVisibleAnchors.filter((pattern) => pattern.test(evidenceText))
        .length,
    ).toBeGreaterThanOrEqual(6);
    expect(evidenceText).not.toMatch(/reading glasses|blue mug|bedside lamp/);

    for (const object of result.worldModel.objects) {
      expect(object.boundingBox.width * object.boundingBox.height).toBeLessThan(
        0.7,
      );
      expect(object.description.length).toBeGreaterThan(8);
      expect(["medium", "high"]).toContain(object.detectionConfidence);
    }
  }, 120_000);
});
