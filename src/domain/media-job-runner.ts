import { mediaJobSchema, type MediaJob } from "@/domain/anchor";
import type { SimplifiedRoomActionResult } from "@/providers/provider-contracts";

export const simplifiedRoomStageBudgetMs = 8_000;

export function createPendingSimplifiedRoomJob(input: {
  lessonId: string;
  questionId: string;
  targetObjectId: string;
  fallbackSrc: string;
  now?: () => string;
}): MediaJob {
  return mediaJobSchema.parse({
    id: `media-room-${input.lessonId}-${input.questionId}`,
    kind: "simplified_room",
    status: "pending",
    lessonId: input.lessonId,
    questionId: input.questionId,
    targetObjectId: input.targetObjectId,
    fallbackSrc: input.fallbackSrc,
    validationPassed: false,
    startedAt: (input.now ?? (() => new Date().toISOString()))(),
  });
}

export async function runSimplifiedRoomJob(input: {
  pendingJob: MediaJob;
  generate(): Promise<SimplifiedRoomActionResult>;
  onLateResult?(job: MediaJob): void;
  budgetMs?: number;
  now?: () => string;
}): Promise<MediaJob> {
  const pendingJob = mediaJobSchema.parse(input.pendingJob);
  if (
    pendingJob.kind !== "simplified_room" ||
    pendingJob.status !== "pending"
  ) {
    throw new Error("The media runner requires a pending simplified-room job.");
  }

  const timedOut = Symbol("timed-out");
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let budgetExceeded = false;
  const settledAt = () => (input.now ?? (() => new Date().toISOString()))();
  const settleResult = (result: SimplifiedRoomActionResult) =>
    mediaJobSchema.parse({
      ...pendingJob,
      status: result.status,
      outputSrc: result.outputSrc,
      validationPassed: result.validationPassed,
      validation: result.validation,
      generationModel: result.generationModel,
      settledAt: settledAt(),
    });
  const settleFailure = () =>
    mediaJobSchema.parse({
      ...pendingJob,
      status: "failed",
      settledAt: settledAt(),
    });
  const generation = input.generate();
  void generation.then(
    (result) => {
      if (budgetExceeded) {
        input.onLateResult?.(settleResult(result));
      }
    },
    () => {
      if (budgetExceeded) {
        input.onLateResult?.(settleFailure());
      }
    },
  );
  try {
    const result = await Promise.race([
      generation,
      new Promise<typeof timedOut>((resolve) => {
        timeout = setTimeout(() => {
          budgetExceeded = true;
          resolve(timedOut);
        }, input.budgetMs ?? simplifiedRoomStageBudgetMs);
      }),
    ]);
    if (result === timedOut) {
      return mediaJobSchema.parse({
        ...pendingJob,
        status: "timed_out",
        settledAt: settledAt(),
      });
    }
    return settleResult(result);
  } catch {
    return settleFailure();
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}
