import {
  UIBlockingProvider,
  uiBlockingStoreApi,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type ReactNode, useLayoutEffect, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createDeferred, createWrapper } from "../../test/test.utils";
import { useBlockingMutation } from "../useBlockingMutation";
import { createMutationErrorBoundary } from "./mutationErrorBoundary.test.utils";
import type {
  MutationBlockingConfig,
  UseBlockingMutationOptions,
} from "../useBlockingMutation.types";

function blockers(scope = "lifetime") {
  const { getBlockingInfo } = uiBlockingStoreApi.getState();

  return getBlockingInfo(scope);
}

describe("mutation execution lifetime", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  const methods: Array<"mutate" | "mutateAsync"> = ["mutate", "mutateAsync"];

  it.each(methods)(
    "should protect A after B settles first through %s and preserve latest results",
    async (method) => {
      const a = createDeferred<string>();
      const b = createDeferred<string>();
      const { result } = renderHook(
        () =>
          useBlockingMutation({
            mutationFn: (name: string) => (name === "A" ? a.promise : b.promise),
            blockingConfig: { scope: "lifetime" },
          }),
        { wrapper: createWrapper() }
      );
      let first: Promise<string> | void;
      let second: Promise<string> | void;

      act(() => {
        first = result.current[method]("A");
        second = result.current[method]("B");
      });
      await waitFor(() => expect(blockers()).toHaveLength(1));
      await act(async () => {
        b.resolve("B");
        await second;
      });
      await waitFor(() => expect(result.current.data).toBe("B"));
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        a.resolve("A");
        await first;
      });
      await waitFor(() => expect(blockers()).toHaveLength(0));
      expect(result.current.data).toBe("B");
    }
  );
  it("should apply current configuration and retain pending work through reset and detach", async () => {
    const work = createDeferred<string>();
    const initialProps: MutationBlockingConfig = {
      scope: "lifetime",
      timeout: 500,
      reason: "First",
      priority: 60,
    };
    const { result, rerender, unmount } = renderHook(
      (blockingConfig) => useBlockingMutation({ mutationFn: () => work.promise, blockingConfig }),
      { initialProps, wrapper: createWrapper() }
    );
    let promise: Promise<string> = Promise.resolve("");

    act(() => {
      promise = result.current.mutateAsync(undefined);
    });
    await waitFor(() => expect(blockers()).toHaveLength(1));
    rerender({ scope: "updated", reason: "Current" });
    expect(blockers()).toHaveLength(0);
    expect(blockers("updated")).toHaveLength(1);
    expect(blockers("updated")[0]).toMatchObject({
      reason: "Current",
      priority: 30,
      timeout: undefined,
    });
    act(() => result.current.reset());
    await waitFor(() => expect(result.current.isIdle).toBe(true));
    expect(blockers("updated")).toHaveLength(1);
    unmount();
    expect(blockers("updated")).toHaveLength(1);
    await act(async () => {
      work.resolve("finished");
      await promise;
    });
    expect(blockers("updated")).toHaveLength(0);
  });

  it("should expire one episode without reviving it for rerenders or additional calls", async () => {
    vi.useFakeTimers();
    try {
      const work = createDeferred<string>();
      const onTimeout = vi.fn();
      const initialProps: MutationBlockingConfig = { scope: "lifetime", timeout: 50, onTimeout };
      const { result, rerender, unmount } = renderHook(
        (blockingConfig) => useBlockingMutation({ mutationFn: () => work.promise, blockingConfig }),
        { initialProps, wrapper: createWrapper() }
      );
      let first: Promise<string> = Promise.resolve("");
      let second: Promise<string> = Promise.resolve("");

      act(() => {
        first = result.current.mutateAsync(undefined);
      });
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(blockers()).toHaveLength(0);
      expect(onTimeout).toHaveBeenCalledOnce();
      rerender({ scope: "lifetime", timeout: 100, onTimeout, reason: "Changed" });
      act(() => {
        second = result.current.mutateAsync(undefined);
        result.current.reset();
      });
      expect(blockers()).toHaveLength(0);
      await act(async () => {
        work.resolve("done");
        await Promise.all([first, second]);
      });
      act(() => {
        result.current.mutate(undefined);
      });
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
      expect(blockers()).toHaveLength(0);
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("should retain only the latest attached error and remove it on reset or detach", async () => {
    const old = createDeferred<string>();
    const latest = createDeferred<string>();
    const config: MutationBlockingConfig = {
      scope: "lifetime",
      onError: true,
      reasonOnPending: "Pending",
      reasonOnError: "Error",
    };
    const { result, unmount } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: (name: string) => (name === "old" ? old.promise : latest.promise),
          blockingConfig: config,
        }),
      { wrapper: createWrapper() }
    );
    let first: Promise<unknown> = Promise.resolve();
    let second: Promise<unknown> = Promise.resolve();

    act(() => {
      first = result.current.mutateAsync("old").catch(() => undefined);
      second = result.current.mutateAsync("latest").catch(() => undefined);
    });
    await act(async () => {
      latest.reject(new Error("latest"));
      await second;
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(blockers()).toHaveLength(1);
    expect(blockers()[0]?.reason).toBe("Pending");
    await act(async () => {
      old.resolve("old");
      await first;
    });
    expect(blockers()).toHaveLength(1);
    expect(blockers()[0]?.reason).toBe("Error");
    act(() => result.current.reset());
    await waitFor(() => expect(result.current.isIdle).toBe(true));
    expect(blockers()).toHaveLength(0);
    act(() => result.current.mutate("latest"));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(blockers()).toHaveLength(1);
    unmount();
    expect(blockers()).toHaveLength(0);
  });

  it("should preserve callback completion, native suppression and ignored per-call promises", async () => {
    const work = createDeferred<string>();
    const callback = createDeferred<void>();
    const perCall = createDeferred<void>();
    const onSuccess = vi.fn(() => callback.promise);
    const callSuccess = vi.fn(() => perCall.promise);
    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: () => work.promise,
          onSuccess,
          blockingConfig: { scope: "lifetime" },
        }),
      { wrapper: createWrapper() }
    );
    let promise: Promise<string> = Promise.resolve("");

    act(() => {
      // Native Query ignores promises returned by per-call callbacks.
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      promise = result.current.mutateAsync(undefined, { onSuccess: callSuccess });
    });
    await act(async () => {
      work.resolve("data");
    });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce());
    expect(blockers()).toHaveLength(1);
    await act(async () => {
      callback.resolve();
      expect(await promise).toBe("data");
    });
    expect(callSuccess).toHaveBeenCalledOnce();
    expect(blockers()).toHaveLength(0);
    perCall.resolve();
  });

  it("should preserve detached invocation and release rejected callbacks without new error protection", async () => {
    const work = createDeferred<string>();
    const error = new Error("callback failed");
    const onSettled = vi.fn(() => {
      throw error;
    });
    const perCall = vi.fn();
    const { result, unmount } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: () => work.promise,
          onSettled,
          blockingConfig: { scope: "lifetime", onError: true },
        }),
      { wrapper: createWrapper() }
    );
    const retained = result.current.mutateAsync;

    unmount();

    const promise = retained(undefined, { onSuccess: perCall }).catch(
      (failure: unknown) => failure
    );

    expect(blockers()).toHaveLength(1);
    work.resolve("data");
    expect(await promise).toBe(error);
    expect(onSettled).toHaveBeenCalled();
    expect(perCall).not.toHaveBeenCalled();
    expect(blockers()).toHaveLength(0);
  });

  it("should retain old-provider work independently of a replacement provider", async () => {
    const client = new QueryClient();
    let replaceProvider: VoidFunction = () => undefined;

    function Wrapper({ children }: { children: ReactNode }) {
      const [key, setKey] = useState(0);

      replaceProvider = () => setKey((value) => value + 1);

      return (
        <QueryClientProvider client={client}>
          <UIBlockingProvider key={key}>{children}</UIBlockingProvider>
        </QueryClientProvider>
      );
    }

    const work = createDeferred<string>();
    const hook = renderHook(
      () => ({
        store: useUIBlockingContext(),
        mutation: useBlockingMutation({
          mutationFn: () => work.promise,
          blockingConfig: { scope: "lifetime" },
        }),
      }),
      { wrapper: Wrapper }
    );
    const originalStore = hook.result.current.store;
    const { getBlockingInfo: originalInfo } = originalStore.getState();
    let first: Promise<string> = Promise.resolve("");

    act(() => {
      first = hook.result.current.mutation.mutateAsync(undefined);
    });
    expect(originalInfo("lifetime")).toHaveLength(1);
    act(replaceProvider);

    const { getBlockingInfo: newInfo } = hook.result.current.store.getState();

    expect(originalInfo("lifetime")).toHaveLength(1);
    expect(newInfo("lifetime")).toHaveLength(0);

    let second: Promise<string> = Promise.resolve("");

    act(() => {
      second = hook.result.current.mutation.mutateAsync(undefined);
    });
    expect(newInfo("lifetime")).toHaveLength(1);
    await act(async () => {
      work.resolve("done");
      await Promise.all([first, second]);
    });
    expect(originalInfo("lifetime")).toHaveLength(0);
    expect(newInfo("lifetime")).toHaveLength(0);
    hook.unmount();
  });

  it("should reset native observation on a key change without borrowing an old rejection", async () => {
    const work = createDeferred<string>();
    const { result, rerender } = renderHook(
      (key: string) =>
        useBlockingMutation({
          mutationKey: [key],
          mutationFn: () => work.promise,
          blockingConfig: { scope: "lifetime", onError: true },
        }),
      { initialProps: "first", wrapper: createWrapper() }
    );
    let promise: Promise<unknown> = Promise.resolve();

    act(() => {
      promise = result.current.mutateAsync(undefined).catch(() => undefined);
    });
    await waitFor(() => expect(result.current.isPending).toBe(true));
    rerender("second");
    await waitFor(() => expect(result.current.isIdle).toBe(true));
    expect(blockers()).toHaveLength(1);
    await act(async () => {
      work.reject(new Error("old failure"));
      await promise;
    });
    expect(result.current.isIdle).toBe(true);
    expect(blockers()).toHaveLength(0);
  });

  it("should include cache and option callback phases while preserving their arguments", async () => {
    const phases = Array.from({ length: 5 }, () => createDeferred<void>());
    const events: Array<string> = [];
    const waitAt = async (name: string, index: number) => {
      events.push(name);
      await phases[index]?.promise;
    };
    const client = new QueryClient({
      mutationCache: new MutationCache({
        onMutate: () => waitAt("cache mutate", 0),
        onSuccess: () => waitAt("cache success", 2),
        onSettled: () => waitAt("cache settled", 4),
      }),
    });
    const onSuccess = vi.fn(() => waitAt("option success", 3));
    const { result } = renderHook(() =>
      useBlockingMutation(
        {
          mutationFn: (variable: number) => Promise.resolve(String(variable)),
          onMutate: async () => {
            await waitAt("option mutate", 1);

            return { previous: 1 };
          },
          onSuccess,
          blockingConfig: { scope: "lifetime" },
        },
        client
      )
    );
    let promise: Promise<string> = Promise.resolve("");

    act(() => {
      promise = result.current.mutateAsync(42);
    });

    const names = [
      "cache mutate",
      "option mutate",
      "cache success",
      "option success",
      "cache settled",
    ];

    for (const [index, name] of names.entries()) {
      await waitFor(() => expect(events[index]).toBe(name));
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        phases[index]?.resolve();
      });
    }
    await act(async () => {
      expect(await promise).toBe("42");
    });
    expect(onSuccess.mock.calls[0]).toEqual([
      "42",
      42,
      { previous: 1 },
      expect.objectContaining({ client }),
    ]);
    expect(blockers()).toHaveLength(0);
  });

  it("should retain paused and queued calls and isolate independently mounted clients sharing a cache", async () => {
    const cache = new MutationCache();
    const firstClient = new QueryClient({ mutationCache: cache });
    const secondClient = new QueryClient({ mutationCache: cache });
    const a = createDeferred<string>();
    const b = createDeferred<string>();
    const mutationFn = vi.fn((name: string) => (name === "A" ? a.promise : b.promise));
    const first = renderHook(() =>
      useBlockingMutation(
        {
          mutationKey: ["same"],
          scope: { id: "serial" },
          mutationFn,
          blockingConfig: { scope: "lifetime" },
        },
        firstClient
      )
    );
    const second = renderHook(() =>
      useBlockingMutation(
        {
          mutationKey: ["same"],
          scope: { id: "serial" },
          mutationFn,
          blockingConfig: { scope: "lifetime" },
        },
        secondClient
      )
    );

    onlineManager.setOnline(false);
    try {
      let one: Promise<string> = Promise.resolve("");
      let two: Promise<string> = Promise.resolve("");

      act(() => {
        one = first.result.current.mutateAsync("A");
        two = second.result.current.mutateAsync("B");
      });
      await waitFor(() => expect(first.result.current.isPaused).toBe(true));
      expect(blockers()).toHaveLength(2);
      expect(mutationFn).not.toHaveBeenCalled();
      onlineManager.setOnline(true);
      void firstClient.resumePausedMutations();
      await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(1));
      expect(second.result.current.isPaused).toBe(true);
      await act(async () => {
        a.resolve("A");
        await one;
      });
      await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(2));
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        b.resolve("B");
        await two;
      });
      expect(blockers()).toHaveLength(0);
    } finally {
      onlineManager.setOnline(true);
      first.unmount();
      second.unmount();
    }
  });

  it("should keep native client binding until remount and preserve stable function identities", async () => {
    const firstClient = new QueryClient();
    const secondClient = new QueryClient();
    const seenClients: Array<QueryClient> = [];
    const mutationFn = (value: number, context: { client: QueryClient }) => {
      seenClients.push(context.client);

      return Promise.resolve(value);
    };
    const hook = renderHook(
      (client: QueryClient) =>
        useBlockingMutation({ mutationFn, blockingConfig: { scope: "lifetime" } }, client),
      { initialProps: firstClient }
    );
    const initial = hook.result.current;

    hook.rerender(secondClient);
    expect(hook.result.current.mutate).toBe(initial.mutate);
    expect(hook.result.current.mutateAsync).toBe(initial.mutateAsync);
    expect(hook.result.current.reset).toBe(initial.reset);
    await act(async () => {
      expect(await hook.result.current.mutateAsync(1)).toBe(1);
    });
    hook.unmount();

    const remounted = renderHook(() =>
      useBlockingMutation({ mutationFn, blockingConfig: { scope: "lifetime" } }, secondClient)
    );

    await act(async () => {
      expect(await remounted.result.current.mutateAsync(2)).toBe(2);
    });
    expect(seenClients).toEqual([firstClient, secondClient]);
    remounted.unmount();
  });

  it("should keep an expired episode through pending-to-error and rearm only after reset", async () => {
    vi.useFakeTimers();
    try {
      const work = createDeferred<string>();
      const onTimeout = vi.fn();
      const hook = renderHook(
        () =>
          useBlockingMutation({
            mutationFn: () => work.promise,
            blockingConfig: { scope: "lifetime", timeout: 50, onTimeout, onError: true },
          }),
        { wrapper: createWrapper() }
      );
      let completion: Promise<unknown> = Promise.resolve();

      act(() => {
        completion = hook.result.current.mutateAsync(undefined).catch(() => undefined);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(onTimeout).toHaveBeenCalledOnce();
      await act(async () => {
        work.reject(new Error("failed"));
        await completion;
        await vi.advanceTimersByTimeAsync(0);
      });
      expect(hook.result.current.isError).toBe(true);
      expect(blockers()).toHaveLength(0);
      hook.rerender();
      expect(blockers()).toHaveLength(0);
      act(() => {
        hook.result.current.reset();
        hook.result.current.mutate(undefined);
      });
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        await vi.advanceTimersByTimeAsync(50);
      });
      expect(onTimeout).toHaveBeenCalledTimes(2);
      hook.unmount();
    } finally {
      vi.useRealTimers();
    }
  });

  it("should preserve native callback suppression for consecutive calls and callback reentrancy", async () => {
    const a = createDeferred<string>();
    const b = createDeferred<string>();
    const c = createDeferred<string>();
    const firstCallback = vi.fn();
    const latestCallback = vi.fn();
    let startC: VoidFunction = () => undefined;
    const { result } = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: (name: string) => {
            if (name === "A") {
              return a.promise;
            }
            if (name === "B") {
              return b.promise;
            }

            return c.promise;
          },
          onSuccess: (_data, name) => {
            if (name === "B") {
              startC();
            }
          },
          blockingConfig: { scope: "lifetime" },
        }),
      { wrapper: createWrapper() }
    );
    const { observeBlockingEvents } = uiBlockingStoreApi.getState();
    const removed = vi.fn();
    const release = observeBlockingEvents(({ action }) => {
      if (action === "remove") {
        removed();
      }
    });
    let first: Promise<string> = Promise.resolve("");
    let second: Promise<string> = Promise.resolve("");
    let third: Promise<string> = Promise.resolve("");

    startC = () => {
      third = result.current.mutateAsync("C");
    };
    act(() => {
      first = result.current.mutateAsync("A", { onSuccess: firstCallback });
      second = result.current.mutateAsync("B", { onSuccess: latestCallback });
    });
    await act(async () => {
      b.resolve("B");
      await second;
    });
    expect(blockers()).toHaveLength(1);
    expect(removed).not.toHaveBeenCalled();
    await act(async () => {
      a.resolve("A");
      await first;
    });
    expect(blockers()).toHaveLength(1);
    expect(firstCallback).not.toHaveBeenCalled();
    expect(latestCallback).not.toHaveBeenCalled();
    await act(async () => {
      c.resolve("C");
      await third;
    });
    expect(removed).toHaveBeenCalledOnce();
    expect(blockers()).toHaveLength(0);
    release();
  });

  it("should honor reactive deadlines and frozen detached configuration", async () => {
    vi.useFakeTimers();
    try {
      const work = createDeferred<string>();
      const firstTimeout = vi.fn();
      const lastTimeout = vi.fn();
      const initialProps: MutationBlockingConfig = {
        scope: "lifetime",
        timeout: 50,
        onTimeout: firstTimeout,
      };
      const hook = renderHook(
        (blockingConfig) => useBlockingMutation({ mutationFn: () => work.promise, blockingConfig }),
        { initialProps, wrapper: createWrapper({ strictMode: true }) }
      );
      let promise: Promise<string> = Promise.resolve("");

      act(() => {
        promise = hook.result.current.mutateAsync(undefined);
      });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30);
      });
      hook.rerender({ scope: "lifetime", timeout: 100, onTimeout: lastTimeout, reason: "Current" });
      await act(async () => {
        await vi.advanceTimersByTimeAsync(90);
      });
      expect(blockers()).toHaveLength(1);
      hook.rerender({
        scope: "lifetime",
        timeout: 100,
        onTimeout: lastTimeout,
        reason: "Detached",
      });
      hook.unmount();
      expect(blockers()[0]?.reason).toBe("Detached");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(10);
      });
      expect(firstTimeout).not.toHaveBeenCalled();
      expect(lastTimeout).toHaveBeenCalledOnce();
      expect(blockers()).toHaveLength(0);
      work.resolve("done");
      await promise;
    } finally {
      vi.useRealTimers();
    }
  });

  it("should retain protection during retry and awaited error callbacks", async () => {
    const recovery = createDeferred<string>();
    const errorCallback = createDeferred<void>();
    const failure = new Error("failure");
    const mutationFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(failure)
      .mockImplementation(() => recovery.promise);
    const onError = vi.fn(() => errorCallback.promise);
    const hook = renderHook(
      () =>
        useBlockingMutation({
          mutationFn,
          retry: 1,
          retryDelay: 0,
          onError,
          blockingConfig: { scope: "lifetime" },
        }),
      { wrapper: createWrapper() }
    );
    let promise: Promise<unknown> = Promise.resolve();

    act(() => {
      promise = hook.result.current.mutateAsync(undefined).catch((error: unknown) => error);
    });
    await waitFor(() => expect(mutationFn).toHaveBeenCalledTimes(2));
    expect(blockers()).toHaveLength(1);
    await act(async () => {
      recovery.reject(failure);
    });
    await waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(blockers()).toHaveLength(1);
    await act(async () => {
      errorCallback.resolve();
      expect(await promise).toBe(failure);
    });
    expect(blockers()).toHaveLength(0);
  });
  it("should follow native delegation order when blocker observation starts another call", async () => {
    const a = createDeferred<string>();
    const b = createDeferred<string>();
    const hook = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: (name: string) => (name === "A" ? a.promise : b.promise),
          blockingConfig: { scope: "lifetime", onError: true, reasonOnError: "Latest error" },
        }),
      { wrapper: createWrapper() }
    );
    const { observeBlockingEvents } = uiBlockingStoreApi.getState();
    let nested: Promise<string> = Promise.resolve("");
    let started = false;
    const release = observeBlockingEvents(({ action }) => {
      if (action === "add" && !started) {
        started = true;
        nested = hook.result.current.mutateAsync("B");
      }
    });
    let outer: Promise<unknown> = Promise.resolve();

    act(() => {
      outer = hook.result.current.mutateAsync("A").catch(() => undefined);
    });
    await act(async () => {
      b.resolve("B");
      await nested;
    });
    await act(async () => {
      a.reject(new Error("A"));
      await outer;
    });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(blockers()).toHaveLength(1);
    expect(blockers()[0]?.reason).toBe("Latest error");
    release();
    hook.unmount();
  });

  it("should not emit redundant blocker changes for equivalent committed configurations", async () => {
    const work = createDeferred<string>();
    const hook = renderHook(
      () =>
        useBlockingMutation({
          mutationFn: () => work.promise,
          blockingConfig: { scope: ["lifetime", "other"] },
        }),
      { wrapper: createWrapper() }
    );
    let promise: Promise<string> = Promise.resolve("");

    act(() => {
      promise = hook.result.current.mutateAsync(undefined);
    });
    await waitFor(() => expect(hook.result.current.isPending).toBe(true));

    const { observeBlockingEvents } = uiBlockingStoreApi.getState();
    const events = vi.fn();
    const release = observeBlockingEvents(events);

    hook.rerender();
    expect(events).not.toHaveBeenCalled();
    release();
    await act(async () => {
      work.resolve("done");
      await promise;
    });
  });
  it.each(["onMutate", "onSuccess", "onError", "onSettled"])(
    "should release ownership after a throwing %s callback",
    async (phase) => {
      const failure = new Error(phase);
      const callback = vi.fn(() => {
        throw failure;
      });
      const mutationFn = () => {
        if (phase === "onError") {
          return Promise.reject(new Error("request failed"));
        }

        return Promise.resolve("done");
      };
      const hook = renderHook(
        () =>
          useBlockingMutation({
            mutationFn,
            [phase]: callback,
            blockingConfig: { scope: "lifetime" },
          }),
        { wrapper: createWrapper() }
      );
      let promise: Promise<unknown> = Promise.resolve();

      act(() => {
        promise = hook.result.current.mutateAsync(undefined).catch((error: unknown) => error);
      });
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        expect(await promise).toBe(failure);
      });
      expect(callback).toHaveBeenCalled();
      expect(blockers()).toHaveLength(0);
      act(() => {
        expect(hook.result.current.mutate(undefined)).toBeUndefined();
      });
      await waitFor(() => expect(blockers()).toHaveLength(0));
      hook.unmount();
    }
  );

  it("should cancel a removed timeout and use latest committed callback on detach", async () => {
    vi.useFakeTimers();
    try {
      const work = createDeferred<string>();
      const onTimeout = vi.fn();
      const initialProps: MutationBlockingConfig = { scope: "lifetime", timeout: 30, onTimeout };
      const hook = renderHook(
        (blockingConfig) => useBlockingMutation({ mutationFn: () => work.promise, blockingConfig }),
        { initialProps, wrapper: createWrapper() }
      );
      let promise: Promise<string> = Promise.resolve("");

      act(() => {
        promise = hook.result.current.mutateAsync(undefined);
      });
      hook.rerender({ scope: "lifetime" });
      hook.unmount();
      await vi.advanceTimersByTimeAsync(100);
      expect(onTimeout).not.toHaveBeenCalled();
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        work.resolve("done");
        await promise;
      });
      expect(blockers()).toHaveLength(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("should use the committed configuration when an earlier sibling starts work in a layout effect", async () => {
    const work = createDeferred<string>();
    const client = new QueryClient();
    let invoke: VoidFunction = () => undefined;
    let shouldInvoke = false;
    let reasonAtInvocation: string | undefined;
    let completion: Promise<string> = Promise.resolve("");

    function EarlierSibling() {
      useLayoutEffect(() => {
        if (shouldInvoke) {
          invoke();
          reasonAtInvocation = blockers("updated")[0]?.reason;
        }
      });

      return null;
    }
    function Wrapper({ children }: { children: ReactNode }) {
      return (
        <QueryClientProvider client={client}>
          <EarlierSibling />
          {children}
        </QueryClientProvider>
      );
    }

    const initialProps: MutationBlockingConfig = { scope: "lifetime", reason: "Old" };
    const hook = renderHook(
      (blockingConfig) => useBlockingMutation({ mutationFn: () => work.promise, blockingConfig }),
      { initialProps, wrapper: Wrapper }
    );
    const retained = hook.result.current.mutateAsync;

    invoke = () => {
      completion = retained(undefined);
    };
    shouldInvoke = true;
    hook.rerender({ scope: "updated", reason: "Current" });
    shouldInvoke = false;
    expect(reasonAtInvocation).toBe("Current");
    await act(async () => {
      work.resolve("done");
      await completion;
    });
  });
  it("should preserve a replacement call started by observing reset cleanup", async () => {
    const failure = new Error("failed");
    const replacement = createDeferred<string>();
    const mutationFn = vi
      .fn<() => Promise<string>>()
      .mockRejectedValueOnce(failure)
      .mockImplementation(() => replacement.promise);
    const hook = renderHook(
      () =>
        useBlockingMutation({ mutationFn, blockingConfig: { scope: "lifetime", onError: true } }),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      await hook.result.current.mutateAsync(undefined).catch(() => undefined);
    });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));

    const { observeBlockingEvents } = uiBlockingStoreApi.getState();
    let started = false;
    let next: Promise<unknown> = Promise.resolve();
    const release = observeBlockingEvents(({ action }) => {
      if (action === "remove" && !started) {
        started = true;
        next = hook.result.current.mutateAsync(undefined).catch(() => undefined);
      }
    });

    act(() => {
      hook.result.current.reset();
    });
    await waitFor(() => expect(hook.result.current.isPending).toBe(true));
    await act(async () => {
      replacement.reject(failure);
      await next;
    });
    await waitFor(() => expect(hook.result.current.isError).toBe(true));
    expect(blockers()).toHaveLength(1);
    release();
    hook.unmount();
  });
  it.each(methods)(
    "should clean up and preserve a synchronous delegation failure through %s",
    async (method) => {
      const client = new QueryClient();
      const failure = new Error("cache subscriber failed");
      const mutationFn = vi.fn(() => Promise.resolve("recovered"));
      const hook = renderHook(() =>
        useBlockingMutation({ mutationFn, blockingConfig: { scope: "lifetime" } }, client)
      );
      const release = client.getMutationCache().subscribe((event) => {
        if (event.type === "added") {
          throw failure;
        }
      });

      act(() => {
        expect(() => hook.result.current[method](undefined)).toThrow(failure);
      });

      expect(blockers()).toHaveLength(0);
      expect(mutationFn).not.toHaveBeenCalled();

      release();

      await act(async () => {
        hook.result.current.mutate(undefined);
      });
      await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));

      expect(blockers()).toHaveLength(0);

      hook.unmount();
      client.clear();
    }
  );
  it("should keep independent native observers isolated when they share a client and store", async () => {
    const client = new QueryClient();
    const oldWork = createDeferred<string>();
    const currentWork = createDeferred<string>();
    const first = renderHook(() =>
      useBlockingMutation(
        {
          mutationKey: ["same"],
          mutationFn: () => oldWork.promise,
          blockingConfig: { scope: "lifetime", onError: true },
        },
        client
      )
    );
    const second = renderHook(() =>
      useBlockingMutation(
        {
          mutationKey: ["same"],
          mutationFn: () => currentWork.promise,
          blockingConfig: { scope: "lifetime", onError: true, reasonOnError: "Current error" },
        },
        client
      )
    );
    const retained = first.result.current.mutateAsync;

    first.unmount();

    let current: Promise<unknown> = Promise.resolve();
    let old: Promise<string> = Promise.resolve("");

    act(() => {
      current = second.result.current.mutateAsync(undefined).catch(() => undefined);
      old = retained(undefined);
    });

    await act(async () => {
      currentWork.reject(new Error("current failed"));
      await current;
    });

    await waitFor(() => expect(second.result.current.isError).toBe(true));

    expect(blockers()).toHaveLength(2);

    await act(async () => {
      oldWork.resolve("old succeeded");
      await old;
    });

    expect(second.result.current.isError).toBe(true);
    expect(blockers()).toHaveLength(1);
    expect(blockers()[0]?.reason).toBe("Current error");

    act(() => second.result.current.reset());

    await waitFor(() => expect(second.result.current.isIdle).toBe(true));

    expect(blockers()).toHaveLength(0);

    second.unmount();
    client.clear();
  });
  it.each(methods)(
    "should retain the native observed error when a later %s delegation throws",
    async (method) => {
      const client = new QueryClient();
      const observedError = new Error("observed failure");
      const delegationError = new Error("cache build failed");
      const hook = renderHook(() =>
        useBlockingMutation(
          {
            mutationFn: () => Promise.reject(observedError),
            blockingConfig: { scope: "lifetime", onError: true, reasonOnError: "Observed error" },
          },
          client
        )
      );

      await act(async () => {
        await hook.result.current.mutateAsync(undefined).catch(() => undefined);
      });
      await waitFor(() => expect(hook.result.current.error).toBe(observedError));
      expect(blockers()).toHaveLength(1);

      const release = client.getMutationCache().subscribe((event) => {
        if (event.type === "added") {
          throw delegationError;
        }
      });

      act(() => {
        expect(() => hook.result.current[method](undefined)).toThrow(delegationError);
      });
      expect(hook.result.current.error).toBe(observedError);
      expect(blockers()).toHaveLength(1);
      expect(blockers()[0]?.reason).toBe("Observed error");
      release();
      act(() => hook.result.current.reset());
      await waitFor(() => expect(hook.result.current.isIdle).toBe(true));
      expect(blockers()).toHaveLength(0);
      hook.unmount();
      client.clear();
    }
  );

  it("should not reinterpret a detached pending result after synchronous delegation failure", async () => {
    const client = new QueryClient();
    const work = createDeferred<string>();
    const hook = renderHook(() =>
      useBlockingMutation(
        { mutationFn: () => work.promise, blockingConfig: { scope: "lifetime", onError: true } },
        client
      )
    );
    let pending: Promise<unknown> = Promise.resolve();

    act(() => {
      pending = hook.result.current.mutateAsync(undefined).catch(() => undefined);
    });
    await waitFor(() => expect(hook.result.current.isPending).toBe(true));

    const failure = new Error("build failed");
    const release = client.getMutationCache().subscribe((event) => {
      if (event.type === "added") {
        throw failure;
      }
    });

    act(() => {
      expect(() => hook.result.current.mutateAsync(undefined)).toThrow(failure);
    });
    expect(blockers()).toHaveLength(1);
    release();
    await act(async () => {
      work.reject(new Error("detached pending failed"));
      await pending;
    });
    expect(hook.result.current.isPending).toBe(true);
    expect(hook.result.current.error).toBeNull();
    expect(blockers()).toHaveLength(0);
    hook.unmount();
    client.clear();
  });
  it.each(methods)(
    "should follow the native observer when a cache added notification starts a nested call through %s",
    async (method) => {
      const client = new QueryClient();
      const a = createDeferred<string>();
      const b = createDeferred<string>();
      const hook = renderHook(() =>
        useBlockingMutation(
          {
            mutationFn: (name: string) => (name === "A" ? a.promise : b.promise),
            blockingConfig: { scope: "lifetime", onError: true },
          },
          client
        )
      );
      let nested: Promise<unknown> = Promise.resolve();
      let started = false;
      const release = client.getMutationCache().subscribe((event) => {
        if (event.type === "added" && !started) {
          started = true;
          nested = hook.result.current.mutateAsync("B").catch(() => undefined);
        }
      });
      let outer: Promise<string> | void;

      act(() => {
        outer = hook.result.current[method]("A");
      });
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        b.reject(new Error("B failed"));
        await nested;
      });
      await waitFor(() => expect(hook.result.current.variables).toBe("A"));
      expect(hook.result.current.isPending).toBe(true);
      expect(blockers()).toHaveLength(1);
      await act(async () => {
        a.resolve("A succeeded");
        await outer;
      });
      await waitFor(() => expect(hook.result.current.data).toBe("A succeeded"));
      expect(hook.result.current.isSuccess).toBe(true);
      expect(blockers()).toHaveLength(0);
      release();
      hook.unmount();
      client.clear();
    }
  );

  it.each(["predicate", "client-default"])(
    "should preserve native throwOnError behavior from %s",
    async (source) => {
      const failure = new Error("throw to boundary");
      const client = new QueryClient();
      let throwOnError: ((error: Error) => boolean) | undefined;

      if (source === "client-default") {
        client.setDefaultOptions({ mutations: { throwOnError: true } });
      } else {
        throwOnError = (error) => error === failure;
      }

      const onBoundaryError = vi.fn();
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

      try {
        const options: UseBlockingMutationOptions = {
          mutationFn: () => Promise.reject(failure),
          blockingConfig: { scope: "lifetime", onError: true },
        };

        if (throwOnError) {
          options.throwOnError = throwOnError;
        }

        const hook = renderHook(() => useBlockingMutation(options, client), {
          wrapper: createMutationErrorBoundary(onBoundaryError),
        });

        await act(async () => {
          await hook.result.current.mutateAsync(undefined).catch(() => undefined);
        });
        await waitFor(() => expect(onBoundaryError).toHaveBeenCalledWith(failure));
        expect(blockers()).toHaveLength(0);
        hook.unmount();
      } finally {
        consoleError.mockRestore();
        client.clear();
      }
    }
  );
  it("should preserve non-Error mutation values thrown to an error boundary", async () => {
    const failure: unknown = "native string failure";
    const client = new QueryClient();
    const onBoundaryError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    async function mutationFn(): Promise<string> {
      throw failure;
    }

    try {
      const hook = renderHook(
        () =>
          useBlockingMutation<string, string>(
            { mutationFn, throwOnError: true, blockingConfig: { scope: "lifetime" } },
            client
          ),
        { wrapper: createMutationErrorBoundary(onBoundaryError) }
      );

      await act(async () => {
        await hook.result.current.mutateAsync(undefined).catch(() => undefined);
      });
      await waitFor(() => expect(onBoundaryError).toHaveBeenCalledWith(failure));
      expect(blockers()).toHaveLength(0);
      hook.unmount();
    } finally {
      consoleError.mockRestore();
      client.clear();
    }
  });
});
