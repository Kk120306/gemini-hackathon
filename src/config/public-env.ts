import { publicEnvSchema } from "@/config/env.schema";

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION:
    process.env.NEXT_PUBLIC_ENABLE_SPEECH_RECOGNITION,
});
