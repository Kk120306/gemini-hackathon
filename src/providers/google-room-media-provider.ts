import { z } from "zod";

import { mediaValidationSchema, type MediaValidation } from "@/domain/anchor";
import { assertApprovedGrounding } from "@/domain/lesson-compiler";
import type {
  GeneratedImage,
  GenAiTransport,
  ImageGenAiTransport,
} from "@/providers/genai-transport";
import { ModelContractError } from "@/providers/google-genai-provider";
import {
  parseModelJson,
  roomImageInputSchema,
  simplifiedRoomProviderInputSchema,
  type RoomImageInput,
  type SimplifiedRoomProviderInput,
} from "@/providers/provider-contracts";
import type {
  RoomMediaProvider,
  SimplifiedRoomGeneration,
} from "@/providers/room-media-provider";

type RasterRoomImage = RoomImageInput & {
  mimeType: GeneratedImage["mimeType"];
};

const validationContract = `Return one JSON object with this exact shape:
{"targetObjectPresent":true,"targetLocationPreserved":true,"roomIdentityPreserved":true,"misleadingContentIntroduced":false,"safeToDisplay":true,"conciseReason":"short literal reason"}
Image 1 is the approved source room.
Image 2 is the candidate spatial interpretation.
Fail closed when uncertain.
Set safeToDisplay true only when the target and all caregiver-approved visible objects remain clearly present in their original image-plane locations, left-right and vertical relationships are preserved, the room and camera framing remain recognizably the same, visible depth is believable, and no unseen geometry, person, text, arrow, label, answer word, or misleading answer-like object was introduced.
Return JSON only.`;

function contractSummary(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues
      .slice(0, 8)
      .map((issue) => `${issue.path.join(".") || "response"}: ${issue.message}`)
      .join("; ");
  }
  return error instanceof Error ? error.message : "Unknown contract error.";
}

export class GoogleRoomMediaProvider implements RoomMediaProvider {
  constructor(
    private readonly imageTransport: ImageGenAiTransport,
    private readonly validationTransport: GenAiTransport,
    private readonly imageModel: string,
    private readonly validationModel: string,
  ) {}

  async generateSimplifiedRoom(
    input: SimplifiedRoomProviderInput,
  ): Promise<SimplifiedRoomGeneration> {
    const request = simplifiedRoomProviderInputSchema.parse(input);
    const worldModel = assertApprovedGrounding(
      request.worldModel,
      request.groundingRecords,
    );
    const target = worldModel.objects.find(
      ({ id }) => id === request.targetObjectId,
    );
    if (!target || target.approval !== "approved") {
      throw new Error(
        "Simplified-room generation requires an approved target.",
      );
    }
    if (target.sourceImageId !== request.sourceImage.fileName.split(":")[0]) {
      throw new Error("The target does not belong to the supplied room image.");
    }
    if (request.sourceImage.mimeType === "image/svg+xml") {
      throw new Error(
        "Live room simplification requires a raster source image.",
      );
    }
    const sourceImage: RasterRoomImage = {
      ...request.sourceImage,
      mimeType: request.sourceImage.mimeType,
    };

    const approvedObjects = worldModel.objects
      .map(
        (object) =>
          `- ${object.description}; ${object.location}; normalized image-plane box ${JSON.stringify(object.boundingBox)}`,
      )
      .join("\n");

    const generated = await this.imageTransport.generateImage({
      model: this.imageModel,
      prompt: `Transform this caregiver-approved image of ${JSON.stringify(worldModel.roomName)} into a realistic, perspective-preserving 2.5D spatial composition for an interactive room activity.
Make it feel like a high-quality architectural miniature render with convincing foreground, middle-ground, and background depth, soft physically plausible lighting, material texture, and clear separation between surfaces.
Preserve the exact source aspect ratio, camera framing, room layout, object coordinates, left-right relationships, vertical relationships, colors, important furniture, and every safety-relevant feature so image-plane interaction anchors stay aligned.
Keep the approved target ${JSON.stringify(target.description)} clearly visible in its original location, ${JSON.stringify(target.location)}.
Preserve every caregiver-approved visible object:
${approvedObjects}
Do not rotate to a new viewpoint, expose an unseen wall, infer room dimensions, or invent occluded geometry.
Do not add or remove people.
Do not add text, arrows, labels, answer words, or new objects.
Do not invent any personal detail, memory, routine, or relationship.`,
      images: [sourceImage],
    });
    const image: RasterRoomImage = {
      ...generated,
      fileName: `${request.sourceImage.fileName.split(":")[0]}:simplified-room`,
    };
    roomImageInputSchema.parse(image);
    const validation = await this.validateGeneratedScene({
      sourceImage,
      generatedImage: image,
      targetDescription: target.description,
      targetLocation: target.location,
      roomName: worldModel.roomName,
    });

    return {
      image,
      validation,
      generationModel: this.imageModel,
    };
  }

  private async validateGeneratedScene(input: {
    sourceImage: RasterRoomImage;
    generatedImage: RasterRoomImage;
    targetDescription: string;
    targetLocation: string;
    roomName: string;
  }): Promise<MediaValidation> {
    let previous = "";
    let failure: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryInstruction =
        attempt === 0
          ? ""
          : `\nThe previous response was structurally invalid: ${contractSummary(failure)}\nCorrect only the JSON structure. Previous response:\n${previous.slice(0, 8_000)}`;
      const prompt = `${validationContract}
Approved room: ${JSON.stringify(input.roomName)}.
Approved target: ${JSON.stringify(input.targetDescription)}.
Approved target location: ${JSON.stringify(input.targetLocation)}.${retryInstruction}`;
      previous = await this.validationTransport.generate({
        model: this.validationModel,
        prompt,
        images: [input.sourceImage, input.generatedImage],
      });
      try {
        return mediaValidationSchema.parse(parseModelJson(previous));
      } catch (error) {
        failure = error;
      }
    }

    throw new ModelContractError("Generated room validation", failure);
  }
}
