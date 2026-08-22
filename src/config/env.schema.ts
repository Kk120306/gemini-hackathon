import { z } from "zod";

const booleanFlag = (fallback = false) =>
  z
    .enum(["true", "false"])
    .default(fallback ? "true" : "false")
    .transform((value) => value === "true");

const positiveInteger = (fallback: number) =>
  z.coerce.number().int().positive().default(fallback);

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().trim().min(1).default("ANCHOR"),
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION: booleanFlag(),
});

export const serverEnvSchema = z
  .object({
    GEMINI_API_KEY: z.string().trim().min(1).optional(),
    GEMMA_MODEL: z.string().trim().min(1).default("gemma-4-26b-a4b-it"),
    GEMINI_VALIDATION_MODEL: z
      .string()
      .trim()
      .min(1)
      .default("gemini-3.6-flash"),
    GEMINI_IMAGE_MODEL: z
      .string()
      .trim()
      .min(1)
      .default("gemini-3.1-flash-lite-image"),
    GEMINI_VIDEO_MODEL: z
      .string()
      .trim()
      .min(1)
      .default("gemini-omni-flash-preview"),
    ANCHOR_STORAGE_MODE: z.enum(["local"]).default("local"),
    ANCHOR_DATA_DIR: z.string().trim().min(1).default(".data"),
    ANCHOR_DEMO_MODE: booleanFlag(true),
    ANCHOR_ENABLE_IMAGE_GENERATION: booleanFlag(true),
    ANCHOR_ENABLE_VIDEO_GENERATION: booleanFlag(true),
    ANCHOR_AI_TIMEOUT_MS: positiveInteger(45_000),
    ANCHOR_VIDEO_TIMEOUT_MS: positiveInteger(180_000),
    ANCHOR_MAX_UPLOAD_MB: positiveInteger(10),
  })
  .superRefine((environment, context) => {
    if (!environment.ANCHOR_DEMO_MODE && !environment.GEMINI_API_KEY) {
      context.addIssue({
        code: "custom",
        message: "GEMINI_API_KEY is required when fixture mode is disabled.",
        path: ["GEMINI_API_KEY"],
      });
    }
  });

export type PublicEnvironment = z.infer<typeof publicEnvSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvSchema>;
