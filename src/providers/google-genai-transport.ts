import "server-only";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import type {
  GeneratedImage,
  GenAiRequest,
  GenAiTransport,
  ImageGenAiRequest,
  ImageGenAiTransport,
  VideoGenAiRequest,
  VideoGenAiTransport,
} from "@/providers/genai-transport";

export class GoogleGenAiTransport
  implements GenAiTransport, ImageGenAiTransport, VideoGenAiTransport
{
  private readonly client: GoogleGenAI;

  constructor(
    apiKey: string,
    private readonly timeoutMs: number,
  ) {
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(request: GenAiRequest): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const images = request.images ?? (request.image ? [request.image] : []);
      const media = [
        ...images.map((image) => ({
          inlineData: {
            data: image.data,
            mimeType: image.mimeType,
          },
        })),
        ...(request.video
          ? [
              {
                inlineData: {
                  data: request.video.data,
                  mimeType: request.video.mimeType,
                },
              },
            ]
          : []),
      ];
      const contents = media.length
        ? [...media, { text: request.prompt }]
        : request.prompt;
      const response = await this.client.models.generateContent({
        model: request.model,
        contents,
        config: {
          abortSignal: controller.signal,
          maxOutputTokens: 3_000,
          temperature: 0.1,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
          },
        },
      });
      const text = response.text?.trim();
      if (!text) {
        throw new Error("Gemma returned no text response.");
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateImage(request: ImageGenAiRequest): Promise<GeneratedImage> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await this.client.interactions.create(
        {
          model: request.model,
          input: [
            { type: "text", text: request.prompt },
            ...request.images.map(
              (image) =>
                ({
                  type: "image",
                  data: image.data,
                  mime_type: image.mimeType,
                }) as const,
            ),
          ],
          response_format: {
            type: "image",
            mime_type: "image/jpeg",
            image_size: "1K",
          },
        },
        { signal: controller.signal },
      );
      const image = response.output_image;
      if (!image?.data || !image.mime_type) {
        throw new Error("Gemini returned no generated image.");
      }
      if (!isSupportedGeneratedMimeType(image.mime_type)) {
        throw new Error("Gemini returned an unsupported image type.");
      }
      return { data: image.data, mimeType: image.mime_type };
    } finally {
      clearTimeout(timeout);
    }
  }

  async generateVideo(request: VideoGenAiRequest) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const interaction = await this.client.interactions.create(
        {
          model: request.model,
          input: [
            {
              type: "image",
              data: request.image.data,
              mime_type: request.image.mimeType,
            },
            { type: "text", text: request.prompt },
          ],
          response_format: {
            type: "video",
            aspect_ratio: "9:16",
          },
          generation_config: {
            video_config: {
              task: "image_to_video",
            },
          },
        },
        { signal: controller.signal },
      );
      const video = interaction.output_video;
      if (!video?.data || video.mime_type !== "video/mp4") {
        throw new Error("Gemini returned no inline MP4 guide video.");
      }
      return { data: video.data, mimeType: "video/mp4" as const };
    } finally {
      clearTimeout(timeout);
    }
  }
}

function isSupportedGeneratedMimeType(
  value: string,
): value is GeneratedImage["mimeType"] {
  return ["image/jpeg", "image/png", "image/webp"].includes(value);
}
