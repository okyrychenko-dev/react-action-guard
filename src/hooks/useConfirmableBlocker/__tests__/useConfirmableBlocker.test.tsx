import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useUIBlockingStore } from "../../../store";
import { actAsync } from "../../__tests__/test.utils";
import { useConfirmableBlocker } from "../useConfirmableBlocker";

describe("useConfirmableBlocker", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
  });

  it("should not block initially", () => {
    renderHook(() =>
      useConfirmableBlocker("test-blocker", {
        scope: "test",
        confirmMessage: "Are you sure?",
        onConfirm: vi.fn(),
      })
    );

    const { isBlocked } = useUIBlockingStore.getState();
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
    const { isBlocked } = useUIBlockingStore.getState();
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

    const { getBlockingInfo } = useUIBlockingStore.getState();
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

    const { getBlockingInfo } = useUIBlockingStore.getState();
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

    const { isBlocked: isBlockedDuring } = useUIBlockingStore.getState();
    expect(isBlockedDuring("test")).toBe(true);

    await actAsync(async () => {
      return result.current.onConfirm();
    });

    await waitFor(() => {
      const { isBlocked } = useUIBlockingStore.getState();
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

    const { isBlocked: isBlockedDuring } = useUIBlockingStore.getState();
    expect(isBlockedDuring("test")).toBe(true);

    act(() => {
      result.current.onCancel();
    });

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(false);
  });
});
