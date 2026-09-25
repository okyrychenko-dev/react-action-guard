import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { uiBlockingStoreApi, useUIBlockingStore } from "../uiBlockingStore.store";
import { createShallowStore } from "../uiBlockingStore.utils";

interface TestStoreState {
  count: number;
  label: string;
  increment: () => void;
}

interface TestSelectableStoreState {
  count: number;
  untouched: string;
  increment: () => void;
  setUntouched: (untouched: string) => void;
}

describe("uiBlockingStore.store", () => {
  beforeEach(() => {
    act(() => {
      uiBlockingStoreApi.getState().clearAllBlockers();
    });
  });

  afterEach(() => {
    act(() => {
      uiBlockingStoreApi.getState().clearAllBlockers();
    });
  });

  it("returns the entire store when used without a selector", () => {
    const { result } = renderHook(() => useUIBlockingStore());

    expect(result.current.activeBlockers).toBeInstanceOf(Map);
    expect(result.current.addBlocker).toBeTypeOf("function");
    expect(result.current.removeBlocker).toBeTypeOf("function");
  });

  it("supports selecting state from the wrapped store hook", () => {
    const { result } = renderHook(() => useUIBlockingStore((state) => state.activeBlockers.size));

    expect(result.current).toBe(0);

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("selected-blocker", { scope: "test" });
    });

    expect(result.current).toBe(1);
  });

  it("should publish immutable blocker snapshots synchronously", () => {
    const { result } = renderHook(() => useUIBlockingStore((state) => state.blockingSnapshot));
    const initial = result.current;
    const { addBlocker, updateBlocker, clearAllBlockers } = uiBlockingStoreApi.getState();

    act(() => addBlocker("snapshot", { scope: ["form"], reason: "Saving" }));

    expect(result.current).not.toBe(initial);
    expect(Object.isFrozen(result.current)).toBe(true);
    expect(Object.isFrozen(result.current[0])).toBe(true);
    expect(Object.isFrozen(result.current[0]?.scope)).toBe(true);
    expect(result.current[0]?.reason).toBe("Saving");

    act(() => updateBlocker("snapshot", { reason: "Saved" }));

    expect(result.current[0]?.reason).toBe("Saved");

    act(clearAllBlockers);

    expect(result.current).toEqual([]);
  });
});

describe("createShallowStore", () => {
  it("returns the full state when used without a selector", () => {
    const { useStore, useStoreApi } = createShallowStore<TestStoreState>((set) => ({
      count: 0,
      label: "initial",
      increment: () => set((state) => ({ count: state.count + 1 })),
    }));

    const { result } = renderHook(() => useStore());

    expect(result.current.count).toBe(0);
    expect(result.current.label).toBe("initial");

    act(() => {
      useStoreApi.getState().increment();
    });

    expect(result.current.count).toBe(1);
  });

  it("supports selectors with shallow comparison", () => {
    const { useStore, useStoreApi } = createShallowStore<TestSelectableStoreState>((set) => ({
      count: 0,
      untouched: "stable",
      increment: () => set((state) => ({ count: state.count + 1 })),
      setUntouched: (untouched: string) => set({ untouched }),
    }));

    const { result } = renderHook(() =>
      useStore((state) => ({
        count: state.count,
        increment: state.increment,
      }))
    );

    expect(result.current.count).toBe(0);

    act(() => {
      useStoreApi.getState().setUntouched("changed");
    });

    expect(result.current.count).toBe(0);

    act(() => {
      useStoreApi.getState().increment();
    });

    expect(result.current.count).toBe(1);
  });
});
