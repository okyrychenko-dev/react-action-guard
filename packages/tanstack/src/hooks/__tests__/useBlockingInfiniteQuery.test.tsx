import { uiBlockingStoreApi, useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createWrapper } from "../../test/test.utils";
import { useBlockingInfiniteQuery } from "../useBlockingInfiniteQuery";
import { InfiniteQueryBlockingConfig } from "../useBlockingInfiniteQuery.types";

describe("useBlockingInfiniteQuery", () => {
  beforeEach(() => {
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  it("should use the UIBlockingProvider store", async () => {
    const { result } = renderHook(
      () => {
        useBlockingInfiniteQuery({
          queryKey: ["provider-infinite-query"],
          queryFn: () => new Promise(() => undefined),
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          blockingConfig: { scope: "provider-infinite-query" },
        });

        return useIsBlocked("provider-infinite-query");
      },
      { wrapper: createWrapper({ blockingProvider: true }) }
    );

    await waitFor(() => {
      expect(result.current).toBe(true);
    });
    expect(uiBlockingStoreApi.getState().isBlocked("provider-infinite-query")).toBe(false);
  });

  it("should block UI during initial loading", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Loading more data...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
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

  it("should block on error when onError is true", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          retry: false,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnLoading during initial loading state", async () => {
    const queryFn = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ data: ["item1"], nextCursor: 2 }), 100);
        })
    );

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnLoading: "Loading first page...",
      onLoading: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: (lastPage: { nextCursor: number }) => lastPage.nextCursor,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    // Should block during loading
    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should use reasonOnError during error state", async () => {
    const queryFn = vi.fn().mockRejectedValue(new Error("Test error"));

    const blockingConfig: InfiniteQueryBlockingConfig = {
      scope: "test",
      reason: "Default reason",
      reasonOnError: "Failed to load data",
      onError: true,
    };

    renderHook(
      () =>
        useBlockingInfiniteQuery({
          queryKey: ["infinite-test"],
          queryFn,
          initialPageParam: 1,
          getNextPageParam: () => undefined,
          retry: false,
          blockingConfig,
        }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked("test")).toBe(true);
    });
  });
});
