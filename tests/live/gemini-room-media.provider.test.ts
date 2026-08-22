import { readFile } from "node:fs/promises";
import path from "node:path";

import { beforeAll, expect, test } from "vitest";

import { createPreparedAnchorState } from "@/fixtures/demo";

async function loadIgnoredLocalEnvironment() {
  try {
    const contents = await readFile(
      path.join(process.cwd(), ".env.local"),
      "utf8",
    );
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
      if (!match || process.env[match[1]!]) {
        continue;
      }
      const value = match[2]!.trim().replace(/^(['"])(.*)\1$/, "$2");
      process.env[match[1]!] = value;
    }
  } catch (error) {
    if (!(
      error instanceof Error &&
      "code" in error &&
      error.code === "ENOENT"
    )) {
      throw error;
    }
  }
}

beforeAll(loadIgnoredLocalEnvironment);

test("live Gemini generates and validates one simplified room cue", async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for the live media smoke.");
  }
  const [{ GoogleGenAiTransport }, { GoogleRoomMediaProvider }] =
    await Promise.all([
      import("@/providers/google-genai-transport"),
      import("@/providers/google-room-media-provider"),
    ]);
  const transport = new GoogleGenAiTransport(apiKey, 90_000);
  const provider = new GoogleRoomMediaProvider(
    transport,
    transport,
    process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image",
    process.env.GEMINI_VALIDATION_MODEL || "gemini-3.6-flash",
  );
  const state = createPreparedAnchorState();
  const bytes = await readFile(
    path.join(process.cwd(), "public", "fixtures", "bedroom.png"),
  );

  const result = await provider.generateSimplifiedRoom({
    sourceImage: {
      data: bytes.toString("base64"),
      mimeType: "image/png",
      fileName: `${state.room.id}:live-smoke`,
    },
    worldModel: state.worldModel,
    groundingRecords: state.groundingRecords,
    targetObjectId: "object-glasses",
  });

  expect(result.image.data.length).toBeGreaterThan(1_000);
  expect(["image/jpeg", "image/png", "image/webp"]).toContain(
    result.image.mimeType,
  );
  expect(result.validation.conciseReason.length).toBeGreaterThan(0);
  expect(result.validation.safeToDisplay).toBe(true);
  expect(result.validation.safeToDisplay).toBe(
    result.validation.targetObjectPresent &&
      result.validation.targetLocationPreserved &&
      result.validation.roomIdentityPreserved &&
      !result.validation.misleadingContentIntroduced,
  );
});
