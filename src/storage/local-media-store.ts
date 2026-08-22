import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  GuideReferenceImageInput,
  RoomImageInput,
} from "@/providers/provider-contracts";
import type {
  GeneratedAudio,
  GeneratedVideo,
} from "@/providers/genai-transport";

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
const safeRasterFileName =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp)$/;
const safeVideoFileName =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.mp4$/;
const safeAudioFileName =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.wav$/;
const MAX_GUIDE_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_GUIDE_AUDIO_BYTES = 10 * 1024 * 1024;

export class LocalMediaStore {
  private readonly roomDirectory: string;
  private readonly guideReferenceDirectory: string;
  private readonly generatedRoomDirectory: string;
  private readonly generatedGuideDirectory: string;
  private readonly generatedGuideVideoDirectory: string;
  private readonly generatedGuideAudioDirectory: string;

  constructor(dataDirectory: string) {
    const rootDirectory = path.resolve(
      /* turbopackIgnore: true */ process.cwd(),
      dataDirectory,
    );
    this.roomDirectory = path.join(rootDirectory, "uploads", "room");
    this.guideReferenceDirectory = path.join(
      rootDirectory,
      "uploads",
      "guide-references",
    );
    this.generatedRoomDirectory = path.join(
      rootDirectory,
      "generated",
      "room-cues",
    );
    this.generatedGuideDirectory = path.join(
      rootDirectory,
      "generated",
      "guide",
    );
    this.generatedGuideVideoDirectory = path.join(
      rootDirectory,
      "generated",
      "guide-video",
    );
    this.generatedGuideAudioDirectory = path.join(
      rootDirectory,
      "generated",
      "guide-audio",
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

  async saveGuideReferenceImage(image: GuideReferenceImageInput) {
    const fileName = await this.saveImage(this.guideReferenceDirectory, image);
    return `/api/guide-reference-media/${fileName}`;
  }

  async readGuideReferenceImage(fileName: string) {
    return this.readImage(
      this.guideReferenceDirectory,
      fileName,
      safeRasterFileName,
    );
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

  async saveGeneratedGuideImage(image: GuideReferenceImageInput) {
    const fileName = await this.saveImage(this.generatedGuideDirectory, image);
    return `/api/generated-guide-media/${fileName}`;
  }

  async readGeneratedGuideImage(fileName: string) {
    return this.readImage(
      this.generatedGuideDirectory,
      fileName,
      safeRasterFileName,
    );
  }

  async saveGeneratedGuideVideo(video: GeneratedVideo) {
    const bytes = Buffer.from(video.data, "base64");
    if (
      bytes.length < 12 ||
      bytes.length > MAX_GUIDE_VIDEO_BYTES ||
      bytes.toString("ascii", 4, 8) !== "ftyp"
    ) {
      throw new Error("Generated guide video is not a valid bounded MP4.");
    }
    const fileName = `${randomUUID()}.mp4`;
    await mkdir(this.generatedGuideVideoDirectory, {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(
      path.join(
        /* turbopackIgnore: true */ this.generatedGuideVideoDirectory,
        fileName,
      ),
      bytes,
      { flag: "wx", mode: 0o600 },
    );
    return `/api/generated-guide-video/${fileName}`;
  }

  async readGeneratedGuideVideo(fileName: string) {
    if (!safeVideoFileName.test(fileName)) {
      return null;
    }
    try {
      return await readFile(
        path.join(
          /* turbopackIgnore: true */ this.generatedGuideVideoDirectory,
          fileName,
        ),
      );
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

  async saveGeneratedGuideAudio(audio: GeneratedAudio) {
    const bytes = Buffer.from(audio.data, "base64");
    if (
      bytes.length < 44 ||
      bytes.length > MAX_GUIDE_AUDIO_BYTES ||
      bytes.toString("ascii", 0, 4) !== "RIFF" ||
      bytes.toString("ascii", 8, 12) !== "WAVE"
    ) {
      throw new Error("Generated guide speech is not a valid bounded WAV.");
    }
    const fileName = `${randomUUID()}.wav`;
    await mkdir(this.generatedGuideAudioDirectory, {
      recursive: true,
      mode: 0o700,
    });
    await writeFile(
      path.join(
        /* turbopackIgnore: true */ this.generatedGuideAudioDirectory,
        fileName,
      ),
      bytes,
      { flag: "wx", mode: 0o600 },
    );
    return `/api/generated-guide-audio/${fileName}`;
  }

  async readGeneratedGuideAudio(fileName: string) {
    if (!safeAudioFileName.test(fileName)) {
      return null;
    }
    try {
      return await readFile(
        path.join(
          /* turbopackIgnore: true */ this.generatedGuideAudioDirectory,
          fileName,
        ),
      );
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

  private async saveImage(
    directory: string,
    image: RoomImageInput | GuideReferenceImageInput,
  ) {
    const extension = extensionByMimeType[image.mimeType];
    const fileName = `${randomUUID()}.${extension}`;
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await writeFile(
      path.join(/* turbopackIgnore: true */ directory, fileName),
      Buffer.from(image.data, "base64"),
      { flag: "wx", mode: 0o600 },
    );
    return fileName;
  }

  private async readImage(
    directory: string,
    fileName: string,
    safeFileName = safeRoomFileName,
  ) {
    if (!safeFileName.test(fileName)) {
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
