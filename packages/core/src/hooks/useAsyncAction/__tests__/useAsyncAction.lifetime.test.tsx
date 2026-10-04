import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { uiBlockingStoreApi } from "../../../store";
import { useAsyncAction } from "../../useAsyncAction";

describe("useAsyncAction lifetime", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should retain an in-flight blocker after caller unmount until settlement", async () => {
    const { result, unmount } = renderHook(() => useAsyncAction<void>("save", "form"));
    let finish: VoidFunction = () => undefined;
    const operation = result.current(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { isBlocked } = uiBlockingStoreApi.getState();

    unmount();
    expect(isBlocked("form")).toBe(true);
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
        })
      );
      let finish: (value: string) => void = () => undefined;
      const settled = vi.fn();
      const operation = result.current(
        () =>
          new Promise<string>((resolve) => {
            finish = resolve;
          })
      );

      void operation.then(settled);

      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked("form")).toBe(true);
      await vi.advanceTimersByTimeAsync(100);
      expect(isBlocked("form")).toBe(false);
      expect(onTimeout).toHaveBeenCalledOnce();
      expect(settled).not.toHaveBeenCalled();
      finish("saved after timeout");
      await expect(operation).resolves.toBe("saved after timeout");
      expect(isBlocked("form")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });
});
