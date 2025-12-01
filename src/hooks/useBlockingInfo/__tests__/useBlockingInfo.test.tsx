import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { uiBlockingStoreApi } from "../../../store";
import { useBlockingInfo } from "../useBlockingInfo";

describe("useBlockingInfo", () => {
  beforeEach(() => {
    // Clear the store before each test
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should return empty array when no blockers exist", () => {
    const { result } = renderHook(() => useBlockingInfo());

    expect(result.current).toEqual([]);
  });

  it("should return blocker info for matching scope", () => {
    const { result } = renderHook(() => useBlockingInfo("test-scope"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-1", {
        scope: "test-scope",
        reason: "Test reason",
        priority: 50,
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: "blocker-1",
      scope: "test-scope",
      reason: "Test reason",
      priority: 50,
    });
  });

  it("should return multiple blockers sorted by priority", () => {
    const { result } = renderHook(() => useBlockingInfo("test-scope"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("low-priority", {
        scope: "test-scope",
        priority: 10,
        reason: "Low priority",
      });

      uiBlockingStoreApi.getState().addBlocker("high-priority", {
        scope: "test-scope",
        priority: 90,
        reason: "High priority",
      });

      uiBlockingStoreApi.getState().addBlocker("medium-priority", {
        scope: "test-scope",
        priority: 50,
        reason: "Medium priority",
      });
    });

    expect(result.current).toHaveLength(3);
    // Should be sorted by priority (highest first)
    expect(result.current[0].id).toBe("high-priority");
    expect(result.current[1].id).toBe("medium-priority");
    expect(result.current[2].id).toBe("low-priority");
  });

  it("should include global blockers for any scope", () => {
    const { result } = renderHook(() => useBlockingInfo("specific-scope"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("global-blocker", {
        scope: "global",
        reason: "Global block",
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("global-blocker");
  });

  it("should update when blockers are added", () => {
    const { result } = renderHook(() => useBlockingInfo("test-scope"));

    expect(result.current).toHaveLength(0);

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-1", {
        scope: "test-scope",
        reason: "First blocker",
      });
    });

    expect(result.current).toHaveLength(1);

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-2", {
        scope: "test-scope",
        reason: "Second blocker",
      });
    });

    expect(result.current).toHaveLength(2);
  });

  it("should update when blockers are removed", () => {
    const { result } = renderHook(() => useBlockingInfo("test-scope"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-1", {
        scope: "test-scope",
        reason: "Test",
      });

      uiBlockingStoreApi.getState().addBlocker("blocker-2", {
        scope: "test-scope",
        reason: "Test",
      });
    });

    expect(result.current).toHaveLength(2);

    act(() => {
      uiBlockingStoreApi.getState().removeBlocker("blocker-1");
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("blocker-2");
  });

  it("should not include blockers from different scopes", () => {
    const { result } = renderHook(() => useBlockingInfo("scope-a"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-a", {
        scope: "scope-a",
        reason: "Scope A",
      });

      uiBlockingStoreApi.getState().addBlocker("blocker-b", {
        scope: "scope-b",
        reason: "Scope B",
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("blocker-a");
  });

  it("should handle array scopes", () => {
    const { result } = renderHook(() => useBlockingInfo("scope-a"));

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("multi-scope-blocker", {
        scope: ["scope-a", "scope-b"],
        reason: "Multi-scope block",
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("multi-scope-blocker");
  });

  it("should include timestamp in blocker info", () => {
    const { result } = renderHook(() => useBlockingInfo("test-scope"));
    const now = Date.now();

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-1", {
        scope: "test-scope",
        reason: "Test",
        timestamp: now,
      });
    });

    expect(result.current[0].timestamp).toBe(now);
  });

  it("should use global scope by default", () => {
    const { result } = renderHook(() => useBlockingInfo());

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("global-blocker", {
        // No scope specified, defaults to "global"
        reason: "Global block",
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("global-blocker");
  });

  it("should handle scope parameter changes", () => {
    const { result, rerender } = renderHook(({ scope }) => useBlockingInfo(scope), {
      initialProps: { scope: "scope-a" },
    });

    act(() => {
      uiBlockingStoreApi.getState().addBlocker("blocker-a", {
        scope: "scope-a",
        reason: "Scope A",
      });

      uiBlockingStoreApi.getState().addBlocker("blocker-b", {
        scope: "scope-b",
        reason: "Scope B",
      });
    });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("blocker-a");

    // Change scope
    rerender({ scope: "scope-b" });

    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe("blocker-b");
  });
});
