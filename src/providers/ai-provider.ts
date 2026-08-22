import type {
  GroundingRecord,
  Guide,
  Lesson,
  TrustedPerson,
  WorldModel,
} from "@/domain/anchor";
import type { RoomAnalysisInput } from "@/providers/provider-contracts";

export type RoomAnalysis = {
  worldModel: WorldModel;
  groundingRecords: GroundingRecord[];
  analysisSource: "fixture" | "gemma";
  imageSrc?: string;
};

export interface AiProvider {
  analyzeRoom(input: RoomAnalysisInput): Promise<RoomAnalysis>;
  generateGuide(trustedPerson: TrustedPerson): Promise<Guide>;
  generateLesson(
    worldModel: WorldModel,
    groundingRecords: GroundingRecord[],
  ): Promise<Lesson>;
}
