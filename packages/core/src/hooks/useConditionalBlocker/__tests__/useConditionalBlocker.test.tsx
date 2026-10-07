import { act, renderHook } from "@testing-library/react";
import { type PropsWithChildren, type ReactNode, StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIBlockingProvider, useUIBlockingContext } from "../../../context";
import { uiBlockingStoreApi } from "../../../store";
import { useConditionalBlocker } from "../useConditionalBlocker";
import type { ConditionalBlockerConfig } from "../useConditionalBlocker.types";

interface IdentityProps {
  id: string;
}

interface StateProps {
  state: boolean;
}

interface IntervalProps {
  checkInterval: number;
}

describe("useConditionalBlocker", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should replace current configuration while the condition stays true", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const initialProps: ConditionalBlockerConfig = {
      scope: "old",
      condition: () => true,
      reason: "Old",
      priority: 42,
      timestamp: 123,
    };
    const { result, rerender } = renderHook(
      (config: ConditionalBlockerConfig) => {
        useConditionalBlocker("current", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );

    rerender({ scope: "new", condition: () => true });

    const { isBlocked, getBlockingInfo } = result.current.getState();

    expect(isBlocked("old")).toBe(false);
    expect(getBlockingInfo("new")).toHaveLength(1);
    expect(getBlockingInfo("new")[0]).toMatchObject({ reason: "Unknown", priority: 0 });
    expect(getBlockingInfo("new")[0]?.timestamp).toBe(123);
  });

  it("should retain the deadline and finish an episode until the condition becomes false", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    let active = true;
    const oldCallback = vi.fn();
    const currentCallback = vi.fn();
    const initialProps: ConditionalBlockerConfig = {
      scope: "old",
      condition: () => active,
      checkInterval: 100,
      timeout: 500,
      onTimeout: oldCallback,
      timestamp: 123,
    };
    const { result, rerender } = renderHook(
      (config: ConditionalBlockerConfig) => {
        useConditionalBlocker("episode", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );
    const { isBlocked, getBlockingInfo } = result.current.getState();

    expect(getBlockingInfo("old")[0]?.timestamp).toBe(123);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({
      ...initialProps,
      scope: "new",
      reason: "Current",
      priority: 9,
      onTimeout: currentCallback,
      checkInterval: 50,
    });
    expect(isBlocked("old")).toBe(false);
    expect(getBlockingInfo("new")[0]).toMatchObject({ reason: "Current", priority: 9 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(isBlocked("new")).toBe(false);
    expect(oldCallback).not.toHaveBeenCalled();
    expect(currentCallback).toHaveBeenCalledExactlyOnceWith("episode");
    rerender({ ...initialProps, scope: "after", onTimeout: currentCallback });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(isBlocked("after")).toBe(false);
    expect(currentCallback).toHaveBeenCalledTimes(1);
    active = false;
    act(() => {
      vi.advanceTimersByTime(100);
    });
    active = true;
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(isBlocked("after")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(isBlocked("after")).toBe(false);
    expect(currentCallback).toHaveBeenCalledTimes(2);
  });

  it("should replace changed deadlines and cancel omitted timeout options", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const onTimeout = vi.fn();
    const initialProps: ConditionalBlockerConfig = {
      scope: "test",
      condition: () => true,
      checkInterval: 100,
      timeout: 500,
      onTimeout,
    };
    const { result, rerender, unmount } = renderHook(
      (config: ConditionalBlockerConfig) => {
        useConditionalBlocker("deadline", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );
    const { isBlocked, getBlockingInfo } = result.current.getState();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ ...initialProps, timeout: 700 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(isBlocked("test")).toBe(true);
    rerender({ scope: "test", condition: () => true, checkInterval: 100 });
    expect(getBlockingInfo("test")[0]).toMatchObject({ timeout: undefined, onTimeout: undefined });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(isBlocked("test")).toBe(true);
    expect(onTimeout).not.toHaveBeenCalled();
    rerender({ ...initialProps, timeout: 200 });
    act(() => {
      vi.advanceTimersByTime(199);
    });
    expect(isBlocked("test")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(isBlocked("test")).toBe(false);
    expect(onTimeout).toHaveBeenCalledExactlyOnceWith("deadline");
    unmount();
  });

  it("should release the previous identity and cancel its deadline in Strict Mode", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <StrictMode>
        <UIBlockingProvider>{children}</UIBlockingProvider>
      </StrictMode>
    );
    const onTimeout = vi.fn();
    const { result, rerender, unmount } = renderHook(
      ({ id }: IdentityProps) => {
        useConditionalBlocker(id, { scope: id, condition: () => true, timeout: 500, onTimeout });

        return useUIBlockingContext();
      },
      { initialProps: { id: "first" }, wrapper }
    );
    const { isBlocked, getBlockingInfo } = result.current.getState();

    expect(getBlockingInfo("first")).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ id: "second" });
    expect(isBlocked("first")).toBe(false);
    expect(getBlockingInfo("second")).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(isBlocked("second")).toBe(true);
    expect(onTimeout).not.toHaveBeenCalled();
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(isBlocked("second")).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
  });

  it("should move registration to the current provider and preserve other stores", () => {
    const { addBlocker, isBlocked: globalIsBlocked } = uiBlockingStoreApi.getState();

    addBlocker("moving", { scope: "other-store" });

    let providerKey = "first";
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider key={providerKey}>{children}</UIBlockingProvider>
    );
    const onTimeout = vi.fn();
    const { result, rerender, unmount } = renderHook(
      () => {
        useConditionalBlocker("moving", {
          scope: "moving",
          condition: () => true,
          timeout: 500,
          onTimeout,
        });

        return useUIBlockingContext();
      },
      { wrapper }
    );
    const { isBlocked: oldIsBlocked } = result.current.getState();

    expect(oldIsBlocked("moving")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(300);
    });
    providerKey = "second";
    rerender();

    const { isBlocked: nextIsBlocked } = result.current.getState();

    expect(nextIsBlocked("moving")).toBe(true);
    expect(oldIsBlocked("moving")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(nextIsBlocked("moving")).toBe(true);
    expect(onTimeout).not.toHaveBeenCalled();
    unmount();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onTimeout).not.toHaveBeenCalled();
    expect(globalIsBlocked("other-store")).toBe(true);
  });

  it("should expire without a callback and keep callback removal on the same deadline", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const onTimeout = vi.fn();
    const initialProps: ConditionalBlockerConfig = {
      scope: "test",
      condition: () => true,
      timeout: 500,
      onTimeout,
    };
    const { result, rerender } = renderHook(
      (config: ConditionalBlockerConfig) => {
        useConditionalBlocker("silent", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );
    const { isBlocked } = result.current.getState();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({ ...initialProps, onTimeout: undefined });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(isBlocked("test")).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
    rerender({ ...initialProps, scope: "new", onTimeout: undefined });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(isBlocked("new")).toBe(false);
  });

  it("should block when condition returns true", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => true,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = uiBlockingStoreApi.getState();

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

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(false);
  });

  it("should check condition based on state parameter", () => {
    const { rerender } = renderHook(
      ({ state }: StateProps) =>
        useConditionalBlocker("test-blocker", {
          scope: "test",
          condition: (isOnline) => !isOnline,
          state,
          checkInterval: 1000,
        }),
      { initialProps: { state: true } }
    );

    const { isBlocked: isBlockedInitial } = uiBlockingStoreApi.getState();

    expect(isBlockedInitial("test")).toBe(false);

    rerender({ state: false });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

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

  it("should restart condition checks when check interval changes", () => {
    const conditionFn = vi.fn(() => false);
    const { rerender } = renderHook(
      ({ checkInterval }: IntervalProps) =>
        useConditionalBlocker("test-blocker", {
          scope: "test",
          condition: conditionFn,
          checkInterval,
        }),
      { initialProps: { checkInterval: 1000 } }
    );

    expect(conditionFn).toHaveBeenCalledTimes(1);
    rerender({ checkInterval: 100 });
    expect(conditionFn).toHaveBeenCalledTimes(2);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(conditionFn).toHaveBeenCalledTimes(3);
  });

  it("should use the default interval when check interval is not positive", () => {
    const conditionFn = vi.fn(() => false);

    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: conditionFn,
        checkInterval: 0,
      })
    );

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(conditionFn).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(conditionFn).toHaveBeenCalledTimes(2);
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

    const { isBlocked: isBlockedInitial } = uiBlockingStoreApi.getState();

    expect(isBlockedInitial("test")).toBe(false);

    shouldBlock = true;

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

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

    const { isBlocked: isBlockedInitial } = uiBlockingStoreApi.getState();

    expect(isBlockedInitial("test")).toBe(true);

    shouldBlock = false;

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

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

    const { isBlocked: isBlockedBefore } = uiBlockingStoreApi.getState();

    expect(isBlockedBefore("test")).toBe(true);

    unmount();

    const { isBlocked: isBlockedAfter } = uiBlockingStoreApi.getState();

    expect(isBlockedAfter("test")).toBe(false);
  });

  it("should unmount cleanly when blocker was never active", () => {
    const { unmount } = renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: "test",
        condition: () => false,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(false);

    expect(() => unmount()).not.toThrow();
    expect(isBlocked("test")).toBe(false);
  });

  it("should handle multiple scopes", () => {
    renderHook(() =>
      useConditionalBlocker("test-blocker", {
        scope: ["scope1", "scope2"],
        condition: () => true,
        checkInterval: 1000,
      })
    );

    const { isBlocked } = uiBlockingStoreApi.getState();

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

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
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

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
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

    const { getBlockingInfo: getInfoInitial } = uiBlockingStoreApi.getState();

    expect(getInfoInitial("test")).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();

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

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
  });
});
