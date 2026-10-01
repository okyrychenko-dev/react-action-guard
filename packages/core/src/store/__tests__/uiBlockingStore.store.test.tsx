import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { uiBlockingStoreApi, useUIBlockingStore } from "../uiBlockingStore.store";

describe("uiBlockingStore.store", () => {
  beforeEach(() => {
    act(() => {
      const { clearAllBlockers } = uiBlockingStoreApi.getState();

      clearAllBlockers();
    });
  });

  afterEach(() => {
    act(() => {
      const { clearAllBlockers } = uiBlockingStoreApi.getState();

      clearAllBlockers();
    });
  });

  it("should return the entire store when used without a selector", () => {
    const { result } = renderHook(() => useUIBlockingStore());

    expect(result.current.blockingSnapshot).toEqual([]);
    expect(result.current.addBlocker).toBeTypeOf("function");
    expect(result.current.removeBlocker).toBeTypeOf("function");
  });

  it("should support selecting state from the wrapped store hook", () => {
    const { result } = renderHook(() =>
      useUIBlockingStore((state) => state.blockingSnapshot.length)
    );

    expect(result.current).toBe(0);

    act(() => {
      const { addBlocker } = uiBlockingStoreApi.getState();

      addBlocker("selected-blocker", { scope: "test" });
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
