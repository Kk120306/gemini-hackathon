import { z } from "zod";

import {
  guideValidationSchema,
  trustedPersonSchema,
  type GuideValidation,
} from "@/domain/anchor";
import type {
  GenAiTransport,
  ImageGenAiTransport,
} from "@/providers/genai-transport";
import type {
  GuideGeneration,
  GuideGenerationInput,
  GuideMediaProvider,
} from "@/providers/guide-media-provider";
import { ModelContractError } from "@/providers/google-genai-provider";
import {
  guideReferenceImageInputSchema,
  parseModelJson,
} from "@/providers/provider-contracts";

const validationContract = `Return one JSON object with this exact shape:
{"recognizableLikeness":true,"consistentWithReferences":true,"lightlyStylized":true,"singlePersonOnly":true,"noCallOrMessagingUi":true,"safeToDisplay":true,"conciseReason":"short literal reason"}
The first images are caregiver-approved reference photographs of the same person.
The final image is the generated guide candidate.
Fail closed when uncertain.
Set safeToDisplay true only when the candidate is recognizably consistent with the references, is clearly and lightly illustrated rather than seamlessly photorealistic, contains one person only, and contains no text, logo, video-call frame, messaging interface, or claim that the person is live.
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

export class GoogleGuideMediaProvider implements GuideMediaProvider {
  constructor(
    private readonly imageTransport: ImageGenAiTransport,
    private readonly validationTransport: GenAiTransport,
    private readonly imageModel: string,
    private readonly validationModel: string,
  ) {}

  async generateGuide(input: GuideGenerationInput): Promise<GuideGeneration> {
    const trustedPerson = trustedPersonSchema.parse(input.trustedPerson);
    if (!trustedPerson.likenessConsent) {
      throw new Error("Likeness consent is required before guide generation.");
    }
    const referenceImages = input.referenceImages.map((image) =>
      guideReferenceImageInputSchema.parse(image),
    );
    if (referenceImages.length < 1 || referenceImages.length > 3) {
      throw new Error("Guide generation requires one to three references.");
    }

    const generated = await this.imageTransport.generateImage({
      model: this.imageModel,
      prompt: `Create one warm, lightly stylized head-and-shoulders guide portrait using only the caregiver-approved reference photographs.
Preserve the same person's recognizable facial structure, skin tone, hair, and age cues across the references.
Use a calm natural expression, simple everyday clothing, soft even light, and a plain warm neutral background.
Show one person only, centered with clear space around the face.
Make the illustration visibly stylized and honest, not seamless photorealism.
Do not add text, logos, uniforms, medical symbols, video-call framing, messaging UI, another person, or a background location.
Do not invent a memory, relationship, routine, possession, preference, or quote.`,
      images: referenceImages,
    });
    const image = guideReferenceImageInputSchema.parse({
      ...generated,
      fileName: `${trustedPerson.id}:guide-candidate`,
    });
    const validation = await this.validateCandidate({
      referenceImages,
      candidate: image,
    });

    return {
      image,
      validation,
      generationModel: this.imageModel,
      validationModel: this.validationModel,
    };
  }

  private async validateCandidate(input: {
    referenceImages: GuideGenerationInput["referenceImages"];
    candidate: GuideGenerationInput["referenceImages"][number];
  }): Promise<GuideValidation> {
    let previous = "";
    let failure: unknown;

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const retryInstruction =
        attempt === 0
          ? ""
          : `\nThe previous response was structurally invalid: ${contractSummary(failure)}\nCorrect only the JSON structure. Previous response:\n${previous.slice(0, 8_000)}`;
      previous = await this.validationTransport.generate({
        model: this.validationModel,
        prompt: `${validationContract}${retryInstruction}`,
        images: [...input.referenceImages, input.candidate],
      });
      try {
        return guideValidationSchema.parse(parseModelJson(previous));
      } catch (error) {
        failure = error;
      }
    }

    throw new ModelContractError("Generated guide validation", failure);
  }
}
