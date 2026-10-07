import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { UIBlockingProvider, useUIBlockingContext } from "../../../context";
import { uiBlockingStoreApi } from "../../../store";
import { useScheduledBlocker } from "../useScheduledBlocker";
import type { PropsWithChildren, ReactNode } from "react";
import type { ScheduledBlockerConfig } from "../useScheduledBlocker.types";

describe("useScheduledBlocker", () => {
  const readIsBlocked = (scope: string): boolean => {
    const { isBlocked } = uiBlockingStoreApi.getState();

    return isBlocked(scope);
  };

  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should replace configuration during an unchanged active window", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const schedule = { start: Date.now(), duration: 5000 };
    const onScheduleStart = vi.fn();
    const initialProps: ScheduledBlockerConfig = {
      scope: "old",
      reason: "Old",
      priority: 42,
      timestamp: 123,
      schedule,
      onScheduleStart,
    };
    const { result, rerender } = renderHook(
      (config: ScheduledBlockerConfig) => {
        useScheduledBlocker("current", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );

    rerender({ scope: "new", schedule, onScheduleStart });

    const { isBlocked, getBlockingInfo } = result.current.getState();

    expect(isBlocked("old")).toBe(false);
    expect(getBlockingInfo("new")).toHaveLength(1);
    expect(getBlockingInfo("new")[0]).toMatchObject({
      reason: "Unknown",
      priority: 0,
      timestamp: 123,
    });
    expect(onScheduleStart).toHaveBeenCalledTimes(1);
  });

  it("should retain the timeout deadline and notify schedule end separately with current callbacks", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const oldTimeout = vi.fn();
    const currentTimeout = vi.fn();
    const oldEnd = vi.fn();
    const currentEnd = vi.fn();
    const schedule = { start: Date.now() + 100, duration: 1000 };
    const initialProps: ScheduledBlockerConfig = {
      scope: "old",
      schedule,
      timeout: 500,
      onTimeout: oldTimeout,
      onScheduleEnd: oldEnd,
    };
    const { result, rerender } = renderHook(
      (config: ScheduledBlockerConfig) => {
        useScheduledBlocker("deadline", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    rerender({
      scope: "new",
      schedule,
      timeout: 500,
      onTimeout: currentTimeout,
      onScheduleEnd: currentEnd,
    });

    const { isBlocked } = result.current.getState();

    expect(isBlocked("old")).toBe(false);
    expect(isBlocked("new")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(isBlocked("new")).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(isBlocked("new")).toBe(false);
    expect(oldTimeout).not.toHaveBeenCalled();
    expect(currentTimeout).toHaveBeenCalledExactlyOnceWith("deadline");
    expect(currentEnd).not.toHaveBeenCalled();
    rerender({ scope: "after-timeout", schedule, timeout: 500, onScheduleEnd: currentEnd });
    expect(isBlocked("after-timeout")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(oldEnd).not.toHaveBeenCalled();
    expect(currentEnd).toHaveBeenCalledTimes(1);
  });

  it("should replace timeout options and cancel obsolete deadlines on detach", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const onTimeout = vi.fn();
    const onScheduleEnd = vi.fn();
    const schedule = { start: Date.now(), duration: 2000 };
    const initialProps: ScheduledBlockerConfig = {
      scope: "test",
      schedule,
      timeout: 500,
      onTimeout,
      onScheduleEnd,
    };
    const { result, rerender, unmount } = renderHook(
      (config: ScheduledBlockerConfig) => {
        useScheduledBlocker("replacement", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );
    const { isBlocked } = result.current.getState();

    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ scope: "test", schedule, timeout: 800, onTimeout, onScheduleEnd });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(isBlocked("test")).toBe(true);
    rerender({ scope: "test", schedule, onScheduleEnd });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(isBlocked("test")).toBe(true);
    expect(onTimeout).not.toHaveBeenCalled();
    unmount();
    expect(isBlocked("test")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onScheduleEnd).not.toHaveBeenCalled();
  });

  it("should release an active window when replaced by a future or elapsed schedule", () => {
    const wrapper = ({ children }: PropsWithChildren): ReactNode => (
      <UIBlockingProvider>{children}</UIBlockingProvider>
    );
    const now = Date.now();
    const onScheduleStart = vi.fn();
    const onScheduleEnd = vi.fn();
    const initialProps: ScheduledBlockerConfig = {
      scope: "test",
      schedule: { start: now, duration: 1000 },
      onScheduleStart,
      onScheduleEnd,
    };
    const { result, rerender } = renderHook(
      (config: ScheduledBlockerConfig) => {
        useScheduledBlocker("window", config);

        return useUIBlockingContext();
      },
      { initialProps, wrapper }
    );
    const { isBlocked } = result.current.getState();

    expect(isBlocked("test")).toBe(true);
    rerender({ ...initialProps, schedule: { start: now + 2000, duration: 1000 } });
    expect(isBlocked("test")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onScheduleEnd).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(isBlocked("test")).toBe(true);
    expect(onScheduleStart).toHaveBeenCalledTimes(2);
    rerender({ ...initialProps, schedule: { start: now - 2000, duration: 1000 } });
    expect(isBlocked("test")).toBe(false);
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onScheduleEnd).not.toHaveBeenCalled();
  });

  it("should block when schedule starts", () => {
    const now = Date.now();
    const onScheduleStart = vi.fn();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 5000,
        },
        onScheduleStart,
      })
    );

    const { isBlocked: isBlockedBefore } = uiBlockingStoreApi.getState();

    expect(isBlockedBefore("test")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
    expect(onScheduleStart).toHaveBeenCalledTimes(1);
  });

  it("should unblock when schedule ends", () => {
    const now = Date.now();
    const onScheduleEnd = vi.fn();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
        onScheduleEnd,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = readIsBlocked("test");
    expect(isBlocked).toBe(false);
    expect(onScheduleEnd).toHaveBeenCalledTimes(1);
  });

  it("should reschedule blocking when schedule changes", () => {
    const now = Date.now();

    const { rerender } = renderHook(
      ({ start }: { start: number }) =>
        useScheduledBlocker("test-blocker", {
          scope: "test",
          schedule: {
            start,
            duration: 1000,
          },
        }),
      { initialProps: { start: now + 1000 } }
    );

    rerender({ start: now + 2000 });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(readIsBlocked("test")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(readIsBlocked("test")).toBe(true);
  });

  it("should support Date objects for schedule", () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 1000);

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: startDate,
          duration: 2000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
  });

  it("should support ISO strings for schedule", () => {
    const now = new Date();
    const startDate = new Date(now.getTime() + 1000);

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: startDate.toISOString(),
          duration: 2000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
  });

  it("should support end time instead of duration", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          end: now + 3000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = readIsBlocked("test");
    expect(isBlocked).toBe(false);
  });

  it("should handle immediate start time", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now,
          duration: 1000,
        },
      })
    );

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
  });

  it("should keep blocking when end time is no longer in the future during scheduling", () => {
    const now = Date.now();
    const dateNowSpy = vi.spyOn(Date, "now");

    dateNowSpy.mockReturnValueOnce(now).mockReturnValue(now + 1);

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now,
          end: now + 1,
        },
      })
    );

    expect(readIsBlocked("test")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(10);
    });

    expect(readIsBlocked("test")).toBe(true);
  });

  it("should ignore past schedule", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now - 5000,
          duration: 1000,
        },
      })
    );

    expect(readIsBlocked("test")).toBe(false);
  });

  it("should ignore invalid start time", () => {
    renderHook(() =>
      useScheduledBlocker("invalid-start", {
        scope: "test",
        reason: "Invalid schedule",
        schedule: {
          start: Number.NaN,
          duration: 1000,
        },
      })
    );

    expect(readIsBlocked("test")).toBe(false);
  });

  it("should ignore schedules beyond the maximum safe timeout", () => {
    const now = Date.now();
    const hugeDelay = 2_147_483_648;

    renderHook(() =>
      useScheduledBlocker("too-far", {
        scope: "test",
        reason: "Far future schedule",
        schedule: {
          start: now + hugeDelay,
          duration: 1000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(readIsBlocked("test")).toBe(false);
  });

  it("should cleanup timeouts on unmount", () => {
    const now = Date.now();
    const onScheduleStart = vi.fn();
    const onScheduleEnd = vi.fn();

    const { unmount } = renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
        onScheduleStart,
        onScheduleEnd,
      })
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onScheduleStart).not.toHaveBeenCalled();
    expect(onScheduleEnd).not.toHaveBeenCalled();

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(false);
  });

  it("should support multiple scopes", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: ["scope1", "scope2"],
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("scope1")).toBe(true);
    expect(isBlocked("scope2")).toBe(true);
  });

  it("should support custom priority", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        priority: 100,
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.priority).toBe(100);
  });

  it("should not call onScheduleEnd if unmounted during blocking", () => {
    const now = Date.now();
    const onScheduleEnd = vi.fn();

    const { unmount } = renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
        onScheduleEnd,
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    unmount();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onScheduleEnd).not.toHaveBeenCalled();
  });

  it("should handle schedule without end or duration", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    // Should remain blocked indefinitely
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    isBlocked = readIsBlocked("test");
    expect(isBlocked).toBe(true);
  });

  it("should prefer duration over end time when both provided", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          end: now + 5000, // 4 seconds
          duration: 2000, // 2 seconds - should take precedence
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    // Should unblock after duration (2000ms), not end time (4000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = readIsBlocked("test");
    expect(isBlocked).toBe(false);
  });

  it("should remove blocker on unmount if actively blocking", () => {
    const now = Date.now();

    const { unmount } = renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "Scheduled maintenance",
        schedule: {
          start: now + 1000,
          duration: 5000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let isBlocked = readIsBlocked("test");

    expect(isBlocked).toBe(true);

    unmount();

    isBlocked = readIsBlocked("test");
    expect(isBlocked).toBe(false);
  });

  it("should use reason from config in blocker info", () => {
    const now = Date.now();

    renderHook(() =>
      useScheduledBlocker("test-blocker", {
        scope: "test",
        reason: "System maintenance window",
        schedule: {
          start: now + 1000,
          duration: 2000,
        },
      })
    );

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.reason).toBe("System maintenance window");
  });
});
