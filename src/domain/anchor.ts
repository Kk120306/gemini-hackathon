import { z } from "zod";

export const approvalStateSchema = z.enum(["draft", "approved", "rejected"]);

export const boundingBoxSchema = z
  .object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    width: z.number().positive().max(1),
    height: z.number().positive().max(1),
  })
  .refine(({ x, width }) => x + width <= 1, {
    message: "Bounding box extends beyond the image width.",
  })
  .refine(({ y, height }) => y + height <= 1, {
    message: "Bounding box extends beyond the image height.",
  });

export const groundingRecordSchema = z.object({
  id: z.string().min(1),
  sourceType: z.enum(["visual", "caregiver"]),
  sourceImageId: z.string().min(1).optional(),
  sourceCrop: boundingBoxSchema.optional(),
  modelObservation: z.string().min(1).optional(),
  caregiverValue: z.string().min(1),
  caregiverConfirmedAt: z.string().datetime().optional(),
  caregiverConfirmedBy: z.string().min(1).optional(),
  approval: approvalStateSchema,
});

export const worldObjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  location: z.string().min(1),
  description: z.string().min(1),
  boundingBox: boundingBoxSchema,
  sourceImageId: z.string().min(1),
  groundingRecordId: z.string().min(1),
  approval: approvalStateSchema,
});

export const worldModelSchema = z.object({
  id: z.string().min(1),
  roomName: z.string().min(1),
  revision: z.number().int().positive(),
  objects: z.array(worldObjectSchema).min(3).max(5),
  approval: approvalStateSchema,
});

export const trustedPersonSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    relationship: z.string().min(1),
    referenceImageSrcs: z.array(z.string().startsWith("/")).min(2).max(3),
    likenessConsent: z.boolean(),
    consentedBy: z.string().min(1).optional(),
    consentedAt: z.string().datetime().optional(),
  })
  .superRefine((person, context) => {
    if (
      person.likenessConsent &&
      (!person.consentedBy || !person.consentedAt)
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Consent metadata is required when likeness consent is granted.",
      });
    }
  });

export const guideSchema = z.object({
  id: z.string().min(1),
  trustedPersonId: z.string().min(1),
  presentation: z.enum(["stylized_likeness", "neutral"]),
  imageSrc: z.string().startsWith("/"),
  label: z.string().min(1),
  approval: approvalStateSchema,
});

export const questionTypeSchema = z.enum([
  "object_recognition",
  "location_matching",
  "visual_search",
  "visual_recall",
  "sequencing",
  "association",
]);

export const cognitiveSkillSchema = z.enum([
  "recognition",
  "spatial_orientation",
  "attention",
  "short_term_memory",
  "sequencing",
  "semantic_association",
]);

export const lessonQuestionSchema = z
  .object({
    id: z.string().min(1),
    type: questionTypeSchema,
    cognitiveSkill: cognitiveSkillSchema,
    prompt: z.string().min(1),
    targetObjectId: z.string().min(1),
    objectIds: z.array(z.string().min(1)).min(1),
    sourceImageId: z.string().min(1),
    groundingRecordIds: z.array(z.string().min(1)).min(1),
    correctAnswer: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2).max(3),
    verbalCue: z.string().min(1),
    encouragement: z.string().min(1),
    visualCueStrategy: z.enum([
      "focus_box",
      "simplify_scene",
      "object_closeup",
    ]),
    requiresCaregiverVerifiedSequence: z.boolean(),
  })
  .refine(
    (question) =>
      question.choices.filter((choice) => choice === question.correctAnswer)
        .length === 1,
    { message: "The correct answer must appear exactly once in the choices." },
  );

export const lessonSchema = z
  .object({
    id: z.string().min(1),
    worldModelId: z.string().min(1),
    worldModelRevision: z.number().int().positive(),
    questions: z.array(lessonQuestionSchema).length(6),
    approval: approvalStateSchema,
  })
  .superRefine((lesson, context) => {
    const recallCount = lesson.questions.filter(
      ({ type }) => type === "visual_recall",
    ).length;
    const sequenceOrAssociationCount = lesson.questions.filter(({ type }) =>
      ["sequencing", "association"].includes(type),
    ).length;

    if (recallCount !== 1) {
      context.addIssue({
        code: "custom",
        message: "A lesson must contain exactly one visual recall activity.",
      });
    }

    if (sequenceOrAssociationCount !== 1) {
      context.addIssue({
        code: "custom",
        message:
          "A lesson must contain exactly one sequencing or association activity.",
      });
    }
  });

