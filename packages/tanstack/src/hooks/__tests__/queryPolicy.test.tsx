import { QueryClient, onlineManager } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createPolicyWrapper, usePolicyFixture } from "./queryPolicy.test.utils";

const available = [[], [], []];
const loading = [["Loading"], ["Loading"], ["Loading"]];
const fetching = [["Fetching"], ["Fetching"], ["Fetching"]];
const config = { reasonOnLoading: "Loading", reasonOnFetching: "Fetching" };

describe("active query policy across public hooks", () => {
  afterEach(() => {
    onlineManager.setOnline(true);
  });

  it("should leave disabled pending queries available and block when enabled", async () => {
    const client = new QueryClient();
    const queryFn = () => new Promise<string>(() => undefined);
    const { result, rerender } = renderHook(usePolicyFixture, {
      wrapper: createPolicyWrapper(client),
      initialProps: { client, queryFn, config, enabled: false },
    });

    expect(result.current.query.fetchStatus).toBe("idle");
    expect(result.current.infinite.fetchStatus).toBe("idle");
    expect(result.current.collection[0].fetchStatus).toBe("idle");
    expect(result.current.reasons).toEqual(available);

    rerender({ client, queryFn, config, enabled: true });

    await waitFor(() => expect(result.current.reasons).toEqual(loading));
  });
  it("should leave paused initial queries available and block after reconnect", async () => {
    onlineManager.setOnline(false);

    const client = new QueryClient();
    const { result } = renderHook(usePolicyFixture, {
      wrapper: createPolicyWrapper(client),
      initialProps: { client, queryFn: () => new Promise<string>(() => undefined), config },
    });

    expect(result.current.query.fetchStatus).toBe("paused");
    expect(result.current.infinite.fetchStatus).toBe("paused");
    expect(result.current.collection[0].fetchStatus).toBe("paused");
    expect(result.current.reasons).toEqual(available);
    act(() => {
      onlineManager.setOnline(true);
    });
    await waitFor(() => expect(result.current.reasons).toEqual(loading));
  });

  it.each([false, true])(
    "should block cached refetches only with onFetching=%s",
    async (onFetching) => {
      const client = new QueryClient();

      client.setQueryData(["single"], "cached");
      client.setQueryData(["infinite"], { pages: ["cached"], pageParams: [0] });
      client.setQueryData(["collection"], "cached");

      const resolvers: Array<(value: string) => void> = [];
      const queryFn = () =>
        new Promise<string>((resolve) => {
          resolvers.push(resolve);
        });
      const { result } = renderHook(usePolicyFixture, {
        wrapper: createPolicyWrapper(client),
        initialProps: { client, queryFn, config: { ...config, onFetching }, enabled: false },
      });

      expect(result.current.reasons).toEqual(available);
      act(() => {
        void result.current.query.refetch();
        void result.current.infinite.refetch();
        void result.current.collection[0].refetch();
      });
      await waitFor(() => {
        expect(result.current.query.isRefetching).toBe(true);
        expect(result.current.infinite.isRefetching).toBe(true);
        expect(result.current.collection[0].isRefetching).toBe(true);
      });
      expect(result.current.reasons).toEqual(onFetching ? fetching : available);
      await act(async () => {
        resolvers.forEach((resolve) => resolve("fresh"));
      });
      await waitFor(() => {
        expect(result.current.query.data).toBe("fresh");
        expect(result.current.infinite.data?.pages).toEqual(["fresh"]);
        expect(result.current.collection[0].data).toBe("fresh");
        expect(result.current.reasons).toEqual(available);
      });
    }
  );

  it.each([false, true])("should block pagination only with onFetching=%s", async (onFetching) => {
    const client = new QueryClient();
    const resolvers: Array<(value: string) => void> = [];
    const queryFn = () =>
      new Promise<string>((resolve) => {
        resolvers.push(resolve);
      });
    const { result } = renderHook(usePolicyFixture, {
      wrapper: createPolicyWrapper(client),
      initialProps: { client, queryFn, config: { ...config, onFetching } },
    });

    expect(result.current.reasons).toEqual(loading);
    await act(async () => {
      resolvers.splice(0).forEach((resolve) => resolve("first"));
    });
    await waitFor(() => expect(result.current.reasons).toEqual(available));
    act(() => {
      void result.current.infinite.fetchNextPage();
    });
    await waitFor(() => expect(result.current.infinite.isFetchingNextPage).toBe(true));
    expect(result.current.reasons).toEqual(onFetching ? [[], ["Fetching"], []] : available);
    await act(async () => {
      resolvers.forEach((resolve) => resolve("second"));
    });
    await waitFor(() => {
      expect(result.current.infinite.data?.pages).toEqual(["first", "second"]);
      expect(result.current.reasons).toEqual(available);
    });
  });

  it.each([false, true])("should block errors only with onError=%s", async (onError) => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const { result } = renderHook(usePolicyFixture, {
      wrapper: createPolicyWrapper(client),
      initialProps: {
        client,
        queryFn: () => Promise.reject(new Error("Failed")),
        config: { ...config, onError, reasonOnError: "Error" },
      },
    });

    await waitFor(() => {
      expect(result.current.query.isError).toBe(true);
      expect(result.current.infinite.isError).toBe(true);
      expect(result.current.collection[0].isError).toBe(true);
    });
    expect(result.current.reasons).toEqual(onError ? [["Error"], ["Error"], ["Error"]] : available);
  });
});
