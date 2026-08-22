"use server";

import { z } from "zod";

import { serverEnv } from "@/config/env";
import {
  groundingRecordSchema,
  lessonSchema,
  worldModelSchema,
} from "@/domain/anchor";
import type { AiProvider } from "@/providers/ai-provider";
import { FakeAiProvider } from "@/providers/fake-ai-provider";
import { GoogleGenAiProvider } from "@/providers/google-genai-provider";
import { GoogleGenAiTransport } from "@/providers/google-genai-transport";
import { roomAnalysisInputSchema } from "@/providers/provider-contracts";
import { LocalMediaStore } from "@/storage/local-media-store";

const lessonActionInputSchema = z.object({
  worldModel: worldModelSchema,
  groundingRecords: z.array(groundingRecordSchema).min(3),
});

function createProvider(): AiProvider {
  if (serverEnv.ANCHOR_DEMO_MODE) {
    return new FakeAiProvider();
  }
  if (!serverEnv.GEMINI_API_KEY) {
    throw new Error("Live Gemma is not configured on this server.");
  }
  return new GoogleGenAiProvider(
    new GoogleGenAiTransport(
      serverEnv.GEMINI_API_KEY,
      serverEnv.ANCHOR_AI_TIMEOUT_MS,
    ),
    serverEnv.GEMMA_MODEL,
  );
}

export async function analyzeRoomAction(input: unknown) {
  const request = roomAnalysisInputSchema.parse(input);
  const analysis = await createProvider().analyzeRoom(request);
  const imageSrc = await new LocalMediaStore(
    serverEnv.ANCHOR_DATA_DIR,
  ).saveRoomImage(request.image);

  return {
    ...analysis,
    imageSrc,
  };
}

export async function generateLessonAction(input: unknown) {
  const request = lessonActionInputSchema.parse(input);
  return lessonSchema.parse(
    await createProvider().generateLesson(
      request.worldModel,
      request.groundingRecords,
    ),
  );
}
