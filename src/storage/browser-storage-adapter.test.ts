import { beforeEach, describe, expect, it } from "vitest";

import {
  anchorStorageKey,
  BrowserAnchorStorage,
} from "@/storage/browser-storage-adapter";
import { createDraftAnchorState } from "@/fixtures/demo";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("browser state storage", () => {
  let memory: MemoryStorage;

  beforeEach(() => {
    memory = new MemoryStorage();
  });

  it("round trips validated fixture state", () => {
    const storage = new BrowserAnchorStorage(memory);
    const state = createDraftAnchorState();
    storage.save(state);

    expect(storage.load()).toEqual(state);
  });

  it("clears malformed persisted data instead of rendering it", () => {
    const storage = new BrowserAnchorStorage(memory);
    memory.setItem(anchorStorageKey, "not-json");

    expect(storage.load()).toBeNull();
    expect(memory.getItem(anchorStorageKey)).toBeNull();
  });
});
