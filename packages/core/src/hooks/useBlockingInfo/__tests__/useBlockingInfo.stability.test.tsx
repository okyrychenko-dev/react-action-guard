import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { UIBlockingProvider, useResolvedStoreApi } from "../../../context";
import { useActionBlocker, useBlockingInfo, useIsBlocked } from "../../../hooks";
import { type BlockerConfig, normalizeScope } from "../../../store";

describe("scoped metadata observation", () => {
  it("should publish scope representation changes while the blocker still matches", () => {
    const { result } = renderHook(
      () => ({
        store: useResolvedStoreApi(),
        info: useBlockingInfo("checkout"),
      }),
      { wrapper: UIBlockingProvider }
    );
    const { store } = result.current;
    const { addBlocker, updateBlocker, removeBlocker } = store.getState();

    act(() => addBlocker("save", { scope: "checkout", reason: "Saving" }));

    const original = result.current.info;

    expect(original).toHaveLength(1);
    act(() => updateBlocker("save", { scope: ["checkout", "profile"] }));

    const arrayResult = result.current.info;

    expect(arrayResult).not.toBe(original);
    expect(arrayResult[0]?.scope).toEqual(["checkout", "profile"]);
    expect(original[0]?.scope).toBe("checkout");

    act(() => updateBlocker("save", { scope: ["checkout", "inventory"] }));

    expect(result.current.info[0]?.scope).toEqual(["checkout", "inventory"]);
    expect(arrayResult[0]?.scope).toEqual(["checkout", "profile"]);

    act(() => updateBlocker("save", { scope: ["checkout"] }));

    expect(result.current.info[0]?.scope).toEqual(["checkout"]);

    act(() => updateBlocker("save", { scope: "checkout" }));

    expect(result.current.info[0]?.scope).toBe("checkout");
    expect(result.current.info).not.toBe(arrayResult);

    act(() => removeBlocker("save"));
  });

  it("should retain identical matching metadata when observation expands and follow the new scope", () => {
    const { result, rerender } = renderHook(
      ({ scope }) => ({
        store: useResolvedStoreApi(),
        info: useBlockingInfo(scope),
      }),
      { wrapper: UIBlockingProvider, initialProps: { scope: ["checkout"] } }
    );
    const { store } = result.current;
    const { addBlocker, removeBlocker } = store.getState();

    act(() => addBlocker("save", { scope: "checkout", reason: "Saving" }));

    const original = result.current.info;

    expect(original).toHaveLength(1);
    expect(original[0]?.reason).toBe("Saving");

    rerender({ scope: ["checkout", "profile"] });

    expect(result.current.info).toBe(original);

    act(() => addBlocker("profile", { scope: "profile", reason: "Updating profile" }));

    expect(result.current.info.map(({ id }) => id)).toEqual(["save", "profile"]);
    expect(original).toHaveLength(1);

    act(() => {
      removeBlocker("save");
      removeBlocker("profile");
    });
  });

  it("should retain results and skip renders on unrelated lifecycle changes", () => {
    let renders = 0;
    const { result, unmount } = renderHook(
      () => {
        const store = useResolvedStoreApi();
        const info = useBlockingInfo("checkout");
        const isBlocked = useIsBlocked("checkout");

        renders++;

        return { store, info, isBlocked };
      },
      { wrapper: UIBlockingProvider }
    );
    const { store } = result.current;
    const { addBlocker, updateBlocker, removeBlocker } = store.getState();

    act(() => addBlocker("save", { scope: "checkout", reason: "Saving" }));

    const previous = result.current.info;
    const previousRenders = renders;

    expect(previous).toHaveLength(1);
    expect(previous[0]?.reason).toBe("Saving");

    act(() => addBlocker("sync", { scope: "inventory" }));
    act(() => updateBlocker("sync", { reason: "Syncing" }));
    act(() => removeBlocker("sync"));

    expect(result.current.info).toBe(previous);
    expect(result.current.isBlocked).toBe(true);
    expect(renders).toBe(previousRenders);

    unmount();

    act(() => updateBlocker("save", { reason: "Finished" }));
    expect(renders).toBe(previousRenders);
  });

  it("should observe metadata, ties, array/global matching and removal without mutating old results", () => {
    const { result, rerender } = renderHook(
      ({ scope }) => ({
        store: useResolvedStoreApi(),
        info: useBlockingInfo(scope),
      }),
      { wrapper: UIBlockingProvider, initialProps: { scope: ["checkout", "profile"] } }
    );
    const { store } = result.current;
    const { addBlocker, updateBlocker, removeBlocker } = store.getState();
    const onTimeout = vi.fn();

    act(() => {
      addBlocker("first", {
        scope: ["checkout", "inventory"],
        reason: "Saving",
        priority: 20,
        timestamp: 2,
      });
      addBlocker("second", { scope: "profile", priority: 20, timestamp: 1 });
      addBlocker("global", { scope: ["global", "other"], priority: 10 });
    });

    const original = result.current.info;

    expect(original.map(({ id }) => id)).toEqual(["first", "second", "global"]);
    expect(Object.isFrozen(original)).toBe(true);
    expect(Object.isFrozen(original[0])).toBe(true);
    expect(Object.isFrozen(original[0]?.scope)).toBe(true);

    act(() =>
      updateBlocker("first", { reason: "Uploading", timestamp: 3, timeout: 100000, onTimeout })
    );

    expect(result.current.info[0]).toMatchObject({
      reason: "Uploading",
      timestamp: 3,
      timeout: 100000,
      onTimeout,
    });
    expect(original[0]).toMatchObject({ reason: "Saving", timestamp: 2, timeout: undefined });

    act(() => updateBlocker("second", { priority: 30 }));

    expect(result.current.info.map(({ id }) => id)).toEqual(["second", "first", "global"]);

    act(() => updateBlocker("first", { scope: "inventory" }));

    expect(result.current.info.map(({ id }) => id)).toEqual(["second", "global"]);

    act(() => updateBlocker("global", { reason: "Maintenance" }));

    expect(result.current.info[1]?.reason).toBe("Maintenance");

    act(() => removeBlocker("second"));

    expect(result.current.info.map(({ id }) => id)).toEqual(["global"]);

    rerender({ scope: [] });

    expect(result.current.info).toEqual([]);

    rerender({ scope: ["inventory"] });

    expect(result.current.info.map(({ id }) => id)).toEqual(["first", "global"]);

    act(() => removeBlocker("first"));
    act(() => removeBlocker("global"));

    expect(result.current.info).toEqual([]);
  });

  it("should retain semantically unchanged metadata and equivalent observed scope arrays", () => {
    let renders = 0;
    const { result, rerender } = renderHook(
      ({ scope }) => {
        const store = useResolvedStoreApi();
        const info = useBlockingInfo(scope);

        renders++;

        return { store, info };
      },
      { wrapper: UIBlockingProvider, initialProps: { scope: ["checkout", "profile"] } }
    );
    const { store } = result.current;
    const { addBlocker, updateBlocker, removeBlocker } = store.getState();
    const onTimeout = vi.fn();

    act(() => addBlocker("save", { scope: ["checkout", "profile"], timestamp: 1, onTimeout }));

    const previous = result.current.info;
    const previousRenders = renders;

    act(() => updateBlocker("save", { scope: ["checkout", "profile"], timestamp: 1, onTimeout }));

    expect(result.current.info).toBe(previous);
    expect(renders).toBe(previousRenders);

    rerender({ scope: ["profile", "checkout", "checkout"] });

    expect(result.current.info).toBe(previous);

    const changedCallback = vi.fn();

    act(() => updateBlocker("save", { onTimeout: changedCallback }));

    expect(result.current.info[0]?.onTimeout).toBe(changedCallback);
    expect(result.current.info).not.toBe(previous);

    act(() => removeBlocker("save"));
  });

  it("should isolate identical observed scopes across providers and release subscriptions on cleanup", () => {
    let firstRenders = 0;
    const first = renderHook(
      () => {
        const store = useResolvedStoreApi();
        const info = useBlockingInfo("checkout");

        firstRenders++;

        return { store, info };
      },
      { wrapper: UIBlockingProvider }
    );
    const second = renderHook(
      () => ({ store: useResolvedStoreApi(), info: useBlockingInfo("checkout") }),
      { wrapper: UIBlockingProvider }
    );
    const { store: firstStore } = first.result.current;
    const { store: secondStore } = second.result.current;
    const { addBlocker: addFirst, removeBlocker: removeFirst } = firstStore.getState();
    const { addBlocker: addSecond, removeBlocker: removeSecond } = secondStore.getState();

    act(() => addFirst("save", { scope: "checkout", reason: "First" }));

    const firstResult = first.result.current.info;
    const previousRenders = firstRenders;

    act(() => addSecond("save", { scope: "checkout", reason: "Second" }));

    expect(first.result.current.info).toBe(firstResult);
    expect(firstRenders).toBe(previousRenders);
    expect(second.result.current.info[0]?.reason).toBe("Second");

    first.unmount();

    act(() => removeFirst("save"));

    expect(firstRenders).toBe(previousRenders);
    expect(second.result.current.info[0]?.reason).toBe("Second");

    act(() => removeSecond("save"));

    second.unmount();
  });

  it("should observe metadata replacement when a producer omits previous configuration", () => {
    const onTimeout = vi.fn();
    const config: BlockerConfig = {
      scope: "checkout",
      reason: "Saving",
      priority: 20,
      timeout: 100000,
      onTimeout,
    };
    const { result, rerender, unmount } = renderHook(
      ({ config: currentConfig }) => {
        useActionBlocker("save", currentConfig, true);

        return useBlockingInfo("checkout");
      },
      { wrapper: UIBlockingProvider, initialProps: { config } }
    );
    const original = result.current;

    expect(original).toHaveLength(1);

    const { onTimeout: registeredOnTimeout } = original[0];

    expect(registeredOnTimeout).toBeTypeOf("function");
    expect(original[0]).toMatchObject({ timeout: 100000, onTimeout: registeredOnTimeout });

    rerender({ config: { scope: "checkout", reason: "Saving", priority: 20 } });

    expect(result.current).not.toBe(original);
    expect(result.current[0]).toMatchObject({
      reason: "Saving",
      timeout: undefined,
      onTimeout: undefined,
    });
    expect(original[0]).toMatchObject({ timeout: 100000, onTimeout: registeredOnTimeout });

    rerender({ config: { scope: "checkout" } });

    expect(result.current[0]).toMatchObject({ reason: "Unknown", priority: 0 });

    unmount();
  });

  it("should retain the hook-owned result after unrelated scope normalization activity", () => {
    const { result, rerender } = renderHook(
      () => ({
        store: useResolvedStoreApi(),
        info: useBlockingInfo("checkout"),
        arrayInfo: useBlockingInfo(["checkout", "profile"]),
      }),
      { wrapper: UIBlockingProvider }
    );
    const { store } = result.current;
    const { addBlocker, removeBlocker } = store.getState();

    act(() => addBlocker("save", { scope: "checkout", reason: "Saving" }));

    const { info: previous, arrayInfo: previousArray } = result.current;

    expect(previous).toHaveLength(1);

    act(() => addBlocker("sync", { scope: "inventory" }));
    expect(result.current.info).toBe(previous);

    for (let index = 0; index < 300; index++) {
      normalizeScope(`unrelated-${String(index)}`);
    }

    rerender();

    expect(result.current.info).toBe(previous);
    expect(result.current.arrayInfo).toBe(previousArray);

    act(() => removeBlocker("sync"));
    act(() => removeBlocker("save"));
  });
});
