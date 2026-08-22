import { describe, expect, it } from "vitest";

import { validateGroundedLesson } from "@/domain/validation";
import { createPreparedAnchorState } from "@/fixtures/demo";
import type { GenAiRequest, GenAiTransport } from "@/providers/genai-transport";
import {
  GoogleGenAiProvider,
  ModelContractError,
} from "@/providers/google-genai-provider";
import {
  parseModelJson,
  type RoomAnalysisInput,
} from "@/providers/provider-contracts";

const validRoomProposal = {
  roomNameSuggestion: "Bedroom",
  objects: [
    {
      name: "Reading glasses",
      location: "bedside table",
      description: "Dark blue reading glasses",
      sourceImageIndex: 0,
      boundingBox: { x: 0.7, y: 0.5, width: 0.15, height: 0.1 },
      confidence: "high",
    },
    {
      name: "Lamp",
      location: "bedside table",
      description: "Cream lamp with a green base",
      sourceImageIndex: 0,
      boundingBox: { x: 0.7, y: 0.2, width: 0.15, height: 0.3 },
      confidence: "high",
    },
    {
      name: "Blue mug",
      location: "dresser",
      description: "Small blue ceramic mug",
      sourceImageIndex: 0,
      boundingBox: { x: 0.1, y: 0.5, width: 0.1, height: 0.2 },
      confidence: "medium",
    },
  ],
};

const roomInput: RoomAnalysisInput = {
  roomId: "room-test",
  roomName: "Bedroom",
  image: {
    data: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
    mimeType: "image/png",
    fileName: "room.png",
  },
};

class CapturedTransport implements GenAiTransport {
  readonly requests: GenAiRequest[] = [];

  constructor(private readonly responses: string[]) {}

  async generate(request: GenAiRequest) {
    this.requests.push(request);
    const response = this.responses.shift();
    if (!response) {
      throw new Error("No captured response remains.");
    }
    return response;
  }
}

function validLessonPlan() {
  const state = createPreparedAnchorState();
  const [glasses, lamp, mug] = state.worldModel.objects;
  if (!glasses || !lamp || !mug) {
    throw new Error("Prepared world objects are unavailable.");
  }
  const all = [glasses.id, lamp.id, mug.id];
  return {
    questions: [
      {
        type: "object_recognition",
        targetObjectId: glasses.id,
        choiceObjectIds: all,
      },
      {
        type: "location_matching",
        targetObjectId: mug.id,
        choiceObjectIds: [mug.id, glasses.id],
      },
      {
        type: "visual_search",
        targetObjectId: lamp.id,
        choiceObjectIds: all,
      },
      {
        type: "object_recognition",
        targetObjectId: mug.id,
        choiceObjectIds: all,
      },
      {
        type: "visual_recall",
        targetObjectId: lamp.id,
        choiceObjectIds: all,
      },
      {
        type: "association",
        targetObjectId: glasses.id,
        choiceObjectIds: all,
      },
    ],
  };
}

