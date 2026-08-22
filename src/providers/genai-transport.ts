export type GenAiRequest = {
  model: string;
  prompt: string;
  image?: {
    data: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  };
};

export interface GenAiTransport {
  generate(request: GenAiRequest): Promise<string>;
}
