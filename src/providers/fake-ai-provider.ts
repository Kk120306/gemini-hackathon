import type { AiProvider, RoomAnalysis } from "@/providers/ai-provider";
import {
  guideSchema,
  trustedPersonSchema,
  worldModelSchema,
  type GroundingRecord,
  type Guide,
  type Lesson,
  type TrustedPerson,
  type WorldModel,
} from "@/domain/anchor";
import { compileGroundedLesson } from "@/domain/lesson-compiler";
import { createPreparedAnchorState } from "@/fixtures/demo";
import type { RoomAnalysisInput } from "@/providers/provider-contracts";

function pause(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 80));
}

export class FakeAiProvider implements AiProvider {
  async analyzeRoom(input: RoomAnalysisInput): Promise<RoomAnalysis> {
    await pause();
    const fixture = createPreparedAnchorState();

    return {
      worldModel: worldModelSchema.parse({
        ...fixture.worldModel,
        id: `world-${input.roomId}`,
        roomName: input.roomName,
        approval: "draft",
        objects: fixture.worldModel.objects.map((object) => ({
          ...object,
          sourceImageId: input.roomId,
          approval: "draft",
        })),
      }),
      groundingRecords: fixture.groundingRecords.map((record) => ({
        ...record,
        sourceImageId: input.roomId,
        caregiverConfirmedAt: undefined,
        caregiverConfirmedBy: undefined,
        approval: "draft" as const,
      })),
      analysisSource: "fixture",
    };
  }

  async generateGuide(trustedPerson: TrustedPerson): Promise<Guide> {
    await pause();
    const person = trustedPersonSchema.parse(trustedPerson);

    if (!person.likenessConsent) {
      throw new Error("Likeness consent is required before guide generation.");
    }

    return guideSchema.parse({
      id: `guide-${person.id}`,
      trustedPersonId: person.id,
      presentation: "stylized_likeness",
      imageSrc: "/fixtures/elena-guide.svg",
      label: `AI-generated guide based on ${person.name}`,
      approval: "draft",
    });
  }

  async generateLesson(
    worldModel: WorldModel,
    groundingRecords: GroundingRecord[],
  ): Promise<Lesson> {
    await pause();
    const approvedModel = worldModelSchema.parse(worldModel);

    if (approvedModel.approval !== "approved") {
      throw new Error("An approved world model is required.");
    }
    const [glasses, lamp, mug] = approvedModel.objects;
    if (!glasses || !lamp || !mug) {
      throw new Error("At least three approved objects are required.");
    }
    const all = [glasses.id, lamp.id, mug.id];

    return compileGroundedLesson(
      {
        questions: [
          {
            type: "object_recognition",
            targetObjectId: glasses.id,
            choiceObjectIds: all,
          },
          {
            type: "location_matching",
            targetObjectId: glasses.id,
            choiceObjectIds: [glasses.id, mug.id],
          },
          {
            type: "visual_search",
            targetObjectId: mug.id,
            choiceObjectIds: [mug.id, glasses.id],
          },
          {
            type: "object_recognition",
            targetObjectId: lamp.id,
            choiceObjectIds: all,
          },
          {
            type: "visual_recall",
            targetObjectId: glasses.id,
            choiceObjectIds: all,
          },
          {
            type: "association",
            targetObjectId: mug.id,
            choiceObjectIds: all,
          },
        ],
      },
      approvedModel,
      groundingRecords,
    );
  }
}
