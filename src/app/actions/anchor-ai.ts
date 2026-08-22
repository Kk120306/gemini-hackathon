"use server";

import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { serverEnv } from "@/config/env";
import {
  groundingRecordSchema,
  guideSchema,
  lessonSchema,
  trustedPersonSchema,
  worldModelSchema,
} from "@/domain/anchor";
import type { AiProvider } from "@/providers/ai-provider";
import { FakeAiProvider } from "@/providers/fake-ai-provider";
import { GoogleGenAiProvider } from "@/providers/google-genai-provider";
import { GoogleGenAiTransport } from "@/providers/google-genai-transport";
import { GoogleGuideMediaProvider } from "@/providers/google-guide-media-provider";
import { GoogleRoomMediaProvider } from "@/providers/google-room-media-provider";
import { FakeRoomMediaProvider } from "@/providers/fake-room-media-provider";
import {
  guideReferenceImageInputSchema,
  guideReferenceUploadInputSchema,
  guideReferenceUploadResultSchema,
  guideQuestionVideoActionInputSchema,
  guideQuestionVideoActionResultSchema,
  guideVideoValidationSchema,
  parseModelJson,
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

const guideActionInputSchema = z.object({
  trustedPerson: trustedPersonSchema,
});

function createProvider(input?: { uploadedRaster?: boolean }): AiProvider {
  if (input?.uploadedRaster) {
    if (!serverEnv.GEMINI_API_KEY) {
      throw new Error(
        "A server-side Gemini key is required to analyze a caregiver upload.",
      );
    }
    return new GoogleGenAiProvider(
      new GoogleGenAiTransport(
        serverEnv.GEMINI_API_KEY,
        serverEnv.ANCHOR_AI_TIMEOUT_MS,
      ),
      serverEnv.GEMINI_VALIDATION_MODEL,
      "gemini",
    );
  }
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
  if (serverEnv.ANCHOR_DEMO_MODE && !serverEnv.ANCHOR_LIVE_MEDIA_IN_DEMO) {
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

function createGuideMediaProvider() {
  if (!serverEnv.ANCHOR_ENABLE_IMAGE_GENERATION) {
    return null;
  }
  if (!serverEnv.GEMINI_API_KEY) {
    throw new Error("Live Gemini guide generation is not configured.");
  }
  const transport = new GoogleGenAiTransport(
    serverEnv.GEMINI_API_KEY,
    serverEnv.ANCHOR_AI_TIMEOUT_MS,
  );
  return new GoogleGuideMediaProvider(
    transport,
    transport,
    serverEnv.GEMINI_IMAGE_MODEL,
    serverEnv.GEMINI_VALIDATION_MODEL,
  );
}

async function loadGuideReferences(
  referenceImageSrcs: string[],
  mediaStore: LocalMediaStore,
) {
  return Promise.all(
    referenceImageSrcs.map(async (source, index) => {
      const prefix = "/api/guide-reference-media/";
      if (!source.startsWith(prefix)) {
        throw new Error(
          "Live guide generation requires one to three uploaded reference photos.",
        );
      }
      const media = await mediaStore.readGuideReferenceImage(
        source.slice(prefix.length),
      );
      if (!media) {
        throw new Error("A trusted-person reference image is unavailable.");
      }
      return guideReferenceImageInputSchema.parse({
        data: media.bytes.toString("base64"),
        mimeType: media.mimeType,
        fileName: `guide-reference-${index + 1}`,
      });
    }),
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
  const uploadedRaster = request.sourceKind === "caregiver_upload";
  const analysis = await createProvider({ uploadedRaster }).analyzeRoom(
    request,
  );
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

export async function uploadGuideReferencesAction(input: unknown) {
  const request = guideReferenceUploadInputSchema.parse(input);
  const mediaStore = new LocalMediaStore(serverEnv.ANCHOR_DATA_DIR);
  const imageSrcs = await Promise.all(
    request.images.map((image) => mediaStore.saveGuideReferenceImage(image)),
  );
  return guideReferenceUploadResultSchema.parse({ imageSrcs });
}

export async function generateGuideAction(input: unknown) {
  const { trustedPerson } = guideActionInputSchema.parse(input);
  if (!trustedPerson.likenessConsent) {
    throw new Error("Likeness consent is required before guide generation.");
  }
  const hasUploadedReferences = trustedPerson.referenceImageSrcs.every(
    (source) => source.startsWith("/api/guide-reference-media/"),
  );
  if (serverEnv.ANCHOR_DEMO_MODE && !hasUploadedReferences) {
    return guideSchema.parse(
      await new FakeAiProvider().generateGuide(trustedPerson),
    );
  }
  const provider = createGuideMediaProvider();
  if (!provider) {
    throw new Error(
      "Guide generation is disabled. Choose the neutral guide to continue.",
    );
  }
  const mediaStore = new LocalMediaStore(serverEnv.ANCHOR_DATA_DIR);
  const referenceImages = await loadGuideReferences(
    trustedPerson.referenceImageSrcs,
    mediaStore,
  );
  const generated = await provider.generateGuide({
    trustedPerson,
    referenceImages,
  });
  if (!generated.validation.safeToDisplay) {
    throw new Error(
      `The guide candidate failed the independent safety check: ${generated.validation.conciseReason}`,
    );
  }
  const imageSrc = await mediaStore.saveGeneratedGuideImage(generated.image);
  return guideSchema.parse({
    id: `guide-${randomUUID()}`,
    trustedPersonId: trustedPerson.id,
    presentation: "stylized_likeness",
    imageSrc,
    sourceReferenceImageSrcs: trustedPerson.referenceImageSrcs,
    label: `AI-generated guide based on ${trustedPerson.name}`,
    validation: generated.validation,
    generationModel: generated.generationModel,
    validationModel: generated.validationModel,
    generatedAt: new Date().toISOString(),
    approval: "draft",
  });
}

export async function generateGuideQuestionVideoAction(input: unknown) {
  const request = guideQuestionVideoActionInputSchema.parse(input);
  if (
    !serverEnv.ANCHOR_ENABLE_VIDEO_GENERATION ||
    !serverEnv.GEMINI_API_KEY ||
    request.guide.presentation !== "stylized_likeness"
  ) {
    return guideQuestionVideoActionResultSchema.parse({ status: "disabled" });
  }
  if (
    request.guide.approval !== "approved" ||
    !request.guide.validation?.safeToDisplay ||
    !request.trustedPerson.likenessConsent ||
    request.guide.trustedPersonId !== request.trustedPerson.id
  ) {
    throw new Error(
      "Guide video requires approved likeness consent and a validated guide.",
    );
  }
  const prefix = "/api/generated-guide-media/";
  if (!request.guide.imageSrc.startsWith(prefix)) {
    return guideQuestionVideoActionResultSchema.parse({ status: "disabled" });
  }

  const mediaStore = new LocalMediaStore(serverEnv.ANCHOR_DATA_DIR);
  const image = await mediaStore.readGeneratedGuideImage(
    request.guide.imageSrc.slice(prefix.length),
  );
  if (!image || image.mimeType === "image/svg+xml") {
    throw new Error("The approved guide image is unavailable.");
  }
  const transport = new GoogleGenAiTransport(
    serverEnv.GEMINI_API_KEY,
    serverEnv.ANCHOR_VIDEO_TIMEOUT_MS,
  );
  const dialogue = request.question.prompt.replace(/\s+/g, " ").trim();
  const generated = await transport.generateVideo({
    model: serverEnv.GEMINI_VIDEO_MODEL,
    image: {
      data: image.bytes.toString("base64"),
      mimeType: image.mimeType,
    },
    prompt: `Animate this caregiver-approved, AI-generated guide portrait into one short portrait video that gently asks a cognitive activity question.
Preserve the same face, age cues, hair, clothing, framing, and lightly stylized visual treatment.
Use only natural blinking, a small reassuring nod, subtle breathing, and direct eye contact.
The person must say exactly: ${JSON.stringify(dialogue)}
Use a neutral synthetic adult voice. Do not imitate or clone the real person's voice.
Show one person only against the same simple background.
Do not add captions, text, logos, medical claims, another person, a phone frame, a video-call interface, or messaging UI.
The clip is prerecorded generated guidance, never a live call.`,
  });

  const validationText = await transport.generate({
    model: serverEnv.GEMINI_VALIDATION_MODEL,
    video: generated,
    prompt: `Inspect this AI-generated family-guide question video.
Expected dialogue: ${JSON.stringify(dialogue)}
Return one JSON object exactly shaped as {"singlePersonOnly":true,"recognizableAsApprovedGuide":true,"noCallOrMessagingUi":true,"neutralSafeDialogue":true,"safeToDisplay":true,"conciseReason":"short literal reason"}.
Set neutralSafeDialogue true only if the speech is a calm room-activity prompt with no diagnosis, prevention, treatment, scoring, shaming, urgency, fabricated memory, or claim that the person is live.
Set safeToDisplay true only when all four checks pass. Fail closed when uncertain. Return JSON only.`,
  });
  const validation = guideVideoValidationSchema.parse(
    parseModelJson(validationText),
  );
  if (!validation.safeToDisplay) {
    throw new Error(
      `The generated guide video failed validation: ${validation.conciseReason}`,
    );
  }
  const outputSrc = await mediaStore.saveGeneratedGuideVideo(generated);
  return guideQuestionVideoActionResultSchema.parse({
    status: "completed",
    outputSrc,
    model: serverEnv.GEMINI_VIDEO_MODEL,
  });
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
