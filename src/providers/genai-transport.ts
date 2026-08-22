export type GenAiRequest = {
  model: string;
  prompt: string;
  image?: {
    data: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  };
  images?: Array<{
    data: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  }>;
  video?: {
    data: string;
    mimeType: "video/mp4";
  };
};

export interface GenAiTransport {
  generate(request: GenAiRequest): Promise<string>;
}

export type ImageGenAiRequest = {
  model: string;
  prompt: string;
  images: Array<{
    data: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  }>;
};

export type GeneratedImage = {
  data: string;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
};

export interface ImageGenAiTransport {
  generateImage(request: ImageGenAiRequest): Promise<GeneratedImage>;
}

export type VideoGenAiRequest = {
  model: string;
  prompt: string;
  image: {
    data: string;
    mimeType: "image/jpeg" | "image/png" | "image/webp";
  };
};

export type GeneratedVideo = {
  data: string;
  mimeType: "video/mp4";
};

export interface VideoGenAiTransport {
  generateVideo(request: VideoGenAiRequest): Promise<GeneratedVideo>;
}
