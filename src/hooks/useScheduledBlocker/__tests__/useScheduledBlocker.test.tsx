import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUIBlockingStore } from "../../../store";
import { useScheduledBlocker } from "../useScheduledBlocker";

describe("useScheduledBlocker", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
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

    const { isBlocked: isBlockedBefore } = useUIBlockingStore.getState();
    expect(isBlockedBefore("test")).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const { isBlocked } = useUIBlockingStore.getState();
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

    let isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(false);
    expect(onScheduleEnd).toHaveBeenCalledTimes(1);
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

    const { isBlocked } = useUIBlockingStore.getState();
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

    const { isBlocked } = useUIBlockingStore.getState();
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

    let isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = useUIBlockingStore.getState().isBlocked("test");
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

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should warn about past schedule", () => {
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
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

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking] Schedule is in the past")
    );
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

    const { isBlocked } = useUIBlockingStore.getState();
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

    const { isBlocked } = useUIBlockingStore.getState();
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

    const { getBlockingInfo } = useUIBlockingStore.getState();
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

    const isBlocked = useUIBlockingStore.getState().isBlocked("test");
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

    let isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(true);

    // Should remain blocked indefinitely
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    isBlocked = useUIBlockingStore.getState().isBlocked("test");
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

    let isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(true);

    // Should unblock after duration (2000ms), not end time (4000ms)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    isBlocked = useUIBlockingStore.getState().isBlocked("test");
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

    let isBlocked = useUIBlockingStore.getState().isBlocked("test");
    expect(isBlocked).toBe(true);

    unmount();

    isBlocked = useUIBlockingStore.getState().isBlocked("test");
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

    const { getBlockingInfo } = useUIBlockingStore.getState();
    const info = getBlockingInfo("test");
    expect(info[0]?.reason).toBe("System maintenance window");
  });
});
