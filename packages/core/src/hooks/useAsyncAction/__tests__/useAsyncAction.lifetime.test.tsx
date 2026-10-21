import { type Optional, assertDefined } from "@okyrychenko-dev/type-utils";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UIBlockingProvider, useResolvedStoreApi } from "../../../context";
import { uiBlockingStoreApi } from "../../../store";
import { type UseAsyncActionOptions, useAsyncAction } from "../../useAsyncAction";
import { useBlockingInfo } from "../../useBlockingInfo";
import { useIsBlocked } from "../../useIsBlocked";

describe("useAsyncAction lifetime", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should capture metadata across overlapping calls and unmount", async () => {
    const firstOptions: UseAsyncActionOptions = { reason: "Зберігаємо", priority: 0 };
    const producer = renderHook(({ options }) => useAsyncAction("save", "form", options), {
      initialProps: { options: firstOptions },
    });
    const consumer = renderHook(() => ({
      info: useBlockingInfo("form"),
      blocked: useIsBlocked("form"),
    }));
    let finishFirst: Optional<VoidFunction>;
    let finishSecond: Optional<VoidFunction>;
    let firstOperation: Promise<void> = Promise.resolve();
    let secondOperation: Promise<void> = Promise.resolve();

    act(() => {
      firstOperation = producer.result.current(
        () =>
          new Promise<void>((resolve) => {
            finishFirst = resolve;
          })
      );
    });
    producer.rerender({ options: { reason: "Надсилаємо", priority: 75 } });
    act(() => {
      secondOperation = producer.result.current(
        () =>
          new Promise<void>((resolve) => {
            finishSecond = resolve;
          })
      );
    });
    expect(
      consumer.result.current.info.map(({ reason, priority }) => ({ reason, priority }))
    ).toEqual([
      { reason: "Надсилаємо", priority: 75 },
      { reason: "Зберігаємо", priority: 0 },
    ]);
    expect(consumer.result.current.info[0]?.id).not.toBe(consumer.result.current.info[1]?.id);
    producer.unmount();
    await act(async () => {
      assertDefined(finishSecond);
      finishSecond();
      await secondOperation;
    });
    expect(consumer.result.current.blocked).toBe(true);
    expect(consumer.result.current.info.map(({ reason }) => reason)).toEqual(["Зберігаємо"]);
    await act(async () => {
      assertDefined(finishFirst);
      finishFirst();
      await firstOperation;
    });
    expect(consumer.result.current.blocked).toBe(false);
    consumer.unmount();
  });

  it("should release only the captured Provider store after unmount", async () => {
    const first = renderHook(
      () => ({
        execute: useAsyncAction("save", "form", { reason: "First" }),
        store: useResolvedStoreApi(),
      }),
      { wrapper: UIBlockingProvider }
    );
    const second = renderHook(
      () => ({
        execute: useAsyncAction("save", "form", { reason: "Second" }),
        store: useResolvedStoreApi(),
      }),
      { wrapper: UIBlockingProvider }
    );
    const { store: firstStore } = first.result.current;
    const { store: secondStore } = second.result.current;
    const { isBlocked: firstBlocked } = firstStore.getState();
    const { isBlocked: secondBlocked } = secondStore.getState();
    let finishFirst: Optional<VoidFunction>;
    let finishSecond: Optional<VoidFunction>;
    const firstOperation = first.result.current.execute(
      () =>
        new Promise<void>((resolve) => {
          finishFirst = resolve;
        })
    );
    const secondOperation = second.result.current.execute(
      () =>
        new Promise<void>((resolve) => {
          finishSecond = resolve;
        })
    );

    first.unmount();
    assertDefined(finishFirst);
    finishFirst();
    await firstOperation;
    expect(firstBlocked("form")).toBe(false);
    expect(secondBlocked("form")).toBe(true);
    second.unmount();
    assertDefined(finishSecond);
    finishSecond();
    await secondOperation;
    expect(secondBlocked("form")).toBe(false);
  });

  it("should retain an in-flight blocker after caller unmount until settlement", async () => {
    const { result, unmount } = renderHook(() => useAsyncAction<void>("save", "form"));
    let finish: Optional<VoidFunction>;
    const operation = result.current(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { isBlocked } = uiBlockingStoreApi.getState();

    unmount();
    expect(isBlocked("form")).toBe(true);
    assertDefined(finish);
    finish();
    await operation;
    expect(isBlocked("form")).toBe(false);
  });

  it("should release a timed-out blocker without settling or aborting its operation", async () => {
    vi.useFakeTimers();
    try {
      const onTimeout = vi.fn();
      const { result } = renderHook(() =>
        useAsyncAction<string>("save", "form", {
          timeout: 100,
          onTimeout,
          reason: "",
          priority: 0,
        })
      );
      let finish: Optional<(value: string) => void>;
      const settled = vi.fn();
      const operation = result.current(
        () =>
          new Promise<string>((resolve) => {
            finish = resolve;
          })
      );

      void operation.then(settled);

      const { isBlocked, getBlockingInfo } = uiBlockingStoreApi.getState();

      expect(getBlockingInfo("form")[0]).toMatchObject({ reason: "", priority: 0 });
      expect(isBlocked("form")).toBe(true);
      await vi.advanceTimersByTimeAsync(100);
      expect(isBlocked("form")).toBe(false);
      expect(onTimeout).toHaveBeenCalledOnce();
      expect(settled).not.toHaveBeenCalled();
      assertDefined(finish);
      finish("saved after timeout");
      await expect(operation).resolves.toBe("saved after timeout");
      expect(isBlocked("form")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
