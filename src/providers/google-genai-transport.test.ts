import type { GoogleGenAI } from "@google/genai";
import { describe, expect, it, vi } from "vitest";

import { GoogleGenAiTransport } from "@/providers/google-genai-transport";

vi.mock("server-only", () => ({}));

describe("Google Gen AI media transport", () => {
  it("uses Gemini TTS with a fixed synthetic voice and wraps PCM as WAV", async () => {
    const create = vi.fn(async (...args: unknown[]) => {
      expect(args).toHaveLength(2);
      return {
        output_audio: {
          data: Buffer.from([0, 0, 1, 0]).toString("base64"),
          mime_type: "audio/l16",
          sample_rate: 24_000,
          channels: 1,
        },
      };
    });
    const client = { interactions: { create } } as unknown as GoogleGenAI;
    const transport = new GoogleGenAiTransport("test-key", 1_000, client);

    const audio = await transport.generateSpeech({
      model: "gemini-3.1-flash-tts-preview",
      transcript: "Where is the reading lamp?",
      voice: "Sulafat",
    });

    expect(Buffer.from(audio.data, "base64").toString("ascii", 0, 4)).toBe(
      "RIFF",
    );
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "gemini-3.1-flash-tts-preview",
        response_format: {
          type: "audio",
          mime_type: "audio/wav",
          delivery: "inline",
        },
        generation_config: {
          speech_config: [{ voice: "Sulafat", language: "en" }],
        },
        store: false,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    const request = create.mock.calls[0]?.[0] as { input: string } | undefined;
    expect(request?.input).toContain("Where is the reading lamp?");
    expect(request?.input).toContain("Never imitate, clone");
  });

  it("sends an approved still through the documented image-to-video request", async () => {
    const videoData = Buffer.from("video").toString("base64");
    const create = vi.fn(async (...args: unknown[]) => {
      expect(args).toHaveLength(2);
      return {
        output_video: { data: videoData, mime_type: "video/mp4" },
      };
    });
    const client = { interactions: { create } } as unknown as GoogleGenAI;
    const transport = new GoogleGenAiTransport("test-key", 1_000, client);

    await expect(
      transport.generateVideo({
        model: "gemini-omni-flash-preview",
        prompt: "Animate this approved guide.",
        image: {
          data: "aW1hZ2U=",
          mimeType: "image/jpeg",
        },
      }),
    ).resolves.toEqual({ data: videoData, mimeType: "video/mp4" });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        response_format: {
          type: "video",
          aspect_ratio: "9:16",
          delivery: "inline",
        },
        generation_config: { video_config: { task: "image_to_video" } },
        store: false,
      }),
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });
});
