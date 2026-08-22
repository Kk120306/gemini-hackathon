import { describe, expect, it } from "vitest";

import { anchorReducer } from "@/domain/anchor-reducer";
import {
  createDraftAnchorState,
  createPreparedAnchorState,
} from "@/fixtures/demo";

describe("ANCHOR state reducer", () => {
  it("preserves the model observation after a caregiver correction", () => {
    const draft = createDraftAnchorState();
    const observation = draft.groundingRecords[0]?.modelObservation;
    const edited = anchorReducer(draft, {
      type: "update_object",
      objectId: "object-glasses",
      name: "Reading glasses",
      location: "reading table",
    });
    const approved = anchorReducer(edited, {
      type: "approve_world_model",
      confirmedAt: "2026-08-22T10:00:00.000Z",
    });

    expect(approved.worldModel.revision).toBe(draft.worldModel.revision + 1);
    expect(approved.groundingRecords[0]?.modelObservation).toBe(observation);
    expect(approved.groundingRecords[0]?.caregiverValue).toBe(
      "Reading glasses on the reading table",
    );
    expect(approved.groundingRecords[0]?.approval).toBe("approved");
  });

  it("advances cues for help or an incorrect answer without recording a score", () => {
    let state = createPreparedAnchorState();
    state = anchorReducer(state, { type: "start_session" });
    state = anchorReducer(state, { type: "answer", correct: false });
    expect(state.session.cueLevel).toBe("verbal");
    state = anchorReducer(state, { type: "help" });
    expect(state.session.cueLevel).toBe("focus");
    expect("score" in state.session).toBe(false);
  });
});
