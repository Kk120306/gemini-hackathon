"use server";

import { readFile } from "node:fs/promises";
import path from "node:path";

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
import { GoogleRoomMediaProvider } from "@/providers/google-room-media-provider";
import { FakeRoomMediaProvider } from "@/providers/fake-room-media-provider";
import {
  roomAnalysisInputSchema,
  roomImageInputSchema,
  simplifiedRoomActionInputSchema,
  simplifiedRoomActionResultSchema,
  type RoomImageInput,
} from "@/providers/provider-contracts";
import type { RoomMediaProvider } from "@/providers/room-media-provider";
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

function createRoomMediaProvider(): RoomMediaProvider | null {
  if (!serverEnv.ANCHOR_ENABLE_IMAGE_GENERATION) {
    return null;
  }
  if (serverEnv.ANCHOR_DEMO_MODE) {
    return new FakeRoomMediaProvider();
  }
  if (!serverEnv.GEMINI_API_KEY) {
    throw new Error("Live Gemini image generation is not configured.");
  }
  const transport = new GoogleGenAiTransport(
    serverEnv.GEMINI_API_KEY,
    serverEnv.ANCHOR_AI_TIMEOUT_MS,
  );
  return new GoogleRoomMediaProvider(
    transport,
    transport,
    serverEnv.GEMINI_IMAGE_MODEL,
    serverEnv.GEMINI_VALIDATION_MODEL,
  );
}

async function loadSourceRoomImage(
  sourceImageSrc: string,
  sourceImageId: string,
  mediaStore: LocalMediaStore,
): Promise<RoomImageInput> {
  if (sourceImageSrc.startsWith("/api/room-media/")) {
    const fileName = sourceImageSrc.slice("/api/room-media/".length);
    const media = await mediaStore.readRoomImage(fileName);
    if (!media) {
      throw new Error("The approved room image is unavailable.");
    }
    return roomImageInputSchema.parse({
      data: media.bytes.toString("base64"),
      mimeType: media.mimeType,
      fileName: `${sourceImageId}:source`,
    });
  }

  const bytes = await readFile(
    path.join(process.cwd(), "public", "fixtures", "bedroom.png"),
  );
  return roomImageInputSchema.parse({
    data: bytes.toString("base64"),
    mimeType: "image/png",
    fileName: `${sourceImageId}:fixture`,
  });
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

export async function generateSimplifiedRoomAction(input: unknown) {
  const request = simplifiedRoomActionInputSchema.parse(input);
  const provider = createRoomMediaProvider();
  if (!provider) {
    return simplifiedRoomActionResultSchema.parse({
      status: "disabled",
      validationPassed: false,
    });
  }
  const target = request.worldModel.objects.find(
    ({ id }) => id === request.targetObjectId,
  );
  if (!target || target.approval !== "approved") {
    throw new Error("The simplified cue target is not caregiver-approved.");
  }
  const mediaStore = new LocalMediaStore(serverEnv.ANCHOR_DATA_DIR);
  const sourceImage = await loadSourceRoomImage(
    request.sourceImageSrc,
    target.sourceImageId,
    mediaStore,
  );
  const generated = await provider.generateSimplifiedRoom({
    sourceImage,
    worldModel: request.worldModel,
    groundingRecords: request.groundingRecords,
    targetObjectId: target.id,
  });
  if (!generated.validation.safeToDisplay) {
    return simplifiedRoomActionResultSchema.parse({
      status: "rejected",
      validationPassed: false,
      validation: generated.validation,
      generationModel: generated.generationModel,
    });
  }
  const outputSrc = await mediaStore.saveGeneratedRoomImage(generated.image);
  return simplifiedRoomActionResultSchema.parse({
    status: "completed",
    outputSrc,
    validationPassed: true,
    validation: generated.validation,
    generationModel: generated.generationModel,
  });
}
