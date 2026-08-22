import type { GuideValidation, TrustedPerson } from "@/domain/anchor";
import type { GuideReferenceImageInput } from "@/providers/provider-contracts";

export type GuideGenerationInput = {
  trustedPerson: TrustedPerson;
  referenceImages: GuideReferenceImageInput[];
};

export type GuideGeneration = {
  image: GuideReferenceImageInput;
  validation: GuideValidation;
  generationModel: string;
  validationModel: string;
};

export interface GuideMediaProvider {
  generateGuide(input: GuideGenerationInput): Promise<GuideGeneration>;
}
