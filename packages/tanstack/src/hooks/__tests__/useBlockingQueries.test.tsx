import { uiBlockingStoreApi, useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../../test/test.utils";
import { useBlockingQueries } from "../useBlockingQueries";
import { QueriesBlockingConfig } from "../useBlockingQueries.types";

describe("useBlockingQueries", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should use the UIBlockingProvider store", async () => {
    const { result } = renderHook(
      () => {
        useBlockingQueries(
          [
            {
              queryKey: ["provider-queries"],
              queryFn: () => new Promise(() => undefined),
            },
          ],
          { scope: "provider-queries" }
        );

        return useIsBlocked("provider-queries");
      },
      { wrapper: createWrapper({ blockingProvider: true }) }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(uiBlockingStoreApi.getState().isBlocked("provider-queries")).toBe(false);
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
});
