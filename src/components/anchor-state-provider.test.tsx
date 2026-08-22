import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/actions/anchor-ai", () => ({
  analyzeRoomAction: vi.fn(),
  generateLessonAction: vi.fn(),
}));

import {
  AnchorStateProvider,
  useAnchorState,
} from "@/components/anchor-state-provider";
import { createDraftAnchorState } from "@/fixtures/demo";
import { anchorStorageKey } from "@/storage/browser-storage-adapter";

type ObservedState = {
  ready: boolean;
  worldModelApproval: string;
};

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

function StateObserver({ observations }: { observations: ObservedState[] }) {
  const { ready, state } = useAnchorState();
  observations.push({
    ready,
    worldModelApproval: state.worldModel.approval,
  });
  return null;
}

describe("AnchorStateProvider", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: new MemoryStorage(),
    });
  });

  it("does not mark fixture data ready before persisted approval state loads", async () => {
    window.localStorage.setItem(
      anchorStorageKey,
      JSON.stringify(createDraftAnchorState()),
    );
    const observations: ObservedState[] = [];

    render(
      <AnchorStateProvider>
        <StateObserver observations={observations} />
      </AnchorStateProvider>,
    );

    await waitFor(() => {
      expect(observations.at(-1)).toEqual({
        ready: true,
        worldModelApproval: "draft",
      });
    });

    expect(observations[0]).toEqual({
      ready: false,
      worldModelApproval: "approved",
    });
    expect(
      observations.some(
        (observation) =>
          observation.ready && observation.worldModelApproval === "approved",
      ),
    ).toBe(false);
  });
});
