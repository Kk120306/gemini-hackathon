import { z } from "zod";

import {
  boundingBoxSchema,
  guideSchema,
  guideReferenceImageSrcSchema,
  groundingRecordSchema,
  lessonQuestionSchema,
  mediaValidationSchema,
  questionTypeSchema,
  trustedPersonSchema,
  worldModelSchema,
} from "@/domain/anchor";

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

function hasExpectedImageSignature(
  data: string,
  mimeType: z.infer<typeof supportedRoomImageMimeTypeSchema>,
) {
  try {
    const prefix = atob(data.slice(0, Math.min(data.length, 1_368)));
    switch (mimeType) {
      case "image/jpeg":
        return (
          prefix.charCodeAt(0) === 0xff &&
          prefix.charCodeAt(1) === 0xd8 &&
          prefix.charCodeAt(2) === 0xff
        );
      case "image/png":
        return prefix.startsWith("\u0089PNG\r\n\u001a\n");
      case "image/webp":
        return prefix.startsWith("RIFF") && prefix.slice(8, 12) === "WEBP";
      case "image/svg+xml":
        return /^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(prefix);
    }
  } catch {
    return false;
  }
}

export const supportedRoomImageMimeTypeSchema = z.enum([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
]);

export const roomImageInputSchema = z
  .object({
    data: z.string().min(1),
    mimeType: supportedRoomImageMimeTypeSchema,
    fileName: z.string().trim().min(1).max(180),
  })
  .superRefine((image, context) => {
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(image.data)) {
      context.addIssue({
        code: "custom",
        message: "Room image data must be valid base64.",
        path: ["data"],
      });
      return;
    }

    const padding = image.data.endsWith("==")
      ? 2
      : image.data.endsWith("=")
        ? 1
        : 0;
    const decodedBytes = (image.data.length * 3) / 4 - padding;
    if (decodedBytes > MAX_IMAGE_BYTES) {
      context.addIssue({
        code: "custom",
        message: "Room images must be 10 MB or smaller.",
        path: ["data"],
      });
    }
    if (!hasExpectedImageSignature(image.data, image.mimeType)) {
      context.addIssue({
        code: "custom",
        message: "Room image bytes do not match the declared image type.",
        path: ["data"],
      });
    }
  });

export const roomAnalysisInputSchema = z.object({
  roomId: z.string().trim().min(1).max(100),
  roomName: z.string().trim().min(1).max(100),
  sourceKind: z.enum(["caregiver_upload", "prepared_fixture"]),
  image: roomImageInputSchema,
});

export const guideReferenceImageInputSchema = z.intersection(
  roomImageInputSchema,
  z.object({
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  }),
);

export const guideReferenceUploadInputSchema = z.object({
  trustedPersonId: z.string().trim().min(1).max(100),
  images: z.array(guideReferenceImageInputSchema).min(1).max(3),
});

export const guideReferenceUploadResultSchema = z.object({
  imageSrcs: z.array(guideReferenceImageSrcSchema).min(1).max(3),
});

export const guideQuestionVideoActionInputSchema = z.object({
  guide: guideSchema,
  trustedPerson: trustedPersonSchema,
  question: lessonQuestionSchema,
});

export const guideVideoValidationSchema = z
  .object({
    singlePersonOnly: z.boolean(),
    recognizableAsApprovedGuide: z.boolean(),
    noCallOrMessagingUi: z.boolean(),
    neutralSafeDialogue: z.boolean(),
    safeToDisplay: z.boolean(),
    conciseReason: z.string().trim().min(1).max(300),
  })
  .superRefine((validation, context) => {
    const passed =
      validation.singlePersonOnly &&
      validation.recognizableAsApprovedGuide &&
      validation.noCallOrMessagingUi &&
      validation.neutralSafeDialogue;
    if (validation.safeToDisplay && !passed) {
      context.addIssue({
        code: "custom",
        message: "Safe guide video must pass every content check.",
        path: ["safeToDisplay"],
      });
    }
  });

export const guideQuestionVideoActionResultSchema = z.discriminatedUnion(
  "status",
  [
    z.object({
      status: z.literal("completed"),
      outputSrc: z
        .string()
        .regex(
          /^\/api\/generated-guide-video\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.mp4$/,
        ),
      model: z.string().trim().min(1),
    }),
    z.object({ status: z.literal("disabled") }),
  ],
);

const privateRoomImageSrcSchema = z.union([
  z.literal("/fixtures/bedroom.svg"),
  z.literal("/fixtures/bedroom.png"),
  z
    .string()
    .regex(
      /^\/api\/room-media\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|svg|webp)$/,
      "Room media must use a server-issued private path.",
    ),
]);

export const simplifiedRoomActionInputSchema = z.object({
  sourceImageSrc: privateRoomImageSrcSchema,
  worldModel: worldModelSchema,
  groundingRecords: z.array(groundingRecordSchema).min(3),
  targetObjectId: z.string().trim().min(1),
});

export const simplifiedRoomProviderInputSchema = z.object({
  sourceImage: roomImageInputSchema,
  worldModel: worldModelSchema,
  groundingRecords: z.array(groundingRecordSchema).min(3),
  targetObjectId: z.string().trim().min(1),
});

export const simplifiedRoomActionResultSchema = z
  .object({
    status: z.enum(["completed", "rejected", "disabled"]),
    outputSrc: z.string().startsWith("/").optional(),
    validationPassed: z.boolean(),
    validation: mediaValidationSchema.optional(),
    generationModel: z.string().trim().min(1).optional(),
  })
  .superRefine((result, context) => {
    if (
      result.status === "completed" &&
      (!result.outputSrc ||
        !result.validationPassed ||
        !result.validation?.safeToDisplay)
    ) {
      context.addIssue({
        code: "custom",
        message: "Completed room media must include validated output.",
      });
    }
    if (result.status !== "completed" && result.validationPassed) {
      context.addIssue({
        code: "custom",
        message: "Non-completed room media cannot pass validation.",
      });
    }
  });

