import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useConfirmableBlocker } from "..";
import { uiBlockingStoreApi } from "../../../store";
import { actAsync } from "../../__tests__/test.utils";
import { useIsBlocked } from "../../useIsBlocked";

describe("useConfirmableBlocker", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should share one execution across confirmations before rerender and retain scope protection", async () => {
    let finish: VoidFunction = vi.fn();
    const action = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onConfirm = vi.fn(() => action);
    const { result } = renderHook(() => ({
      confirmation: useConfirmableBlocker("single-flight", {
        scope: "refund",
        confirmMessage: "Refund?",
        onConfirm,
      }),
      blocked: useIsBlocked("refund"),
    }));
    const outcomes: Array<Promise<void>> = [];

    act(() => {
      result.current.confirmation.execute();
    });

    await act(async () => {
      outcomes.push(result.current.confirmation.onConfirm());
      outcomes.push(result.current.confirmation.onConfirm());
      await Promise.resolve();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(true);
    expect(result.current.confirmation.isExecuting).toBe(true);

    await act(async () => {
      finish();
      expect(await Promise.all(outcomes)).toEqual([undefined, undefined]);
    });

    expect(result.current.blocked).toBe(false);
    expect(result.current.confirmation.isExecuting).toBe(false);
  });

  it("should ignore reopening and cancellation while execution is pending", async () => {
    let finish: VoidFunction = vi.fn();
    const action = new Promise<void>((resolve) => {
      finish = resolve;
    });
    const onConfirm = vi.fn(() => action);
    const onCancel = vi.fn();
    const { result } = renderHook(() => ({
      confirmation: useConfirmableBlocker("pending", {
        scope: "refund",
        confirmMessage: "Refund?",
        onConfirm,
        onCancel,
      }),
      blocked: useIsBlocked("refund"),
    }));
    const outcomes: Array<Promise<void>> = [];

    await act(async () => {
      outcomes.push(result.current.confirmation.onConfirm());
      result.current.confirmation.execute();
      result.current.confirmation.onCancel();

      await Promise.resolve();
    });

    act(() => {
      result.current.confirmation.execute();
      result.current.confirmation.onCancel();
      outcomes.push(result.current.confirmation.onConfirm());
    });

    expect(result.current.confirmation.isDialogOpen).toBe(false);
    expect(result.current.blocked).toBe(true);
    expect(onCancel).not.toHaveBeenCalled();
    expect(onConfirm).toHaveBeenCalledTimes(1);

    await act(async () => {
      finish();
      await Promise.all(outcomes);
    });

    expect(result.current.blocked).toBe(false);
  });

  it("should share rejection and allow a retry after execution settles", async () => {
    let rejectAction: (error: Error) => void = vi.fn();
    const failure = new Error("Refund failed");
    const action = new Promise<void>((_, reject) => {
      rejectAction = reject;
    });
    const onConfirm = vi.fn(() => action);
    const { result } = renderHook(() => ({
      confirmation: useConfirmableBlocker("retry", {
        scope: "refund",
        confirmMessage: "Refund?",
        onConfirm,
      }),
      blocked: useIsBlocked("refund"),
    }));

    await act(async () => {
      const first = result.current.confirmation.onConfirm();
      const second = result.current.confirmation.onConfirm();
      const outcomes = Promise.allSettled([first, second]);

      rejectAction(failure);
      expect(await outcomes).toEqual([
        { status: "rejected", reason: failure },
        { status: "rejected", reason: failure },
      ]);
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.blocked).toBe(false);
    expect(result.current.confirmation.isExecuting).toBe(false);

    onConfirm.mockResolvedValue(undefined);

    act(() => result.current.confirmation.execute());

    expect(result.current.blocked).toBe(true);

    await act(async () => {
      await result.current.confirmation.onConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(2);
    expect(result.current.blocked).toBe(false);
  });

  it("should keep separate confirmation instances independent", async () => {
    let finishFirst: VoidFunction = vi.fn();
    let finishSecond: VoidFunction = vi.fn();
    const firstAction = new Promise<void>((resolve) => {
      finishFirst = resolve;
    });
    const secondAction = new Promise<void>((resolve) => {
      finishSecond = resolve;
    });
    const firstConfirm = vi.fn(() => firstAction);
    const secondConfirm = vi.fn(() => secondAction);
    const { result } = renderHook(() => ({
      first: useConfirmableBlocker("first", {
        scope: "first",
        confirmMessage: "Confirm first?",
        onConfirm: firstConfirm,
      }),
      second: useConfirmableBlocker("second", {
        scope: "second",
        confirmMessage: "Confirm second?",
        onConfirm: secondConfirm,
      }),
      firstBlocked: useIsBlocked("first"),
      secondBlocked: useIsBlocked("second"),
    }));
    const firstOutcomes: Array<Promise<void>> = [];
    const secondOutcomes: Array<Promise<void>> = [];

    await act(async () => {
      firstOutcomes.push(result.current.first.onConfirm(), result.current.first.onConfirm());
      secondOutcomes.push(result.current.second.onConfirm(), result.current.second.onConfirm());
      await Promise.resolve();
    });

    expect(firstConfirm).toHaveBeenCalledTimes(1);
    expect(secondConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.firstBlocked).toBe(true);
    expect(result.current.secondBlocked).toBe(true);

    await act(async () => {
      finishFirst();
      await Promise.all(firstOutcomes);
    });

    expect(result.current.firstBlocked).toBe(false);
    expect(result.current.secondBlocked).toBe(true);

    await act(async () => {
      finishSecond();
      await Promise.all(secondOutcomes);
    });

    expect(result.current.secondBlocked).toBe(false);
  });

  it("should release execution ownership after a synchronous callback throws", async () => {
    const failure = new Error("Synchronous failure");
    const onConfirm = vi.fn(() => {
      throw failure;
    });
    const { result } = renderHook(() =>
      useConfirmableBlocker("sync-error", { confirmMessage: "Confirm?", onConfirm })
    );

    await act(async () => {
      await expect(result.current.onConfirm()).rejects.toBe(failure);
    });

    expect(result.current.isExecuting).toBe(false);

    await act(async () => {
      await expect(result.current.onConfirm()).rejects.toBe(failure);
    });

    expect(onConfirm).toHaveBeenCalledTimes(2);
  });

  it("should not block initially", () => {
    renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
      })
    );

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(false);
  });

  it("should block when dialog is opened", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
      })
    );

    expect(result.current.isDialogOpen).toBe(false);

    act(() => {
      result.current.execute();
    });

    expect(result.current.isDialogOpen).toBe(true);

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(true);
  });

  it("should block while executing", async () => {
    const onConfirm = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );

    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm,
      })
    );

    await actAsync(async () => {
      result.current.execute();

      return result.current.onConfirm();
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });
  });

  it("should return confirmConfig with defaults", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Delete this item?",
        onConfirm: vi.fn(),
      })
    );

    expect(result.current.confirmConfig).toEqual({
      title: "Confirm Action",
      message: "Delete this item?",
      confirmText: "Confirm",
      cancelText: "Cancel",
    });
  });

  it("should return confirmConfig with custom values", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Delete this item?",
        confirmTitle: "Delete Item",
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "No, Keep",
        onConfirm: vi.fn(),
      })
    );

    expect(result.current.confirmConfig).toEqual({
      title: "Delete Item",
      message: "Delete this item?",
      confirmText: "Yes, Delete",
      cancelText: "No, Keep",
    });
  });

  it("should call onConfirm when confirmed", async () => {
    const onConfirm = vi.fn();

    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm,
      })
    );

    await actAsync(async () => {
      result.current.execute();

      return result.current.onConfirm();
    });

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("should call onCancel when cancelled", () => {
    const onCancel = vi.fn();

    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
        onCancel,
      })
    );

    act(() => {
      result.current.execute();
      result.current.onCancel();
    });

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("should close dialog after confirmation", async () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn().mockResolvedValue(undefined),
      })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isDialogOpen).toBe(true);

    await actAsync(async () => {
      return result.current.onConfirm();
    });

    await waitFor(() => {
      expect(result.current.isDialogOpen).toBe(false);
    });
  });

  it("should close dialog after cancellation", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
      })
    );

    act(() => {
      result.current.execute();
    });

    expect(result.current.isDialogOpen).toBe(true);

    act(() => {
      result.current.onCancel();
    });

    expect(result.current.isDialogOpen).toBe(false);
  });

  it("should handle async onConfirm", async () => {
    const onConfirm = vi.fn(
      async (): Promise<void> =>
        new Promise((resolve) => {
          setTimeout(resolve, 100);
        })
    );

    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm,
      })
    );

    act(() => {
      result.current.execute();
    });

    let promise: Promise<void>;

    act(() => {
      promise = result.current.onConfirm();
    });

    // Wait for isExecuting to become true
    await waitFor(() => {
      expect(result.current.isExecuting).toBe(true);
    });

    await actAsync(async () => promise);

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });
  });

  it("should handle errors in onConfirm", async () => {
    const error = new Error("Test error");
    const onConfirm = vi.fn(async () => {
      throw error;
    });

    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm,
      })
    );

    act(() => {
      result.current.execute();
    });

    await actAsync(async () => {
      await expect(result.current.onConfirm()).rejects.toThrow(error);
    });

    await waitFor(() => {
      expect(result.current.isExecuting).toBe(false);
    });
  });

  it("should use confirm message as reason if no reason provided", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Delete this item?",
        onConfirm: vi.fn(),
      })
    );

    act(() => {
      result.current.execute();
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.reason).toBe("Delete this item?");
  });

  it("should use custom reason when provided", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Delete this item?",
        reason: "Deleting item",
        onConfirm: vi.fn(),
      })
    );

    act(() => {
      result.current.execute();
    });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();
    const info = getBlockingInfo("test");

    expect(info[0]?.reason).toBe("Deleting item");
  });

  it("should unblock after confirmation completes", async () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn().mockResolvedValue(undefined),
      })
    );

    act(() => {
      result.current.execute();
    });

    const { isBlocked: isBlockedDuring } = uiBlockingStoreApi.getState();

    expect(isBlockedDuring("test")).toBe(true);

    await actAsync(async () => {
      return result.current.onConfirm();
    });

    await waitFor(() => {
      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked("test")).toBe(false);
    });
  });

  it("should unblock after cancellation", () => {
    const { result } = renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
      })
    );

    act(() => {
      result.current.execute();
    });

    const { isBlocked: isBlockedDuring } = uiBlockingStoreApi.getState();

    expect(isBlockedDuring("test")).toBe(true);

    act(() => {
      result.current.onCancel();
    });

    const { isBlocked } = uiBlockingStoreApi.getState();

    expect(isBlocked("test")).toBe(false);
  });
});
