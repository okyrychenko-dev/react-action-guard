import { act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createBlockingLifecycle } from "../../store/blockingLifecycle";
import { createPerformanceMiddleware } from "../performanceMiddleware";
import type { MiddlewareContext } from "../middleware.types";

describe("createPerformanceMiddleware", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should finalize every bulk-cleared lifetime even when a callback throws", () => {
    const lifecycle = createBlockingLifecycle();
    const onSlowBlock = vi.fn((id: string) => {
      if (id === "x") {
        throw new Error("consumer failure");
      }
    });

    lifecycle.observe(createPerformanceMiddleware({ slowBlockThreshold: 100, onSlowBlock }));
    lifecycle.add("x", { scope: "a" });
    lifecycle.add("y", { scope: ["a", "b"] });

    vi.advanceTimersByTime(200);

    lifecycle.clear();

    expect(onSlowBlock.mock.calls).toEqual([
      ["x", 200],
      ["y", 200],
    ]);

    lifecycle.add("x");

    vi.advanceTimersByTime(50);

    lifecycle.remove("x");

    expect(onSlowBlock).toHaveBeenCalledTimes(2);
  });

  it("should preserve the original lifetime and use updated scopes for targeted cleanup", () => {
    const lifecycle = createBlockingLifecycle();
    const onSlowBlock = vi.fn();

    lifecycle.observe(createPerformanceMiddleware({ slowBlockThreshold: 100, onSlowBlock }));
    lifecycle.add("moved", { scope: "a" });
    lifecycle.add("cleared", { scope: ["a", "c"] });
    lifecycle.add("global");

    vi.advanceTimersByTime(100);

    lifecycle.update("moved", { scope: "b" });

    vi.advanceTimersByTime(50);

    lifecycle.clearScope("a");

    expect(onSlowBlock.mock.calls).toEqual([["cleared", 150]]);
    expect(lifecycle.getSnapshot().map(({ id }) => id)).toEqual(["moved", "global"]);

    vi.advanceTimersByTime(50);

    lifecycle.remove("moved");

    expect(onSlowBlock.mock.calls).toEqual([
      ["cleared", 150],
      ["moved", 200],
    ]);

    lifecycle.clearScope("global");

    vi.advanceTimersByTime(50);

    lifecycle.remove("global");

    expect(onSlowBlock.mock.calls).toEqual([
      ["cleared", 150],
      ["moved", 200],
      ["global", 250],
    ]);
  });

  it("should snapshot caller-owned scope arrays before tracking a lifetime", () => {
    const lifecycle = createBlockingLifecycle();
    const onSlowBlock = vi.fn();
    const scope = ["original"];

    lifecycle.observe(createPerformanceMiddleware({ slowBlockThreshold: 100, onSlowBlock }));
    lifecycle.add("mutable-scope", { scope });

    scope[0] = "mutated";

    vi.advanceTimersByTime(150);

    lifecycle.clearScope("original");

    expect(lifecycle.getSnapshot()).toEqual([]);
    expect(onSlowBlock.mock.calls).toEqual([["mutable-scope", 150]]);
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

  it("should be side-effect free by default", () => {
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
