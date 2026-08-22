import { anchorStateSchema, type AnchorState } from "@/domain/anchor";
import type { StorageAdapter } from "@/storage/storage-adapter";

export const anchorStorageKey = "anchor.fixture.state.v4";

export class BrowserAnchorStorage implements StorageAdapter<AnchorState> {
  constructor(private readonly providedStorage?: Storage) {}

  private get storage(): Storage {
    if (this.providedStorage) {
      return this.providedStorage;
    }
    if (typeof window === "undefined") {
      throw new Error(
        "Browser storage is unavailable during server rendering.",
      );
    }
    return window.localStorage;
  }

  load(): AnchorState | null {
    const stored = this.storage.getItem(anchorStorageKey);
    if (!stored) {
      return null;
    }

    let decoded: unknown;
    try {
      decoded = JSON.parse(stored);
    } catch {
      this.clear();
      return null;
    }

    const parsed = anchorStateSchema.safeParse(decoded);
    if (!parsed.success) {
      this.clear();
      return null;
    }

    return parsed.data;
  }

  save(value: AnchorState): void {
    const validated = anchorStateSchema.parse(value);
    this.storage.setItem(anchorStorageKey, JSON.stringify(validated));
  }

  clear(): void {
    this.storage.removeItem(anchorStorageKey);
  }
}
