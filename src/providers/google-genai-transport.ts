import "server-only";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import type {
  GeneratedImage,
  GenAiRequest,
  GenAiTransport,
  ImageGenAiRequest,
  ImageGenAiTransport,
} from "@/providers/genai-transport";

export class GoogleGenAiTransport
  implements GenAiTransport, ImageGenAiTransport
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
      const contents = images.length
        ? [
            ...images.map((image) => ({
              inlineData: {
                data: image.data,
                mimeType: image.mimeType,
              },
            })),
            { text: request.prompt },
          ]
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
            {
              type: "image",
              data: request.image.data,
              mime_type: request.image.mimeType,
            },
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
}

function isSupportedGeneratedMimeType(
  value: string,
): value is GeneratedImage["mimeType"] {
  return ["image/jpeg", "image/png", "image/webp"].includes(value);
}
