import type { MediaValidation } from "@/domain/anchor";
import type {
  RoomImageInput,
  SimplifiedRoomProviderInput,
} from "@/providers/provider-contracts";

export type SimplifiedRoomGeneration = {
  image: RoomImageInput;
  validation: MediaValidation;
  generationModel: string;
};

export interface RoomMediaProvider {
  generateSimplifiedRoom(
    input: SimplifiedRoomProviderInput,
  ): Promise<SimplifiedRoomGeneration>;
}
