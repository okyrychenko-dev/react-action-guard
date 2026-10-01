import { describe, expect, it } from "vitest";
import { createStore } from "zustand";
import { createUIBlockingActions } from "../uiBlockingStore.actions";
import type { UIBlockingStore } from "../uiBlockingStore.types";

describe("blocking store contract", () => {
  it("should expose immutable projections and lifecycle operations without implementation state", () => {
    const store = createStore<UIBlockingStore>(createUIBlockingActions);
    const state = store.getState();

    for (const obsolete of [
      "activeBlockers",
      "middlewares",
      "registerMiddleware",
      "unregisterMiddleware",
      "runMiddlewares",
    ]) {
      expect(state).not.toHaveProperty(obsolete);
    }
    state.addBlocker("save", { scope: "form" });

    const { blockingSnapshot } = store.getState();

    expect(blockingSnapshot.map(({ id }) => id)).toEqual(["save"]);
    expect(Object.isFrozen(blockingSnapshot)).toBe(true);
    state.clearAllBlockers();
  });
  it("should keep lifecycle reads and projections synchronized after a reentrant external update", () => {
    const store = createStore<UIBlockingStore>(createUIBlockingActions);

    store.setState(({ addBlocker }) => {
      addBlocker("nested", { scope: "form" });

      return { blockingSnapshot: [] };
    });

    const { blockingSnapshot, getBlockingInfo } = store.getState();

    expect(blockingSnapshot).toEqual(getBlockingInfo("form"));
    expect(blockingSnapshot.map(({ id }) => id)).toEqual(["nested"]);
  });
});
