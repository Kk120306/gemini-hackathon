import type {
  GroundingRecord,
  Guide,
  Lesson,
  TrustedPerson,
  WorldModel,
} from "@/domain/anchor";

export type RoomAnalysis = {
  worldModel: WorldModel;
  groundingRecords: GroundingRecord[];
};

export interface AiProvider {
  analyzeRoom(roomName: string): Promise<RoomAnalysis>;
  generateGuide(trustedPerson: TrustedPerson): Promise<Guide>;
  generateLesson(
    worldModel: WorldModel,
    groundingRecords: GroundingRecord[],
  ): Promise<Lesson>;
}
