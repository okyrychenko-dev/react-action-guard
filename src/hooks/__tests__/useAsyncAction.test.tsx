import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useAsyncAction } from "../useAsyncAction";
import { useUIBlockingStore, ASYNC_ACTION_PRIORITY } from "../../store";
import { actAsync } from "./test.utils";

describe("useAsyncAction", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
  });

  it("should return a function", () => {
    const { result } = renderHook(() => useAsyncAction("test-action"));

    expect(typeof result.current).toBe("function");
  });

  it("should block UI while async function is executing", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const asyncFn = vi.fn(
      async (): Promise<string> =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve("done");
          }, 100);
        })
    );

    await actAsync(async () => {
      const promise = result.current(asyncFn);

      await waitFor(() => {
        const { isBlocked } = useUIBlockingStore.getState();
        expect(isBlocked("test-scope")).toBe(true);
      });

      return promise;
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("test-scope")).toBe(false);
  });

  it("should unblock UI even if async function throws", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const asyncFn = vi.fn(async (): Promise<void> => {
      throw new Error("Test error");
    });

    await actAsync(async () => {
      const promise = result.current(asyncFn);
      await expect(promise).rejects.toThrow("Test error");
    });

    const { isBlocked } = useUIBlockingStore.getState();

    expect(isBlocked("test-scope")).toBe(false);
  });

  it("should return the result of async function", async () => {
    const { result } = renderHook(() => useAsyncAction<string>("test-action"));

    const asyncFn = vi.fn(async (): Promise<string> => "test-result");

    const resultValue = await actAsync(async () => result.current(asyncFn));

    expect(resultValue).toBe("test-result");
  });

  it("should use default global scope when not provided", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action"));

    const asyncFn = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        })
    );

    await actAsync(async () => {
      const promise = result.current(asyncFn);

      await waitFor(() => {
        const { isBlocked } = useUIBlockingStore.getState();
        expect(isBlocked()).toBe(true);
      });

      return promise;
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked()).toBe(false);
  });

  it("should handle multiple scopes", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", ["scope1", "scope2"]));

    const asyncFn = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        })
    );

    await actAsync(async () => {
      const promise = result.current(asyncFn);

      await waitFor(() => {
        const { isBlocked } = useUIBlockingStore.getState();
        expect(isBlocked("scope1")).toBe(true);
        expect(isBlocked("scope2")).toBe(true);
      });

      return promise;
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("scope1")).toBe(false);
    expect(isBlocked("scope2")).toBe(false);
  });

  it("should use ASYNC_ACTION_PRIORITY for blockers", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const asyncFn = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        })
    );

    await actAsync(async () => {
      const promise = result.current(asyncFn);

      await waitFor(() => {
        const { getBlockingInfo } = useUIBlockingStore.getState();
        const info = getBlockingInfo("test-scope");
        expect(info.length).toBeGreaterThan(0);
        expect(info[0]?.priority).toBe(ASYNC_ACTION_PRIORITY);
      });

      return promise;
    });
  });

  it("should include action id in blocker reason", async () => {
    const { result } = renderHook(() => useAsyncAction("fetch-user", "test-scope"));

    const asyncFn = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 50);
        })
    );

    await actAsync(async () => {
      const promise = result.current(asyncFn);

      await waitFor(() => {
        const { getBlockingInfo } = useUIBlockingStore.getState();
        const info = getBlockingInfo("test-scope");
        expect(info.length).toBeGreaterThan(0);
        expect(info[0]?.reason).toContain("fetch-user");
      });

      return promise;
    });
  });

  it("should create unique blocker ids for each execution", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const asyncFn1 = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );
    const asyncFn2 = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );

    await actAsync(async () => {
      const promise1 = result.current(asyncFn1);
      await new Promise((resolve) => setTimeout(resolve, 10));
      const promise2 = result.current(asyncFn2);

      await waitFor(() => {
        const { getBlockingInfo } = useUIBlockingStore.getState();
        const info = getBlockingInfo("test-scope");
        expect(info.length).toBe(2);
        expect(info[0]?.id).not.toBe(info[1]?.id);
      });

      return Promise.all([promise1, promise2]);
    });
  });

  it("should handle concurrent executions", async () => {
    const { result } = renderHook(() => useAsyncAction<number>("test-action", "test-scope"));

    const createAsyncFn = (value: number, delay: number) =>
      vi.fn(
        async (): Promise<number> =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(value);
            }, delay);
          })
      );

    const asyncFn1 = createAsyncFn(1, 100);
    const asyncFn2 = createAsyncFn(2, 50);

    const results = await actAsync(async () => Promise.all([result.current(asyncFn1), result.current(asyncFn2)]));

    expect(results).toEqual([1, 2]);

    // All should be unblocked
    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test-scope")).toBe(false);
  });

  it("should preserve function return type", async () => {
    interface TestResult {
      id: number;
      name: string;
    }

    const { result } = renderHook(() => useAsyncAction<TestResult>("test-action"));

    const asyncFn = vi.fn(async (): Promise<TestResult> => ({ id: 1, name: "test" }));

    const returnedValue = await actAsync(async () => result.current(asyncFn));

    expect(returnedValue).toEqual({ id: 1, name: "test" });
    expect(returnedValue.id).toBe(1);
    expect(returnedValue.name).toBe("test");
  });

  it("should call the async function exactly once", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action"));

    const asyncFn = vi.fn(async (): Promise<string> => "result");

    await actAsync(async () => result.current(asyncFn));

    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it("should handle void return type", async () => {
    const { result } = renderHook(() => useAsyncAction<void>("test-action"));

    const asyncFn = vi.fn(async (): Promise<void> => {
      // Do nothing
    });

    const returnedValue = await actAsync(async () => result.current(asyncFn));

    expect(returnedValue).toBeUndefined();
  });

  it("should handle rejected promises", async () => {
    const { result } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const error = new Error("Async error");
    const asyncFn = vi.fn(async (): Promise<void> => {
      throw error;
    });

    await actAsync(async () => {
      const promise = result.current(asyncFn);
      await expect(promise).rejects.toThrow(error);
    });

    // Should be unblocked after error
    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test-scope")).toBe(false);
  });

  it("should maintain stable function reference across renders", () => {
    const { result, rerender } = renderHook(() => useAsyncAction("test-action", "test-scope"));

    const firstRef = result.current;
    rerender();
    const secondRef = result.current;

    expect(firstRef).toBe(secondRef);
  });

  it("should update function when dependencies change", () => {
    const { result, rerender } = renderHook(
      ({ actionId, scope }: { actionId: string; scope: string }) => useAsyncAction(actionId, scope),
      { initialProps: { actionId: "action-1", scope: "scope-1" } }
    );

    const firstRef = result.current;

    rerender({ actionId: "action-2", scope: "scope-2" });

    const secondRef = result.current;

    expect(firstRef).not.toBe(secondRef);
  });
});
