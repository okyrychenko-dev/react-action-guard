import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useIsBlocked } from "../useIsBlocked";
import { useUIBlockingStore } from "../../store";

describe("useIsBlocked", () => {
  beforeEach(() => {
    // Clear the store before each test
    useUIBlockingStore.getState().clearAllBlockers();
  });

  it("should return false when no blockers exist", () => {
    const { result } = renderHook(() => useIsBlocked());

    expect(result.current).toBe(false);
  });

  it("should return true when global blocker exists", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "global" });

    const { result } = renderHook(() => useIsBlocked());

    expect(result.current).toBe(true);
  });

  it("should return true for specific scope when blocker exists", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);
  });

  it("should return false for scope without blocker", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "scope1" });

    const { result } = renderHook(() => useIsBlocked("scope2"));

    expect(result.current).toBe(false);
  });

  it("should return true when checking multiple scopes and one is blocked", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "scope1" });

    const { result } = renderHook(() => useIsBlocked(["scope1", "scope2"]));

    expect(result.current).toBe(true);
  });

  it("should return false when checking multiple scopes and none are blocked", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "scope1" });

    const { result } = renderHook(() => useIsBlocked(["scope2", "scope3"]));

    expect(result.current).toBe(false);
  });

  it("should return true for any scope when global blocker exists", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("global-blocker", { scope: "global" });

    const { result } = renderHook(() => useIsBlocked("any-scope"));

    expect(result.current).toBe(true);
  });

  it("should re-render when blocker is added", async () => {
    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(false);

    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "test-scope" });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should re-render when blocker is removed", async () => {
    const { addBlocker, removeBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);

    removeBlocker("test-blocker");

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should re-render when all blockers are cleared", async () => {
    const { addBlocker, clearAllBlockers } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);

    clearAllBlockers();

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should re-render when scope blockers are cleared", async () => {
    const { addBlocker, clearBlockersForScope } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);

    clearBlockersForScope("test-scope");

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should handle array scope from blocker", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: ["scope1", "scope2"] });

    const { result: result1 } = renderHook(() => useIsBlocked("scope1"));
    const { result: result2 } = renderHook(() => useIsBlocked("scope2"));
    const { result: result3 } = renderHook(() => useIsBlocked("scope3"));

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
    expect(result3.current).toBe(false);
  });

  it("should work with multiple blockers for same scope", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("blocker1", { scope: "test-scope" });
    addBlocker("blocker2", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);
  });

  it("should remain blocked if one of multiple blockers is removed", async () => {
    const { addBlocker, removeBlocker } = useUIBlockingStore.getState();
    addBlocker("blocker1", { scope: "test-scope" });
    addBlocker("blocker2", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);

    removeBlocker("blocker1");

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it("should unblock only when all blockers are removed", async () => {
    const { addBlocker, removeBlocker } = useUIBlockingStore.getState();
    addBlocker("blocker1", { scope: "test-scope" });
    addBlocker("blocker2", { scope: "test-scope" });

    const { result } = renderHook(() => useIsBlocked("test-scope"));

    expect(result.current).toBe(true);

    removeBlocker("blocker1");

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    removeBlocker("blocker2");

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should handle changing scope prop", async () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("blocker1", { scope: "scope1" });
    addBlocker("blocker2", { scope: "scope2" });

    const { result, rerender } = renderHook(({ scope }: { scope: string }) => useIsBlocked(scope), {
      initialProps: { scope: "scope1" },
    });

    expect(result.current).toBe(true);

    rerender({ scope: "scope2" });

    await waitFor(() => {
      expect(result.current).toBe(true);
    });

    rerender({ scope: "scope3" });

    await waitFor(() => {
      expect(result.current).toBe(false);
    });
  });

  it("should handle empty string scope", () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("test-blocker", { scope: "" });

    const { result } = renderHook(() => useIsBlocked(""));

    expect(result.current).toBe(true);
  });

  it("should not re-render unnecessarily", async () => {
    const { addBlocker } = useUIBlockingStore.getState();
    addBlocker("blocker1", { scope: "scope1" });

    let renderCount = 0;
    const { result } = renderHook(() => {
      renderCount++;
      return useIsBlocked("scope2");
    });

    expect(result.current).toBe(false);
    const initialRenderCount = renderCount;

    addBlocker("blocker2", { scope: "scope1" });

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(renderCount).toBe(initialRenderCount);
  });

  it("should handle complex blocking scenarios", async () => {
    const { addBlocker, removeBlocker } = useUIBlockingStore.getState();

    addBlocker("global", { scope: "global" });
    addBlocker("scope1", { scope: "scope1" });
    addBlocker("multi", { scope: ["scope2", "scope3"] });

    const { result: resultGlobal } = renderHook(() => useIsBlocked());
    const { result: result1 } = renderHook(() => useIsBlocked("scope1"));
    const { result: result2 } = renderHook(() => useIsBlocked("scope2"));
    const { result: result3 } = renderHook(() => useIsBlocked("scope3"));
    const { result: result4 } = renderHook(() => useIsBlocked("scope4"));

    expect(resultGlobal.current).toBe(true);
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
    expect(result3.current).toBe(true);
    expect(result4.current).toBe(true);

    removeBlocker("global");

    await waitFor(() => {
      expect(resultGlobal.current).toBe(false);
      expect(result1.current).toBe(true);
      expect(result2.current).toBe(true);
      expect(result3.current).toBe(true);
      expect(result4.current).toBe(false);
    });
  });
});
