import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { createPerformanceMiddleware } from "../performanceMiddleware";
import type { MiddlewareContext } from "../middleware.types";
import { act } from "@testing-library/react";

describe("createPerformanceMiddleware", () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should track block duration", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void middleware(addContext);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext);

    expect(onSlowBlock).toHaveBeenCalledWith("test-blocker", expect.closeTo(1500, 50));
  });

  it("should warn about slow blocks by default", () => {
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
    });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "slow-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void middleware(addContext);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "slow-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext);

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      '[UIBlocking] Slow block detected: "slow-blocker" took 2000ms'
    );
  });

  it("should not warn for fast blocks", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "fast-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void middleware(addContext);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "fast-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext);

    expect(onSlowBlock).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  it("should use default threshold of 3000ms", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({ onSlowBlock });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void middleware(addContext);

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext);

    expect(onSlowBlock).not.toHaveBeenCalled();

    // Now test with > 3000ms
    const addContext2: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker-2",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void middleware(addContext2);

    act(() => {
      vi.advanceTimersByTime(3500);
    });

    const removeContext2: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker-2",
      timestamp: Date.now(),
    };

    void middleware(removeContext2);

    expect(onSlowBlock).toHaveBeenCalledTimes(1);
  });

  it("should track multiple blockers independently", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const blocker1Add: MiddlewareContext = {
      action: "add",
      blockerId: "blocker-1",
      config: { scope: "test", reason: "Test 1" },
      timestamp: Date.now(),
    };

    void middleware(blocker1Add);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const blocker2Add: MiddlewareContext = {
      action: "add",
      blockerId: "blocker-2",
      config: { scope: "test", reason: "Test 2" },
      timestamp: Date.now(),
    };

    void middleware(blocker2Add);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const blocker1Remove: MiddlewareContext = {
      action: "remove",
      blockerId: "blocker-1",
      timestamp: Date.now(),
    };

    void middleware(blocker1Remove);

    expect(onSlowBlock).toHaveBeenCalledWith("blocker-1", expect.closeTo(1500, 50));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const blocker2Remove: MiddlewareContext = {
      action: "remove",
      blockerId: "blocker-2",
      timestamp: Date.now(),
    };

    void middleware(blocker2Remove);

    expect(onSlowBlock).toHaveBeenCalledWith("blocker-2", expect.closeTo(1500, 50));
    expect(onSlowBlock).toHaveBeenCalledTimes(2);
  });

  it("should handle remove without corresponding add", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "unknown-blocker",
      timestamp: Date.now(),
    };

    expect(() => middleware(removeContext)).not.toThrow();
    expect(onSlowBlock).not.toHaveBeenCalled();
  });

  it("should clean up start time after remove", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: { scope: "test", reason: "Test" },
      timestamp: Date.now(),
    };

    void middleware(addContext);

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext);

    expect(onSlowBlock).toHaveBeenCalledTimes(1);

    // Add and remove again - should not affect previous duration
    const addContext2: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: { scope: "test", reason: "Test" },
      timestamp: Date.now(),
    };

    void middleware(addContext2);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const removeContext2: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(removeContext2);

    // Should not trigger onSlowBlock since duration is < 1000ms
    expect(onSlowBlock).toHaveBeenCalledTimes(1);
  });

  it("should ignore non-add/remove actions", () => {
    const onSlowBlock = vi.fn();
    const middleware = createPerformanceMiddleware({
      slowBlockThreshold: 1000,
      onSlowBlock,
    });

    const updateContext: MiddlewareContext = {
      action: "update",
      blockerId: "test-blocker",
      config: { scope: "test", reason: "Updated" },
      timestamp: Date.now(),
    };

    void middleware(updateContext);

    const cancelContext: MiddlewareContext = {
      action: "cancel",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(cancelContext);

    const timeoutContext: MiddlewareContext = {
      action: "timeout",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware(timeoutContext);

    expect(onSlowBlock).not.toHaveBeenCalled();
  });

  it("should support custom threshold per instance", () => {
    const onSlowBlock1 = vi.fn();
    const middleware1 = createPerformanceMiddleware({
      slowBlockThreshold: 500,
      onSlowBlock: onSlowBlock1,
    });

    const onSlowBlock2 = vi.fn();
    const middleware2 = createPerformanceMiddleware({
      slowBlockThreshold: 2000,
      onSlowBlock: onSlowBlock2,
    });

    const addContext: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: { scope: "test", reason: "Test" },
      timestamp: Date.now(),
    };

    void middleware1(addContext);
    void middleware2(addContext);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const removeContext: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void middleware1(removeContext);
    void middleware2(removeContext);

    // Should trigger for threshold 500ms
    expect(onSlowBlock1).toHaveBeenCalled();
    // Should not trigger for threshold 2000ms
    expect(onSlowBlock2).not.toHaveBeenCalled();
  });
});
