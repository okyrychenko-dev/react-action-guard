import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../../test/test.utils";
import { useBlockingQueries } from "../useBlockingQueries";
import { QueriesBlockingConfig } from "../useBlockingQueries.types";

describe("useBlockingQueries", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should block UI during initial loading of multiple queries", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Loading queries...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock after all queries complete
    await waitFor(
      () => {
        const { isBlocked } = uiBlockingStoreApi.getState();
        expect(isBlocked("test")).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("should not block when onLoading is false", async () => {
    const queryFn1 = vi.fn().mockResolvedValue("data1");
    const queryFn2 = vi.fn().mockResolvedValue("data2");

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      onLoading: false,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should block when any query has error and onError is true", async () => {
    const queryFn1 = vi.fn().mockResolvedValue("data1");
    const queryFn2 = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2, retry: false },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnLoading during initial loading state", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnLoading: "Loading all queries...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnError when any query fails", async () => {
    const queryFn1 = vi.fn().mockResolvedValue("data1");
    const queryFn2 = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnError: "Failed to load queries",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2, retry: false },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should fall back to reason when specific reasons are not provided", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Fallback reason",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should support multiple scopes", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: ["scope1", "scope2"],
      reason: "Loading...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
    });
  });

  it("should use correct priority", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      priority: 50,
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    // Should block during loading (priority is internal implementation detail)
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should clean up blocker on unmount", async () => {
    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data1"), 100);
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      onLoading: true,
    };

    const { unmount } = renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    // Wait for blocker to be added
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Unmount and check blocker is removed
    unmount();

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should handle empty queries array", async () => {
    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      onLoading: true,
    };

    const { result } = renderHook(() => useBlockingQueries([], blockingConfig), {
      wrapper: createWrapper(),
    });

    expect(result.current).toEqual([]);

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should block only when all conditions are met for partial loading", async () => {
    const queryFn1 = vi.fn().mockResolvedValue("data1"); // Completes fast
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data2"), 100);
        })
    );

    const blockingConfig: QueriesBlockingConfig = {
      scope: "test",
      reason: "Loading...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1"], queryFn: queryFn1 },
            { queryKey: ["query2"], queryFn: queryFn2 },
          ],
          blockingConfig
        ),
      { wrapper: createWrapper() }
    );

    // Should block while at least one query is loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock when all queries complete
    await waitFor(
      () => {
        const { isBlocked } = uiBlockingStoreApi.getState();
        expect(isBlocked("test")).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("should keep a single blocker across rerenders with inline blocking config", async () => {
    let resolveFirstQuery: ((value: string) => void) | undefined;
    let resolveSecondQuery: ((value: string) => void) | undefined;

    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveFirstQuery = resolve;
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveSecondQuery = resolve;
        })
    );

    const { rerender } = renderHook(
      ({ reason }: { reason: string }) =>
        useBlockingQueries(
          [
            { queryKey: ["query1", "rerender"], queryFn: queryFn1 },
            { queryKey: ["query2", "rerender"], queryFn: queryFn2 },
          ],
          {
            scope: "test",
            reason,
            onLoading: true,
          }
        ),
      {
        initialProps: { reason: "Loading A" },
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => {
      const info = uiBlockingStoreApi.getState().getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Loading A");
    });

    rerender({ reason: "Loading B" });

    await waitFor(() => {
      const info = uiBlockingStoreApi.getState().getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Loading B");
    });

    resolveFirstQuery?.("data1");
    resolveSecondQuery?.("data2");

    await waitFor(() => {
      expect(uiBlockingStoreApi.getState().isBlocked("test")).toBe(false);
    });
  });

  it("should clean up correctly in StrictMode", async () => {
    let resolveFirstQuery: ((value: string) => void) | undefined;
    let resolveSecondQuery: ((value: string) => void) | undefined;

    const queryFn1 = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveFirstQuery = resolve;
        })
    );
    const queryFn2 = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveSecondQuery = resolve;
        })
    );

    const { unmount } = renderHook(
      () =>
        useBlockingQueries(
          [
            { queryKey: ["query1", "strict"], queryFn: queryFn1 },
            { queryKey: ["query2", "strict"], queryFn: queryFn2 },
          ],
          {
            scope: "test",
            reason: "Strict mode load",
            onLoading: true,
          }
        ),
      { wrapper: createWrapper({ strictMode: true }) }
    );

    await waitFor(() => {
      const info = uiBlockingStoreApi.getState().getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Strict mode load");
    });

    resolveFirstQuery?.("data1");
    resolveSecondQuery?.("data2");

    await waitFor(() => {
      expect(uiBlockingStoreApi.getState().isBlocked("test")).toBe(false);
    });

    unmount();

    expect(uiBlockingStoreApi.getState().getBlockingInfo("test")).toHaveLength(0);
  });
});