export const modelObjectProposalSchema = z.object({
  name: z.string().trim().min(2).max(80),
  location: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(180),
  sourceImageIndex: z.literal(0),
  boundingBox: boundingBoxSchema,
  confidence: z.enum(["low", "medium", "high"]),
});

const broadObjectNames = new Set(["item", "object", "stuff", "thing"]);
const unsupportedInference =
  /\b(always|belongs? to|beloved|cherished|favorite|her|his|memory|memories|often|owner|reminds?|routine|their|usually)\b/i;

export const roomProposalSchema = z
  .object({
    roomNameSuggestion: z.string().trim().min(1).max(100),
    objects: z.array(modelObjectProposalSchema).min(3).max(10),
  })
  .superRefine((proposal, context) => {
    const names = new Set<string>();
    proposal.objects.forEach((object, index) => {
      const normalizedName = object.name.toLowerCase();
      if (broadObjectNames.has(normalizedName)) {
        context.addIssue({
          code: "custom",
          message: "Object names must identify a specific visible object.",
          path: ["objects", index, "name"],
        });
      }
      if (names.has(normalizedName)) {
        context.addIssue({
          code: "custom",
          message: "Object proposals must have distinct names.",
          path: ["objects", index, "name"],
        });
      }
      names.add(normalizedName);

      for (const [field, value] of [
        ["name", object.name],
        ["location", object.location],
        ["description", object.description],
      ] as const) {
        if (unsupportedInference.test(value)) {
          context.addIssue({
            code: "custom",
            message: "Object proposals must contain literal visual facts only.",
            path: ["objects", index, field],
          });
        }
      }
    });
  });

const generatedQuestionTypeSchema = questionTypeSchema.exclude(["sequencing"]);

export const lessonPlanQuestionSchema = z
  .object({
    type: generatedQuestionTypeSchema,
    targetObjectId: z.string().trim().min(1),
    choiceObjectIds: z.array(z.string().trim().min(1)).min(2).max(3),
  })
  .superRefine((question, context) => {
    const uniqueChoices = new Set(question.choiceObjectIds);
    if (uniqueChoices.size !== question.choiceObjectIds.length) {
      context.addIssue({
        code: "custom",
        message: "Question choice object identifiers must be unique.",
        path: ["choiceObjectIds"],
      });
    }
    if (
      question.choiceObjectIds.filter((id) => id === question.targetObjectId)
        .length !== 1
    ) {
      context.addIssue({
        code: "custom",
        message: "The target object must appear exactly once in the choices.",
        path: ["choiceObjectIds"],
      });
    }
  });

export const lessonPlanSchema = z
  .object({
    questions: z.array(lessonPlanQuestionSchema).length(6),
  })
  .superRefine((lesson, context) => {
    const recallCount = lesson.questions.filter(
      ({ type }) => type === "visual_recall",
    ).length;
    const associationCount = lesson.questions.filter(
      ({ type }) => type === "association",
    ).length;
    if (recallCount !== 1) {
      context.addIssue({
        code: "custom",
        message: "A plan must contain exactly one visual recall activity.",
      });
    }
    if (associationCount !== 1) {
      context.addIssue({
        code: "custom",
        message: "A plan must contain exactly one association activity.",
      });
    }
    const targetCounts = new Map<string, number>();
    for (const question of lesson.questions) {
      targetCounts.set(
        question.targetObjectId,
        (targetCounts.get(question.targetObjectId) ?? 0) + 1,
      );
    }
    if (targetCounts.size < 3) {
      context.addIssue({
        code: "custom",
        message:
          "A plan must distribute targets across at least three objects.",
      });
    }
    for (const [targetObjectId, count] of targetCounts) {
      if (count > 2) {
        context.addIssue({
          code: "custom",
          message: "No object may be the target more than twice.",
          path: ["questions", targetObjectId],
        });
      }
    }
  });

export type LessonPlan = z.infer<typeof lessonPlanSchema>;
export type GuideReferenceImageInput = z.infer<
  typeof guideReferenceImageInputSchema
>;
export type GuideReferenceUploadInput = z.infer<
  typeof guideReferenceUploadInputSchema
>;
export type GuideReferenceUploadResult = z.infer<
  typeof guideReferenceUploadResultSchema
>;
export type GuideQuestionVideoActionInput = z.infer<
  typeof guideQuestionVideoActionInputSchema
>;
export type GuideQuestionVideoActionResult = z.infer<
  typeof guideQuestionVideoActionResultSchema
>;
export type RoomAnalysisInput = z.infer<typeof roomAnalysisInputSchema>;
export type RoomImageInput = z.infer<typeof roomImageInputSchema>;
export type RoomProposal = z.infer<typeof roomProposalSchema>;
export type SimplifiedRoomActionInput = z.infer<
  typeof simplifiedRoomActionInputSchema
>;
export type SimplifiedRoomActionResult = z.infer<
  typeof simplifiedRoomActionResultSchema
>;
export type SimplifiedRoomProviderInput = z.infer<
  typeof simplifiedRoomProviderInputSchema
>;

export function parseModelJson(text: string): unknown {
  const withoutFence = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  try {
    return JSON.parse(withoutFence);
  } catch {
    const firstBrace = withoutFence.indexOf("{");
    const lastBrace = withoutFence.lastIndexOf("}");
    if (firstBrace < 0 || lastBrace <= firstBrace) {
      throw new Error("The model did not return a JSON object.");
    }
    return JSON.parse(withoutFence.slice(firstBrace, lastBrace + 1));
  }
}