describe("GoogleGenAiProvider contracts", () => {
  it("accepts markdown-wrapped JSON but stores literal room evidence only", async () => {
    const transport = new CapturedTransport([
      `\n\`\`\`json\n${JSON.stringify(validRoomProposal)}\n\`\`\``,
    ]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    const result = await provider.analyzeRoom(roomInput);

    expect(result.analysisSource).toBe("gemma");
    expect(result.worldModel.objects).toHaveLength(3);
    expect(result.groundingRecords[0]?.modelObservation).toBe(
      "The image shows dark blue reading glasses on the bedside table.",
    );
    expect(result.groundingRecords[0]?.approval).toBe("draft");
    expect(transport.requests[0]?.image?.mimeType).toBe("image/png");
  });

  it("uses exactly one repair attempt after malformed output", async () => {
    const transport = new CapturedTransport([
      "not json",
      JSON.stringify(validRoomProposal),
    ]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    await expect(provider.analyzeRoom(roomInput)).resolves.toBeDefined();
    expect(transport.requests).toHaveLength(2);
    expect(transport.requests[1]?.prompt).toContain(
      "The previous response was invalid",
    );
  });

  it("rejects over-inferred room claims after the repair budget", async () => {
    const inferred = structuredClone(validRoomProposal);
    inferred.objects[0]!.description = "Her favorite reading glasses";
    const response = JSON.stringify(inferred);
    const transport = new CapturedTransport([response, response]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    await expect(provider.analyzeRoom(roomInput)).rejects.toBeInstanceOf(
      ModelContractError,
    );
    expect(transport.requests).toHaveLength(2);
  });

  it("rejects bounding boxes outside the source image", async () => {
    const invalid = structuredClone(validRoomProposal);
    invalid.objects[0]!.boundingBox = {
      x: 0.9,
      y: 0.5,
      width: 0.2,
      height: 0.1,
    };
    const response = JSON.stringify(invalid);
    const provider = new GoogleGenAiProvider(
      new CapturedTransport([response, response]),
      "gemma-test",
    );

    await expect(provider.analyzeRoom(roomInput)).rejects.toBeInstanceOf(
      ModelContractError,
    );
  });

  it("rejects image bytes that do not match the declared type", async () => {
    const provider = new GoogleGenAiProvider(
      new CapturedTransport([JSON.stringify(validRoomProposal)]),
      "gemma-test",
    );

    await expect(
      provider.analyzeRoom({
        ...roomInput,
        image: { ...roomInput.image, data: "bm90IGEgcG5n" },
      }),
    ).rejects.toThrow(/declared image type/);
  });

  it("compiles a six-question plan into fully grounded patient language", async () => {
    const state = createPreparedAnchorState();
    const transport = new CapturedTransport([
      JSON.stringify(validLessonPlan()),
    ]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    const lesson = await provider.generateLesson(
      state.worldModel,
      state.groundingRecords,
    );

    expect(lesson.questions).toHaveLength(6);
    expect(
      lesson.questions.filter(({ type }) => type === "visual_recall"),
    ).toHaveLength(1);
    expect(
      lesson.questions.filter(({ type }) => type === "association"),
    ).toHaveLength(1);
    expect(() =>
      validateGroundedLesson(lesson, state.worldModel, state.groundingRecords),
    ).not.toThrow();
  });

  it("rejects an ungrounded lesson plan after one repair attempt", async () => {
    const state = createPreparedAnchorState();
    const ungrounded = validLessonPlan();
    ungrounded.questions[0]!.targetObjectId = "object-invented";
    ungrounded.questions[0]!.choiceObjectIds[0] = "object-invented";
    const response = JSON.stringify(ungrounded);
    const transport = new CapturedTransport([response, response]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    await expect(
      provider.generateLesson(state.worldModel, state.groundingRecords),
    ).rejects.toBeInstanceOf(ModelContractError);
    expect(transport.requests).toHaveLength(2);
  });

  it("rejects a repetitive plan that overuses one target", async () => {
    const state = createPreparedAnchorState();
    const repetitive = validLessonPlan();
    const glassesId = state.worldModel.objects[0]?.id;
    if (!glassesId) {
      throw new Error("Prepared glasses are unavailable.");
    }
    repetitive.questions = repetitive.questions.map((question) => ({
      ...question,
      targetObjectId: glassesId,
      choiceObjectIds: [
        glassesId,
        ...question.choiceObjectIds.filter((id) => id !== glassesId),
      ].slice(0, 3),
    }));
    const response = JSON.stringify(repetitive);
    const transport = new CapturedTransport([response, response]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    await expect(
      provider.generateLesson(state.worldModel, state.groundingRecords),
    ).rejects.toBeInstanceOf(ModelContractError);
    expect(transport.requests[1]?.prompt).toContain(
      "No object may be the target more than twice",
    );
  });

  it("rejects unapproved evidence before making a model call", async () => {
    const state = createPreparedAnchorState();
    state.worldModel.approval = "draft";
    const transport = new CapturedTransport([]);
    const provider = new GoogleGenAiProvider(transport, "gemma-test");

    await expect(
      provider.generateLesson(state.worldModel, state.groundingRecords),
    ).rejects.toThrow(/approved world model/);
    expect(transport.requests).toHaveLength(0);
  });

  it("blocks altered patient text even when its identifiers are valid", async () => {
    const state = createPreparedAnchorState();
    const provider = new GoogleGenAiProvider(
      new CapturedTransport([JSON.stringify(validLessonPlan())]),
      "gemma-test",
    );
    const lesson = await provider.generateLesson(
      state.worldModel,
      state.groundingRecords,
    );
    lesson.questions[0]!.verbalCue =
      "Remember when your daughter put it there.";

    expect(() =>
      validateGroundedLesson(lesson, state.worldModel, state.groundingRecords),
    ).toThrow(/ungrounded content/);
  });
});

describe("parseModelJson", () => {
  it("extracts a JSON object from concise surrounding text", () => {
    expect(parseModelJson('Result: {"objects":[]}')).toEqual({ objects: [] });
  });
});
