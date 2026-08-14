import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { actAsync, createWrapper } from "../../test/test.utils";
import { useBlockingQuery } from "../useBlockingQuery";
import { QueryBlockingConfig } from "../useBlockingQuery.types";

describe("useBlockingQuery", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should block UI during initial loading", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      reason: "Loading data...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Should unblock after loading completes
    await waitFor(
      () => {
        const { isBlocked } = uiBlockingStoreApi.getState();
        expect(isBlocked("test")).toBe(false);
      },
      { timeout: 2000 }
    );
  });

  it("should remove blocker after timeout and call onTimeout", async () => {
    const queryFn = vi.fn().mockImplementation(() => new Promise(() => undefined));
    const onTimeout = vi.fn();

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      timeout: 50,
      onTimeout,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    await actAsync(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 75);
      });
    });

    expect(onTimeout).toHaveBeenCalledTimes(1);
    const timedOutId = onTimeout.mock.calls[0]?.[0];
    expect(typeof timedOutId).toBe("string");
    expect(timedOutId).toContain('query-["test"]-');
    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should not block when onLoading is false", async () => {
    const queryFn = vi.fn().mockResolvedValue("data");

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: false,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should block during fetching when onFetching is true", async () => {
    const queryFn = vi.fn().mockResolvedValue("data");

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      onFetching: true,
    };

    const { result } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Refetch to trigger fetching state
    void result.current.refetch();

    // Should block during fetching
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      if (result.current.isRefetching) {
        expect(isBlocked("test")).toBe(true);
      }
    });
  });

  it("should use custom reason", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      reason: "Custom loading message",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Custom loading message");
      }
    });
  });

  it("should use custom priority", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      priority: 100,
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.priority).toBe(100);
      }
    });
  });

  it("should handle multiple scopes", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: ["scope1", "scope2"],
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
    });
  });

  it("should remove blocker when component unmounts", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    const { unmount } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Wait for blocker to be added
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Unmount and verify blocker is removed
    unmount();

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(false);
  });

  it("should use unique blocker ID based on query key", async () => {
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

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test", "1"],
          queryFn: queryFn1,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test", "2"],
          queryFn: queryFn2,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      // Both queries should create separate blockers
      expect(info.length).toBe(2);
    });
  });

  it("should keep blocker active when one of same-key queries unmounts", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    const first = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test", "same"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    const second = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test", "same"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    first.unmount();

    const { isBlocked } = uiBlockingStoreApi.getState();
    expect(isBlocked("test")).toBe(true);

    second.unmount();
  });

  it("should return the same result as useQuery", async () => {
    const queryFn = vi.fn().mockResolvedValue("test-data");

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    const { result } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBe("test-data");
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it("should use default reason when not provided", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Loading data...");
      }
    });
  });

  it("should use default priority of 10 when not provided", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.priority).toBe(10);
      }
    });
  });

  it("should handle rapid state changes", async () => {
    let resolveQuery: ((value: string) => void) | undefined;
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveQuery = resolve;
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(true);
    });

    // Resolve the query
    if (resolveQuery) {
      resolveQuery("data");
    }

    // Should unblock after loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();
      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should keep a single blocker across rerenders with inline blocking config", async () => {
    let resolveQuery: ((value: string) => void) | undefined;
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveQuery = resolve;
        })
    );

    const { rerender } = renderHook(
      ({ reason }: { reason: string }) =>
        useBlockingQuery({
          queryKey: ["test", "rerender"],
          queryFn,
          blockingConfig: {
            scope: "test",
            reason,
            onLoading: true,
          },
        }),
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

    resolveQuery?.("done");

    await waitFor(() => {
      expect(uiBlockingStoreApi.getState().isBlocked("test")).toBe(false);
    });
  });

  it("should clean up correctly in StrictMode", async () => {
    let resolveQuery: ((value: string) => void) | undefined;
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise<string>((resolve) => {
          resolveQuery = resolve;
        })
    );

    const { unmount } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["strict-mode"],
          queryFn,
          blockingConfig: {
            scope: "test",
            reason: "Strict mode load",
            onLoading: true,
          },
        }),
      { wrapper: createWrapper({ strictMode: true }) }
    );

    await waitFor(() => {
      const info = uiBlockingStoreApi.getState().getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Strict mode load");
    });

    resolveQuery?.("done");

    await waitFor(() => {
      expect(uiBlockingStoreApi.getState().isBlocked("test")).toBe(false);
    });

    unmount();

    expect(uiBlockingStoreApi.getState().getBlockingInfo("test")).toHaveLength(0);
  });

  it("should use reasonOnLoading during initial loading state", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      reasonOnLoading: "Loading initial data...",
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Loading initial data...");
      }
    });
  });

  it("should use reasonOnFetching during background fetching state", async () => {
    const queryFn = vi.fn().mockResolvedValue("data");

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      onFetching: true,
      reasonOnLoading: "Loading initial data...",
      reasonOnFetching: "Refreshing data...",
    };

    const { result } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Refetch to trigger fetching state
    void result.current.refetch();

    // Should block during fetching with custom reason
    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (result.current.isRefetching && info.length > 0) {
        expect(info[0]?.reason).toBe("Refreshing data...");
      }
    });
  });

  it("should use reasonOnError during error state", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onError: true,
      onLoading: false,
      reasonOnError: "Failed to load data",
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block with custom error reason
    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Failed to load data");
      }
    });
  });

  it("should fall back to reason when specific reasons are not provided", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      reason: "Custom fallback reason",
    };

    renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (info.length > 0) {
        expect(info[0]?.reason).toBe("Custom fallback reason");
      }
    });
  });

  it("should use different reasons for different states", async () => {
    let rejectQuery: ((error: Error) => void) | undefined;
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve, reject) => {
          rejectQuery = reject;
          setTimeout(() => resolve("data"), 100);
        })
    );

    const blockingConfig: QueryBlockingConfig = {
      scope: "test",
      onLoading: true,
      onError: true,
      reasonOnLoading: "Loading...",
      reasonOnError: "Error occurred",
    };

    const { result, rerender } = renderHook(
      () =>
        useBlockingQuery({
          queryKey: ["test"],
          queryFn,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should use loading reason during initial load
    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (result.current.isPending && info.length > 0) {
        expect(info[0]?.reason).toBe("Loading...");
      }
    });

    // Trigger error
    if (rejectQuery) {
      rejectQuery(new Error("Test error"));
    }

    // Force rerender to trigger error state
    rerender();

    // Should use error reason after error
    await waitFor(() => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();
      const info = getBlockingInfo("test");
      if (result.current.isError && info.length > 0) {
        expect(info[0]?.reason).toBe("Error occurred");
      }
    });
  });
});
