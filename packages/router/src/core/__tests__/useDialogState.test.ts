import { act, renderHook } from "@testing-library/react";
import { Activity, createElement, StrictMode } from "react";
import { describe, expect, it } from "vitest";
import { useDialogState } from "../useDialogState";
import type { PropsWithChildren } from "react";

describe("useDialogState", () => {
  it("should clear a pending dialog when Activity hides and support a new dialog after reveal", async () => {
    let mode: "visible" | "hidden" = "visible";
    const { result, rerender } = renderHook(() => useDialogState(), {
      wrapper: ({ children }: PropsWithChildren) => createElement(Activity, { mode, children }),
    });
    const outcomes: Array<boolean> = [];

    act(() => {
      void result.current.confirm("First").then((value) => outcomes.push(value));
    });

    const firstDialog = result.current.dialogState;

    if (!firstDialog) {
      throw new Error("Expected an open dialog");
    }

    mode = "hidden";

    rerender();

    await Promise.resolve();

    expect(outcomes).toEqual([false]);

    mode = "visible";

    rerender();

    expect(result.current.dialogState).toBeNull();

    act(() => {
      void result.current.confirm("Second").then((value) => outcomes.push(value));
      firstDialog.resolve(true);
    });

    expect(result.current.dialogState?.message).toBe("Second");

    act(() => result.current.onConfirm());

    await Promise.resolve();

    expect(outcomes).toEqual([false, true]);
    expect(result.current.dialogState).toBeNull();
  });

  it.each([true, false])("should ignore a replaced resolver settling with %s", async (value) => {
    const { result } = renderHook(() => useDialogState());
    const outcomes: Array<boolean> = [];

    act(() => {
      void result.current.confirm("First").then((outcome) => outcomes.push(outcome));
    });

    const firstDialog = result.current.dialogState;

    if (!firstDialog) {
      throw new Error("Expected an open dialog");
    }
    act(() => {
      void result.current.confirm("Second").then((outcome) => outcomes.push(outcome));
      firstDialog.resolve(value);
    });
    await Promise.resolve();
    expect(outcomes).toEqual([false]);
    expect(result.current.dialogState?.message).toBe("Second");

    act(() => result.current.onConfirm());
    await Promise.resolve();
    expect(outcomes).toEqual([false, true]);
  });

  it("should support dialogs after Strict Mode effect cleanup and deny retained controls after unmount", async () => {
    const { result, unmount } = renderHook(() => useDialogState(), { wrapper: StrictMode });
    const { confirm, onConfirm, onCancel } = result.current;
    const outcomes: Array<boolean> = [];

    act(() => {
      void confirm("Leave?").then((value) => outcomes.push(value));
    });
    expect(result.current.dialogState?.message).toBe("Leave?");
    unmount();
    onConfirm();
    onCancel();
    await Promise.resolve();
    expect(outcomes).toEqual([false]);
    await expect(confirm("After unmount")).resolves.toBe(false);
  });

  it("should deny the pending dialog on unmount", async () => {
    const { result, unmount } = renderHook(() => useDialogState());
    const settled: Array<boolean> = [];

    act(() => {
      void result.current.confirm("Leave?").then((value) => settled.push(value));
    });
    unmount();
    await Promise.resolve();
    expect(settled).toEqual([false]);
  });

  it("should close its own dialog and ignore repeated or stale resolvers", async () => {
    const { result } = renderHook(() => useDialogState());
    const outcomes: Array<boolean> = [];

    act(() => {
      void result.current.confirm("First").then((value) => outcomes.push(value));
    });

    const firstDialog = result.current.dialogState;

    if (!firstDialog) {
      throw new Error("Expected an open dialog");
    }
    act(() => firstDialog.resolve(true));
    expect(result.current.dialogState).toBeNull();

    act(() => {
      void result.current.confirm("Second").then((value) => outcomes.push(value));
      firstDialog.resolve(false);
      firstDialog.resolve(true);
    });
    await Promise.resolve();
    expect(outcomes).toEqual([true]);
    expect(result.current.dialogState?.message).toBe("Second");

    act(() => result.current.onCancel());
    await Promise.resolve();
    expect(outcomes).toEqual([true, false]);
  });

  describe("Initialization", () => {
    it("should initialize with null dialog state", () => {
      const { result } = renderHook(() => useDialogState());

      expect(result.current.dialogState).toBeNull();
    });

    it("should provide all required functions", () => {
      const { result } = renderHook(() => useDialogState());

      expect(result.current.confirm).toBeInstanceOf(Function);
      expect(result.current.onConfirm).toBeInstanceOf(Function);
      expect(result.current.onCancel).toBeInstanceOf(Function);
    });
  });

  describe("Dialog Opening", () => {
    it("should open dialog when confirm is called", () => {
      const { result } = renderHook(() => useDialogState());

      act(() => {
        void result.current.confirm("Test message");
      });

      expect(result.current.dialogState).not.toBeNull();
      expect(result.current.dialogState?.isOpen).toBe(true);
      expect(result.current.dialogState?.message).toBe("Test message");
      expect(result.current.dialogState?.resolve).toBeInstanceOf(Function);
    });

    it("should return a promise when confirm is called", () => {
      const { result } = renderHook(() => useDialogState());

      let promise: Promise<boolean>;

      act(() => {
        promise = result.current.confirm("Test");
      });

      expect(promise!).toBeInstanceOf(Promise);
    });
  });

  describe("Dialog Confirmation", () => {
    it("should resolve true when confirmDialog is called", async () => {
      const { result } = renderHook(() => useDialogState());

      let promise: Promise<boolean>;

      act(() => {
        promise = result.current.confirm("Test message");
      });

      act(() => {
        result.current.onConfirm();
      });

      await expect(promise!).resolves.toBe(true);
    });

    it("should clear dialog state after confirmation", () => {
      const { result } = renderHook(() => useDialogState());

      act(() => {
        void result.current.confirm("Test");
      });

      expect(result.current.dialogState).not.toBeNull();

      act(() => {
        result.current.onConfirm();
      });

      expect(result.current.dialogState).toBeNull();
    });

    it("should do nothing if confirmDialog called with no open dialog", () => {
      const { result } = renderHook(() => useDialogState());

      expect(() => {
        act(() => {
          result.current.onConfirm();
        });
      }).not.toThrow();

      expect(result.current.dialogState).toBeNull();
    });
  });

  describe("Dialog Cancellation", () => {
    it("should resolve false when cancelDialog is called", async () => {
      const { result } = renderHook(() => useDialogState());

      let promise: Promise<boolean>;

      act(() => {
        promise = result.current.confirm("Test message");
      });

      act(() => {
        result.current.onCancel();
      });

      await expect(promise!).resolves.toBe(false);
    });

    it("should clear dialog state after cancellation", () => {
      const { result } = renderHook(() => useDialogState());

      act(() => {
        void result.current.confirm("Test");
      });

      expect(result.current.dialogState).not.toBeNull();

      act(() => {
        result.current.onCancel();
      });

      expect(result.current.dialogState).toBeNull();
    });

    it("should do nothing if cancelDialog called with no open dialog", () => {
      const { result } = renderHook(() => useDialogState());

      expect(() => {
        act(() => {
          result.current.onCancel();
        });
      }).not.toThrow();

      expect(result.current.dialogState).toBeNull();
    });
  });

  describe("Generic Type Support", () => {
    it("should support custom message types", () => {
      interface CustomData {
        title: string;
        description: string;
        level: number;
      }

      const { result } = renderHook(() => useDialogState<CustomData>());

      const customMessage: CustomData = {
        title: "Warning",
        description: "Unsaved changes",
        level: 2,
      };

      act(() => {
        void result.current.confirm(customMessage);
      });

      expect(result.current.dialogState?.message).toEqual(customMessage);
      expect(result.current.dialogState?.message.title).toBe("Warning");
      expect(result.current.dialogState?.message.level).toBe(2);
    });

    it("should support object messages", () => {
      const { result } = renderHook(() =>
        useDialogState<{ text: string; severity: "info" | "warning" }>()
      );

      act(() => {
        void result.current.confirm({ text: "Test", severity: "warning" });
      });

      expect(result.current.dialogState?.message.text).toBe("Test");
      expect(result.current.dialogState?.message.severity).toBe("warning");
    });
  });

  describe("Multiple Dialog Sequences", () => {
    it("should handle multiple sequential dialogs", async () => {
      const { result } = renderHook(() => useDialogState());

      // First dialog
      let promise1: Promise<boolean>;

      act(() => {
        promise1 = result.current.confirm("First");
      });

      expect(result.current.dialogState?.message).toBe("First");

      act(() => {
        result.current.onConfirm();
      });

      await expect(promise1!).resolves.toBe(true);

      // Second dialog
      let promise2: Promise<boolean>;

      act(() => {
        promise2 = result.current.confirm("Second");
      });

      expect(result.current.dialogState?.message).toBe("Second");

      act(() => {
        result.current.onCancel();
      });

      await expect(promise2!).resolves.toBe(false);
    });

    it("should cancel previous confirm when a new one starts", async () => {
      const { result } = renderHook(() => useDialogState());

      let firstPromise: Promise<boolean>;

      act(() => {
        firstPromise = result.current.confirm("First");
      });

      let secondPromise: Promise<boolean>;

      act(() => {
        secondPromise = result.current.confirm("Second");
      });

      await expect(firstPromise!).resolves.toBe(false);

      act(() => {
        result.current.onConfirm();
      });

      await expect(secondPromise!).resolves.toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty string message", () => {
      const { result } = renderHook(() => useDialogState());

      act(() => {
        void result.current.confirm("");
      });

      expect(result.current.dialogState?.message).toBe("");
      expect(result.current.dialogState?.isOpen).toBe(true);
    });

    it("should handle rapid confirm calls", () => {
      const { result } = renderHook(() => useDialogState());

      act(() => {
        void result.current.confirm("First");
        void result.current.confirm("Second");
      });

      // Should have the last message
      expect(result.current.dialogState?.message).toBe("Second");
    });

    it("should maintain stable function references", () => {
      const { result, rerender } = renderHook(() => useDialogState());

      const firstConfirm = result.current.confirm;
      const firstOnConfirm = result.current.onConfirm;
      const firstOnCancel = result.current.onCancel;

      rerender();

      expect(result.current.confirm).toBe(firstConfirm);
      expect(result.current.onConfirm).toBe(firstOnConfirm);
      expect(result.current.onCancel).toBe(firstOnCancel);
    });
  });
});
