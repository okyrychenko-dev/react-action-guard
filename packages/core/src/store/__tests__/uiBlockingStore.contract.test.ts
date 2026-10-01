import { describe, expect, it } from "vitest";
import { createStore } from "zustand";
import { createUIBlockingActions } from "../uiBlockingStore.actions";
import type { UIBlockingStore } from "../uiBlockingStore.types";

describe("blocking store contract", () => {
  it("should preserve lifecycle snapshots when external state is replaced", () => {
    const store = createStore<UIBlockingStore>(createUIBlockingActions);
    const initial = store.getState();

    initial.addBlocker("save", { scope: "form" });
    store.setState({ ...initial, blockingSnapshot: [] }, true);

    const { blockingSnapshot, getBlockingInfo } = store.getState();

    expect(blockingSnapshot.map(({ id }) => id)).toEqual(["save"]);
    expect(blockingSnapshot).toEqual(getBlockingInfo("form"));

    store.setState((state) => ({ ...state, blockingSnapshot: [] }), true);

    const { blockingSnapshot: replacedSnapshot } = store.getState();

    expect(replacedSnapshot).toBe(blockingSnapshot);
  });

  it("should avoid publishing when external updates return the current state", () => {
    const store = createStore<UIBlockingStore>(createUIBlockingActions);
    const publications: Array<UIBlockingStore> = [];
    const unsubscribe = store.subscribe((state) => publications.push(state));
    const initial = store.getState();

    store.setState((state) => state);
    store.setState((state) => state, true);

    expect(store.getState()).toBe(initial);
    expect(publications).toEqual([]);
    unsubscribe();
  });

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
