"use client";

import {
  analyzeRoomAction,
  generateLessonAction,
  generateSimplifiedRoomAction,
} from "@/app/actions/anchor-ai";
import type {
  GroundingRecord,
  Guide,
  Lesson,
  TrustedPerson,
  WorldModel,
} from "@/domain/anchor";
import type { AiProvider, RoomAnalysis } from "@/providers/ai-provider";
import { FakeAiProvider } from "@/providers/fake-ai-provider";
import {
  roomAnalysisInputSchema,
  simplifiedRoomActionInputSchema,
  simplifiedRoomActionResultSchema,
  type RoomAnalysisInput,
  type RoomImageInput,
  type SimplifiedRoomActionInput,
  type SimplifiedRoomActionResult,
} from "@/providers/provider-contracts";

async function blobToImageInput(
  blob: Blob,
  fileName: string,
): Promise<RoomImageInput> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result)));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(",");
  if (comma < 0) {
    throw new Error("The selected room image could not be read.");
  }
  return {
    data: dataUrl.slice(comma + 1),
    mimeType: blob.type as RoomImageInput["mimeType"],
    fileName,
  };
}

export async function prepareRoomAnalysisInput(input: {
  roomId: string;
  roomName: string;
  file?: File;
}): Promise<RoomAnalysisInput> {
  let image: RoomImageInput;
  if (input.file) {
    image = await blobToImageInput(input.file, input.file.name);
  } else {
    const response = await fetch("/fixtures/bedroom.png", {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("The prepared room image is unavailable.");
    }
    image = await blobToImageInput(await response.blob(), "bedroom.png");
  }

  return roomAnalysisInputSchema.parse({
    roomId: input.roomId,
    roomName: input.roomName,
    image,
  });
}

export class BrowserAiProvider implements AiProvider {
  private readonly fallback = new FakeAiProvider();

  analyzeRoom(input: RoomAnalysisInput): Promise<RoomAnalysis> {
    return analyzeRoomAction(input);
  }

  generateLesson(
    worldModel: WorldModel,
    groundingRecords: GroundingRecord[],
  ): Promise<Lesson> {
    return generateLessonAction({ worldModel, groundingRecords });
  }

  generateGuide(trustedPerson: TrustedPerson): Promise<Guide> {
    return this.fallback.generateGuide(trustedPerson);
  }

  async generateSimplifiedRoom(
    input: SimplifiedRoomActionInput,
  ): Promise<SimplifiedRoomActionResult> {
    const request = simplifiedRoomActionInputSchema.parse(input);
    return simplifiedRoomActionResultSchema.parse(
      await generateSimplifiedRoomAction(request),
    );
  }
}
