"use client";

import {
  analyzeRoomAction,
  generateGuideAction,
  generateGuideQuestionVideoAction,
  generateLessonAction,
  generateSimplifiedRoomAction,
  uploadGuideReferencesAction,
} from "@/app/actions/anchor-ai";
import type {
  GroundingRecord,
  Guide,
  Lesson,
  TrustedPerson,
  WorldModel,
} from "@/domain/anchor";
import type { AiProvider, RoomAnalysis } from "@/providers/ai-provider";
import {
  guideReferenceUploadInputSchema,
  guideReferenceUploadResultSchema,
  guideQuestionVideoActionInputSchema,
  guideQuestionVideoActionResultSchema,
  roomAnalysisInputSchema,
  simplifiedRoomActionInputSchema,
  simplifiedRoomActionResultSchema,
  type RoomAnalysisInput,
  type RoomImageInput,
  type SimplifiedRoomActionInput,
  type SimplifiedRoomActionResult,
  type GuideQuestionVideoActionInput,
  type GuideQuestionVideoActionResult,
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
    image = await blobToImageInput(
      await response.blob(),
      "anchor-prepared-bedroom.png",
    );
  }

  return roomAnalysisInputSchema.parse({
    roomId: input.roomId,
    roomName: input.roomName,
    sourceKind: input.file ? "caregiver_upload" : "prepared_fixture",
    image,
  });
}

export async function prepareGuideReferenceUploadInput(input: {
  trustedPersonId: string;
  files: File[];
}) {
  const images = await Promise.all(
    input.files.map((file) => blobToImageInput(file, file.name)),
  );
  return guideReferenceUploadInputSchema.parse({
    trustedPersonId: input.trustedPersonId,
    images,
  });
}

export class BrowserAiProvider implements AiProvider {
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
    return generateGuideAction({ trustedPerson });
  }

  async uploadGuideReferences(files: File[], trustedPersonId: string) {
    const input = await prepareGuideReferenceUploadInput({
      trustedPersonId,
      files,
    });
    return guideReferenceUploadResultSchema.parse(
      await uploadGuideReferencesAction(input),
    );
  }

  async generateGuideQuestionVideo(
    input: GuideQuestionVideoActionInput,
  ): Promise<GuideQuestionVideoActionResult> {
    const request = guideQuestionVideoActionInputSchema.parse(input);
    return guideQuestionVideoActionResultSchema.parse(
      await generateGuideQuestionVideoAction(request),
    );
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
