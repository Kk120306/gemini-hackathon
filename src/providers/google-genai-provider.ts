import { z } from "zod";

import {
  groundingRecordSchema,
  worldModelSchema,
  type GroundingRecord,
  type Guide,
  type Lesson,
  type WorldModel,
} from "@/domain/anchor";
import {
  assertApprovedGrounding,
  compileGroundedLesson,
} from "@/domain/lesson-compiler";
import type { AiProvider, RoomAnalysis } from "@/providers/ai-provider";
import type { GenAiTransport } from "@/providers/genai-transport";
import {
  lessonPlanSchema,
  parseModelJson,
  roomAnalysisInputSchema,
  roomProposalSchema,
  type RoomAnalysisInput,
} from "@/providers/provider-contracts";

function slug(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "object"
  );
}

function validationSummary(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues
      .slice(0, 8)
      .map((issue) => `${issue.path.join(".") || "response"}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : "Unknown contract error.";
}

const roomContract = `Return one JSON object with this exact shape:
{"roomNameSuggestion":"string","objects":[{"name":"specific visible object","location":"literal visible location","description":"literal color, material, or shape only","sourceImageIndex":0,"boundingBox":{"x":0.0,"y":0.0,"width":0.0,"height":0.0},"confidence":"low|medium|high"}]}
Detect the actual pixels in this image. Do not use example, fixture, bedroom, or placeholder objects.
Return 6 to 10 distinct, useful objects when that many are clearly visible. If the image genuinely contains fewer, return only supported objects, with an absolute minimum of 3.
Prefer stable, question-ready objects that a person can point to, such as furniture, electronics, containers, and strongly visible personal items. Exclude vague regions, reflections, shadows, tiny clutter, partially hidden items, and duplicates.
Each location must name the literal visible support surface or image area, such as "on the desk below the monitor" or "in front of the window".
Each description must contain discriminating pixel evidence, including visible color, material, form, or markings, without guessing function or ownership.
Bounding-box values are normalized from 0 through 1. x and y mark the tight upper-left corner. width and height must tightly enclose only that object, stay inside the image, and must not describe a broad furniture region when the named object is smaller.
Use high confidence only when the object identity and full box are unambiguous. Omit uncertain objects instead of inventing them.
Do not infer ownership, relationships, memories, habits, routines, preferences, emotions, or significance.
Return JSON only.`;

function lessonContract(worldModel: WorldModel) {
  const approvedObjects = worldModel.objects.map((object) => ({
    id: object.id,
    name: object.name,
    location: object.location,
    description: object.description,
    groundingRecordId: object.groundingRecordId,
  }));

  return `Create a six-question activity plan using only the approved objects below.
Return one JSON object with this exact shape:
{"questions":[{"type":"object_recognition|location_matching|visual_search|visual_recall|association","targetObjectId":"approved object id","choiceObjectIds":["2 or 3 distinct approved object ids including the target exactly once"]}]}
Use exactly one visual_recall question and exactly one association question.
Use object_recognition, location_matching, or visual_search for the other four questions.
Distribute the six targets across at least three approved objects, and never target one object more than twice.
Choose three objects whenever the approved world model has three or more objects so the room can provide two selectable anchors plus a visual landmark.
For association, prefer a target that shares an approved location with another object.
For visual_search, prefer targets and alternatives with clearly separated bounding boxes.
Do not add facts, answer text, prompts, cues, memories, routines, or unapproved identifiers.
Approved objects:
${JSON.stringify(approvedObjects)}
Return JSON only.`;
}

export class ModelContractError extends Error {
  constructor(operation: string, cause: unknown) {
    super(`${operation} failed model validation after one repair attempt.`);
    this.name = "ModelContractError";
    this.cause = cause;
  }
}

export class GoogleGenAiProvider implements AiProvider {
  constructor(
    private readonly transport: GenAiTransport,
    private readonly model: string,
    private readonly analysisSource: RoomAnalysis["analysisSource"] = "gemma",
  ) {}

  private async generateValidated<T>(input: {
    operation: string;
    prompt: string;
    schema: z.ZodType<T>;
    image?: RoomAnalysisInput["image"];
    validate?: (value: T) => T;
  }): Promise<T> {
    let previous = "";
    let failure: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const prompt =
        attempt === 0
          ? input.prompt
          : `${input.prompt}\nThe previous response was invalid: ${validationSummary(failure)}\nCorrect the response without adding any new facts. Previous response:\n${previous.slice(0, 20_000)}`;
      previous = await this.transport.generate({
        model: this.model,
        prompt,
        ...(input.image && input.image.mimeType !== "image/svg+xml"
          ? {
              image: {
                data: input.image.data,
                mimeType: input.image.mimeType,
              },
            }
          : {}),
      });
      try {
        const parsed = input.schema.parse(parseModelJson(previous));
        return input.validate ? input.validate(parsed) : parsed;
      } catch (error) {
        failure = error;
      }
    }

    throw new ModelContractError(input.operation, failure);
  }

  async analyzeRoom(input: RoomAnalysisInput): Promise<RoomAnalysis> {
    const request = roomAnalysisInputSchema.parse(input);
    if (request.image.mimeType === "image/svg+xml") {
      throw new Error(
        "Live Gemma analysis requires a JPG, PNG, or WebP image.",
      );
    }

    const proposal = await this.generateValidated({
      operation: "Room analysis",
      prompt: `Analyze this caregiver-supplied image of a room named ${JSON.stringify(request.roomName)}.\n${roomContract}`,
      schema: roomProposalSchema,
      image: request.image,
    });
    const usedIds = new Set<string>();
    const objects = proposal.objects.map((object, index) => {
      const baseId = `${request.roomId}-${slug(object.name)}`;
      const objectId = usedIds.has(baseId) ? `${baseId}-${index + 1}` : baseId;
      usedIds.add(objectId);
      const groundingRecordId = `grounding-${objectId}`;
      return {
        id: objectId,
        name: object.name,
        location: object.location,
        description: object.description,
        sourceImageId: request.roomId,
        groundingRecordId,
        boundingBox: object.boundingBox,
        detectionConfidence: object.confidence,
        approval: "draft" as const,
      };
    });
    const groundingRecords = proposal.objects.map((object, index) => {
      const worldObject = objects[index];
      if (!worldObject) {
        throw new Error("Room proposal conversion failed.");
      }
      return groundingRecordSchema.parse({
        id: worldObject.groundingRecordId,
        sourceType: "visual",
        sourceImageId: request.roomId,
        sourceCrop: object.boundingBox,
        modelObservation: `The image shows ${object.description.toLowerCase()} on the ${object.location}.`,
        caregiverValue: `${object.name} on the ${object.location}`,
        approval: "draft",
      });
    });

    return {
      worldModel: worldModelSchema.parse({
        id: `world-${request.roomId}`,
        roomName: request.roomName,
        revision: 1,
        objects,
        approval: "draft",
      }),
      groundingRecords,
      analysisSource: this.analysisSource,
    };
  }

  async generateLesson(
    worldModel: WorldModel,
    groundingRecords: GroundingRecord[],
  ): Promise<Lesson> {
    const approvedWorldModel = assertApprovedGrounding(
      worldModel,
      groundingRecords,
    );
    const prompt = lessonContract(approvedWorldModel);
    const plan = await this.generateValidated({
      operation: "Lesson generation",
      prompt,
      schema: lessonPlanSchema,
      validate: (candidate) => {
        compileGroundedLesson(candidate, approvedWorldModel, groundingRecords);
        return candidate;
      },
    });
    return compileGroundedLesson(plan, approvedWorldModel, groundingRecords);
  }

  async generateGuide(): Promise<Guide> {
    throw new Error("Live guide generation is implemented in Phase 4.");
  }
}
