import type { AiProvider, RoomAnalysis } from "@/providers/ai-provider";
import {
  guideSchema,
  lessonSchema,
  trustedPersonSchema,
  worldModelSchema,
  type GroundingRecord,
  type Guide,
  type Lesson,
  type TrustedPerson,
  type WorldModel,
} from "@/domain/anchor";
import { createPreparedAnchorState } from "@/fixtures/demo";

function pause(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 80));
}

export class FakeAiProvider implements AiProvider {
  async analyzeRoom(roomName: string): Promise<RoomAnalysis> {
    await pause();
    const fixture = createPreparedAnchorState();

    return {
      worldModel: worldModelSchema.parse({
        ...fixture.worldModel,
        roomName,
        approval: "draft",
        objects: fixture.worldModel.objects.map((object) => ({
          ...object,
          approval: "draft",
        })),
      }),
      groundingRecords: fixture.groundingRecords.map((record) => ({
        ...record,
        caregiverConfirmedAt: undefined,
        caregiverConfirmedBy: undefined,
        approval: "draft" as const,
      })),
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

    const approvedEvidence = new Set(
      groundingRecords
        .filter(({ approval }) => approval === "approved")
        .map(({ id }) => id),
    );
    const fixtureLesson = createPreparedAnchorState().lesson;
    const fixtureObjects = createPreparedAnchorState().worldModel.objects;

    if (!fixtureLesson) {
      throw new Error("The seeded lesson fixture is unavailable.");
    }

    for (const question of fixtureLesson.questions) {
      if (question.groundingRecordIds.some((id) => !approvedEvidence.has(id))) {
        throw new Error("All lesson evidence must be caregiver-approved.");
      }
    }

    const approvedObjects = new Map(
      approvedModel.objects.map((object) => [object.id, object]),
    );
    const fixtureObjectNames = new Map(
      fixtureObjects.map((object) => [object.name, object.id]),
    );
    const questions = fixtureLesson.questions.map((question) => {
      const object = approvedObjects.get(question.objectIds[0] ?? "");
      if (!object) {
        throw new Error(
          `Question ${question.id} has no approved target object.`,
        );
      }

      const locationAnswer = `On the ${object.location}`;
      const correctAnswer = ["location_matching", "visual_search"].includes(
        question.type,
      )
        ? locationAnswer
        : object.name;
      const choices = question.choices.map((choice) => {
        if (choice === question.correctAnswer) {
          return correctAnswer;
        }
        const objectId = fixtureObjectNames.get(choice);
        return objectId
          ? (approvedObjects.get(objectId)?.name ?? choice)
          : choice;
      });
      const prompt =
        question.type === "location_matching"
          ? `Where are the ${object.name.toLowerCase()}?`
          : question.type === "visual_search"
            ? `Can you find the ${object.name.toLowerCase()}?`
            : question.type === "visual_recall"
              ? `Which object did you see near the ${object.location}?`
              : question.prompt;

      return {
        ...question,
        prompt,
        correctAnswer,
        choices,
        verbalCue: `Look near the ${object.location}.`,
      };
    });

    return lessonSchema.parse({
      ...fixtureLesson,
      worldModelId: approvedModel.id,
      worldModelRevision: approvedModel.revision,
      questions,
      approval: "draft",
    });
  }
}
