import { describe, expect, it } from "vitest";

import {
  createPendingSimplifiedRoomJob,
  runSimplifiedRoomJob,
} from "@/domain/media-job-runner";
import type { SimplifiedRoomActionResult } from "@/providers/provider-contracts";

const safeValidation = {
  targetObjectPresent: true,
  targetLocationPreserved: true,
  roomIdentityPreserved: true,
  misleadingContentIntroduced: false,
  safeToDisplay: true,
  conciseReason: "The candidate preserves the approved room and target.",
} as const;

function pendingJob() {
  return createPendingSimplifiedRoomJob({
    lessonId: "lesson-1",
    questionId: "question-1",
    targetObjectId: "object-glasses",
    fallbackSrc: "/fixtures/bedroom.svg",
    now: () => "2026-08-22T10:00:00.000Z",
  });
}

describe("simplified-room media job runner", () => {
  it("publishes only a completed and validated live result", async () => {
    const result: SimplifiedRoomActionResult = {
      status: "completed",
      outputSrc: "/api/generated-room-media/output.jpg",
      validationPassed: true,
      validation: safeValidation,
      generationModel: "gemini-image-test",
    };

    const job = await runSimplifiedRoomJob({
      pendingJob: pendingJob(),
      generate: async () => result,
      now: () => "2026-08-22T10:00:01.000Z",
    });

    expect(job.status).toBe("completed");
    expect(job.outputSrc).toBe(result.outputSrc);
    expect(job.validationPassed).toBe(true);
    expect(job.generationModel).toBe("gemini-image-test");
  });

  it.each(["rejected", "disabled"] as const)(
    "preserves the fallback for a %s media result",
    async (status) => {
      const job = await runSimplifiedRoomJob({
        pendingJob: pendingJob(),
        generate: async () => ({
          status,
          validationPassed: false,
          ...(status === "rejected"
            ? {
                validation: {
                  ...safeValidation,
                  targetObjectPresent: false,
                  safeToDisplay: false,
                  conciseReason: "The target is not clearly preserved.",
                },
              }
            : {}),
        }),
      });

      expect(job.status).toBe(status);
      expect(job.outputSrc).toBeUndefined();
      expect(job.fallbackSrc).toBe("/fixtures/bedroom.svg");
    },
  );

  it("times out without waiting for late media", async () => {
    let finishGeneration!: (value: SimplifiedRoomActionResult) => void;
    const generation = new Promise<SimplifiedRoomActionResult>((resolve) => {
      finishGeneration = resolve;
    });

    let lateJobStatus: string | undefined;
    const job = await runSimplifiedRoomJob({
      pendingJob: pendingJob(),
      generate: () => generation,
      onLateResult: (lateJob) => {
        lateJobStatus = lateJob.status;
      },
      budgetMs: 5,
    });

    expect(job.status).toBe("timed_out");
    expect(job.outputSrc).toBeUndefined();
    finishGeneration({
      status: "completed",
      outputSrc: "/api/generated-room-media/late.jpg",
      validationPassed: true,
      validation: safeValidation,
    });
    await Promise.resolve();
    expect(job.status).toBe("timed_out");
    expect(lateJobStatus).toBe("completed");
  });

  it("turns provider failures into a non-blocking failed state", async () => {
    const job = await runSimplifiedRoomJob({
      pendingJob: pendingJob(),
      generate: async () => {
        throw new Error("transport unavailable");
      },
    });

    expect(job.status).toBe("failed");
    expect(job.validationPassed).toBe(false);
  });
});
