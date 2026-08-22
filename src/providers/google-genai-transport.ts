import "server-only";

import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import type { GenAiRequest, GenAiTransport } from "@/providers/genai-transport";

export class GoogleGenAiTransport implements GenAiTransport {
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
      const contents = request.image
        ? [
            {
              inlineData: {
                data: request.image.data,
                mimeType: request.image.mimeType,
              },
            },
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
}