export const cueLevelSchema = z.enum([
  "none",
  "verbal",
  "focus",
  "simplified",
  "reveal",
]);

export const mediaValidationSchema = z
  .object({
    targetObjectPresent: z.boolean(),
    targetLocationPreserved: z.boolean(),
    roomIdentityPreserved: z.boolean(),
    misleadingContentIntroduced: z.boolean(),
    safeToDisplay: z.boolean(),
    conciseReason: z.string().trim().min(1).max(300),
  })
  .superRefine((validation, context) => {
    const preservationPassed =
      validation.targetObjectPresent &&
      validation.targetLocationPreserved &&
      validation.roomIdentityPreserved &&
      !validation.misleadingContentIntroduced;

    if (validation.safeToDisplay && !preservationPassed) {
      context.addIssue({
        code: "custom",
        message: "Safe-to-display requires every preservation check to pass.",
        path: ["safeToDisplay"],
      });
    }
  });

export const mediaJobSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["guide_image", "simplified_room", "guide_video"]),
    status: z.enum([
      "pending",
      "completed",
      "failed",
      "rejected",
      "timed_out",
      "disabled",
    ]),
    lessonId: z.string().min(1).optional(),
    questionId: z.string().min(1).optional(),
    targetObjectId: z.string().min(1).optional(),
    fallbackSrc: z.string().startsWith("/"),
    outputSrc: z.string().startsWith("/").optional(),
    validationPassed: z.boolean(),
    validation: mediaValidationSchema.optional(),
    generationModel: z.string().trim().min(1).optional(),
    startedAt: z.string().datetime().optional(),
    settledAt: z.string().datetime().optional(),
  })
  .superRefine((job, context) => {
    if (job.kind !== "simplified_room") {
      return;
    }
    if (!job.lessonId || !job.questionId || !job.targetObjectId) {
      context.addIssue({
        code: "custom",
        message: "Simplified-room jobs require lesson and grounding IDs.",
      });
    }
    if (job.status === "completed") {
      if (
        !job.outputSrc ||
        !job.validationPassed ||
        !job.validation?.safeToDisplay
      ) {
        context.addIssue({
          code: "custom",
          message:
            "Completed simplified-room media must have validated output.",
        });
      }
    } else if (job.validationPassed) {
      context.addIssue({
        code: "custom",
        message: "Only completed simplified-room media can pass validation.",
      });
    }
  });

export const lessonSessionSchema = z.object({
  lessonId: z.string().min(1),
  questionIndex: z.number().int().min(0).max(5),
  cueLevel: cueLevelSchema,
  status: z.enum(["idle", "active", "complete"]),
  feedback: z.enum(["idle", "encouragement", "correct", "revealed"]),
});

export const anchorStateSchema = z.object({
  version: z.literal(1),
  patient: z.object({
    id: z.string().min(1),
    firstName: z.string().min(1),
  }),
  room: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    imageSrc: z.string().startsWith("/"),
    analysisSource: z.enum(["fixture", "gemma"]).default("fixture"),
    uploadStatus: z.enum(["ready", "analyzing", "analyzed", "failed"]),
  }),
  worldModel: worldModelSchema,
  groundingRecords: z.array(groundingRecordSchema).min(3),
  trustedPerson: trustedPersonSchema,
  guide: guideSchema.nullable(),
  lesson: lessonSchema.nullable(),
  mediaJobs: z.array(mediaJobSchema),
  session: lessonSessionSchema,
});

export type AnchorState = z.infer<typeof anchorStateSchema>;
export type ApprovalState = z.infer<typeof approvalStateSchema>;
export type BoundingBox = z.infer<typeof boundingBoxSchema>;
export type CueLevel = z.infer<typeof cueLevelSchema>;
export type GroundingRecord = z.infer<typeof groundingRecordSchema>;
export type Guide = z.infer<typeof guideSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type LessonQuestion = z.infer<typeof lessonQuestionSchema>;
export type LessonSession = z.infer<typeof lessonSessionSchema>;
export type MediaJob = z.infer<typeof mediaJobSchema>;
export type MediaValidation = z.infer<typeof mediaValidationSchema>;
export type TrustedPerson = z.infer<typeof trustedPersonSchema>;
export type WorldModel = z.infer<typeof worldModelSchema>;
export type WorldObject = z.infer<typeof worldObjectSchema>;
