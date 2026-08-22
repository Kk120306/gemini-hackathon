import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { RoomImageInput } from "@/providers/provider-contracts";

const extensionByMimeType = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
} as const;

const mimeTypeByExtension = {
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
} as const;

const safeRoomFileName =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|svg|webp)$/;

export class LocalMediaStore {
  private readonly roomDirectory: string;
  private readonly generatedRoomDirectory: string;

  constructor(dataDirectory: string) {
    const rootDirectory = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      dataDirectory,
    );
    this.roomDirectory = path.join(rootDirectory, "uploads", "room");
    this.generatedRoomDirectory = path.join(
      rootDirectory,
      "generated",
      "room-cues",
    );
  }

  async saveRoomImage(image: RoomImageInput) {
    const extension = extensionByMimeType[image.mimeType];
    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.roomDirectory, { recursive: true, mode: 0o700 });
    await writeFile(
      path.join(/* turbopackIgnore: true */ this.roomDirectory, fileName),
      Buffer.from(image.data, "base64"),
      { flag: "wx", mode: 0o600 },
    );
    return `/api/room-media/${fileName}`;
  }

  async readRoomImage(fileName: string) {
    return this.readImage(this.roomDirectory, fileName);
  }

  async saveGeneratedRoomImage(image: RoomImageInput) {
    const extension = extensionByMimeType[image.mimeType];
    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(this.generatedRoomDirectory, {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(
      path.join(
        /* turbopackIgnore: true */ this.generatedRoomDirectory,
        fileName,
      ),
      Buffer.from(image.data, "base64"),
      { flag: "wx", mode: 0o600 },
    );
    return `/api/generated-room-media/${fileName}`;
  }

  async readGeneratedRoomImage(fileName: string) {
    return this.readImage(this.generatedRoomDirectory, fileName);
  }

  private async readImage(directory: string, fileName: string) {
    if (!safeRoomFileName.test(fileName)) {
      return null;
    }
    const extension = fileName.split(".").at(-1) as
      keyof typeof mimeTypeByExtension | undefined;
    if (!extension) {
      return null;
    }

    try {
      return {
        bytes: await readFile(
          path.join(/* turbopackIgnore: true */ directory, fileName),
        ),
        mimeType: mimeTypeByExtension[extension],
      };
    } catch (error) {
      if (
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ) {
        return null;
      }
      throw error;
    }
  }
}
