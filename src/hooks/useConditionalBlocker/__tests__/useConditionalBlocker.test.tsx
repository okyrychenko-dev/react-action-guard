import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useConditionalBlocker } from "..";
import { useUIBlockingStore } from "../../../store";

describe("useConditionalBlocker", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should block when condition returns true", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should not block when condition returns false", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => false,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should check condition based on state parameter", () => {
    const { rerender } = renderHook(
      ({ state }: { state: boolean }) =>
        useConditionalBlocker("test-blocker", {
          scope: "test",
          condition: (isOnline) => !isOnline,
          state,
          checkInterval: 1000,
        }),
      { initialProps: { state: true } }
    );

    const { isBlocked: isBlockedInitial } = useUIBlockingStore.getState();
    expect(isBlockedInitial("test")).toBe(false);

    rerender({ state: false });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should use default check interval of 1000ms", () => {
    const conditionFn = vi.fn(() => false);

    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: conditionFn,
      })
    );

    expect(conditionFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(conditionFn).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(conditionFn).toHaveBeenCalledTimes(3);
  });

  it("should use custom check interval", () => {
    const conditionFn = vi.fn(() => false);

    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: conditionFn,
        checkInterval: 500,
      })
    );

    expect(conditionFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(conditionFn).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(conditionFn).toHaveBeenCalledTimes(3);
  });

  it("should add blocker when condition changes from false to true", () => {
    let shouldBlock = false;

    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => shouldBlock,
        checkInterval: 100,
      })
    );

    const { isBlocked: isBlockedInitial } = useUIBlockingStore.getState();
    expect(isBlockedInitial("test")).toBe(false);

    shouldBlock = true;

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should remove blocker when condition changes from true to false", () => {
    let shouldBlock = true;

    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => shouldBlock,
        checkInterval: 100,
      })
    );

    const { isBlocked: isBlockedInitial } = useUIBlockingStore.getState();
    expect(isBlockedInitial("test")).toBe(true);

    shouldBlock = false;

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should cleanup on unmount", () => {
    const { unmount } = renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        checkInterval: 1000,
      })
    );

    const { isBlocked: isBlockedBefore } = useUIBlockingStore.getState();
    expect(isBlockedBefore("test")).toBe(true);

    unmount();

    const { isBlocked: isBlockedAfter } = useUIBlockingStore.getState();
    expect(isBlockedAfter("test")).toBe(false);
  });

  it("should handle multiple scopes", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: ["scope1", "scope2"],
        condition: () => true,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("scope1")).toBe(true);
    expect(isBlocked("scope2")).toBe(true);
  });

  it("should pass custom reason to blocker", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        reason: "Network offline",
        checkInterval: 1000,
      })
    );

    const { getBlockingInfo } = useUIBlockingStore.getState();
    const info = getBlockingInfo("test");
    expect(info[0]?.reason).toBe("Network offline");
  });

  it("should pass custom priority to blocker", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        priority: 100,
        checkInterval: 1000,
      })
    );

    const { getBlockingInfo } = useUIBlockingStore.getState();
    const info = getBlockingInfo("test");
    expect(info[0]?.priority).toBe(100);
  });

  it("should not add blocker multiple times if already blocking", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        checkInterval: 100,
      })
    );

    const { getBlockingInfo: getInfoInitial } = useUIBlockingStore.getState();
    expect(getInfoInitial("test")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { getBlockingInfo } = useUIBlockingStore.getState();
    expect(getBlockingInfo("test")).toHaveLength(1);
  });

  it("should handle generic state type", () => {
    interface NetworkState {
      online: boolean;
      speed: number;
    }

    const networkState: NetworkState = { online: false, speed: 0 };

    renderHook(() =>
      useConditionalBlocker<NetworkState>("test-blocker", {
        scope: "test",
        condition: (state) => !state?.online,
        state: networkState,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });
});
