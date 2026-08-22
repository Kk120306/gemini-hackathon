import "server-only";

import { Buffer } from "node:buffer";

import { mediaValidationSchema } from "@/domain/anchor";
import { assertApprovedGrounding } from "@/domain/lesson-compiler";
import {
  roomImageInputSchema,
  simplifiedRoomProviderInputSchema,
  type SimplifiedRoomProviderInput,
} from "@/providers/provider-contracts";
import type {
  RoomMediaProvider,
  SimplifiedRoomGeneration,
} from "@/providers/room-media-provider";

export class FakeRoomMediaProvider implements RoomMediaProvider {
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

    await new Promise((resolve) => setTimeout(resolve, 180));
    const width = 1_200;
    const height = 780;
    const box = target.boundingBox;
    const x = Math.max(0, box.x * width - 28);
    const y = Math.max(0, box.y * height - 28);
    const boxWidth = Math.min(width - x, box.width * width + 56);
    const boxHeight = Math.min(height - y, box.height * height + 56);
    const source = `data:${request.sourceImage.mimeType};base64,${request.sourceImage.data}`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><defs><mask id="quiet"><rect width="${width}" height="${height}" fill="white"/><rect x="${x}" y="${y}" width="${boxWidth}" height="${boxHeight}" rx="28" fill="black"/></mask></defs><image href="${source}" width="${width}" height="${height}" preserveAspectRatio="none"/><rect width="${width}" height="${height}" fill="#f8f3e8" opacity=".64" mask="url(#quiet)"/></svg>`;

    return {
      image: roomImageInputSchema.parse({
        data: Buffer.from(svg).toString("base64"),
        mimeType: "image/svg+xml",
        fileName: `${request.sourceImage.fileName.split(":")[0]}:fixture-simplified-room`,
      }),
      validation: mediaValidationSchema.parse({
        targetObjectPresent: true,
        targetLocationPreserved: true,
        roomIdentityPreserved: true,
        misleadingContentIntroduced: false,
        safeToDisplay: true,
        conciseReason:
          "The prepared fixture preserves the approved room and target region.",
      }),
      generationModel: "fixture-simplifier-v1",
    };
  }
}
