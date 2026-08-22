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

test("live Gemini generates and validates one consented guide portrait", async () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required for the live guide smoke.");
  }
  const [{ GoogleGenAiTransport }, { GoogleGuideMediaProvider }] =
    await Promise.all([
      import("@/providers/google-genai-transport"),
      import("@/providers/google-guide-media-provider"),
    ]);
  const transport = new GoogleGenAiTransport(apiKey, 90_000);
  const provider = new GoogleGuideMediaProvider(
    transport,
    transport,
    process.env.GEMINI_IMAGE_MODEL || "gemini-3.1-flash-lite-image",
    process.env.GEMINI_VALIDATION_MODEL || "gemini-3.6-flash",
  );
  const state = createPreparedAnchorState();
  const referenceImages = await Promise.all(
    ["elena-reference-1.png", "elena-reference-2.png"].map(
      async (fileName) => ({
        data: (
          await readFile(
            path.join(process.cwd(), "public", "fixtures", fileName),
          )
        ).toString("base64"),
        mimeType: "image/png" as const,
        fileName,
      }),
    ),
  );

  const result = await provider.generateGuide({
    trustedPerson: state.trustedPerson,
    referenceImages,
  });

  expect(result.image.data.length).toBeGreaterThan(1_000);
  expect(["image/jpeg", "image/png", "image/webp"]).toContain(
    result.image.mimeType,
  );
  expect(result.validation.conciseReason.length).toBeGreaterThan(0);
  expect(result.validation.safeToDisplay).toBe(true);
});
