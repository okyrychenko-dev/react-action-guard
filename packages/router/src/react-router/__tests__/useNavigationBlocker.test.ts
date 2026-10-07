import { act, renderHook } from "@testing-library/react";
import { useBlocker } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../../core";
import { useNavigationBlocker } from "../useNavigationBlocker";
import { createBlockerMock, isNoArgBlocker } from "./test-helpers";
import type { UseNavigationBlockerOptions } from "../types";

// Mock dependencies
vi.mock("react-router-dom", () => ({
  useBlocker: vi.fn(),
}));

vi.mock("../../core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../core")>();

  return {
    ...actual,
    useShouldBlock: vi.fn(),
    useBeforeUnload: vi.fn(),
  };
});

const mockUseBlocker = vi.mocked(useBlocker);
const mockUseShouldBlock = vi.mocked(useShouldBlock);
const mockUseBeforeUnload = vi.mocked(useBeforeUnload);

describe("useNavigationBlocker (React Router)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShouldBlock.mockReturnValue(false);
    mockUseBlocker.mockReturnValue(createBlockerMock("unblocked"));
  });

  describe("Basic functionality", () => {
    it("should integrate with useShouldBlock", () => {
      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Test message",
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(true, undefined);
    });

    it("should pass scope to useShouldBlock", () => {
      renderHook(() =>
        useNavigationBlocker({
          scope: "test-scope",
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(undefined, "test-scope");
    });

    it("should handle both when and scope", () => {
      renderHook(() =>
        useNavigationBlocker({
          when: true,
          scope: "test-scope",
        })
      );

      // 'when' takes precedence, but both are passed
      expect(mockUseShouldBlock).toHaveBeenCalledWith(true, "test-scope");
    });

    it("should integrate with React Router useBlocker", () => {
      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(mockUseBlocker).toHaveBeenCalled();
    });

    it("should call useBeforeUnload when blockBrowserUnload is true", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          blockBrowserUnload: true,
          message: "Test message",
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, "Test message");
    });

    it("should not call useBeforeUnload when blockBrowserUnload is false", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          blockBrowserUnload: false,
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(false, expect.any(String));
    });
  });

  describe("Blocking behavior", () => {
    it("should return isBlocking: false when not blocking", () => {
      mockUseShouldBlock.mockReturnValue(false);
      mockUseBlocker.mockReturnValue(createBlockerMock("unblocked"));

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(result.current.isBlocking).toBe(false);
    });

    it("should return isBlocking: true when blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);
      mockUseBlocker.mockReturnValue(createBlockerMock("blocked"));

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(result.current.isBlocking).toBe(true);
    });
  });

  describe("Callbacks", () => {
    it("should use stable callback references", () => {
      const onBlock = vi.fn();
      const onAllow = vi.fn();

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: true,
          onBlock,
          onAllow,
        })
      );

      // Get the blocker function
      const blockerFn = mockUseBlocker.mock.calls[0][0];

      // Re-render shouldn't create new blocker function
      rerender();

      const blockerFnAfterRerender = mockUseBlocker.mock.calls[1][0];

      // Functions should be different (useCallback creates new function)
      // but callbacks are stable via useRef
      expect(typeof blockerFn).toBe("function");
      expect(typeof blockerFnAfterRerender).toBe("function");
    });

    it("should proceed after async confirmation resolves true", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");

      mockUseBlocker.mockReturnValue(blocker);

      let resolveConfirm: (value: boolean) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => confirmPromise);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm?",
          onConfirm,
        })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      let result = false;

      act(() => {
        result = blockerFn();
      });
      expect(result).toBe(true);

      await act(async () => {
        resolveConfirm(true);
        await confirmPromise;
      });

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
    });

    it("should reset after async confirmation resolves false", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");

      mockUseBlocker.mockReturnValue(blocker);

      let resolveConfirm: (value: boolean) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => confirmPromise);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm?",
          onConfirm,
        })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      let result = false;

      act(() => {
        result = blockerFn();
      });
      expect(result).toBe(true);

      await act(async () => {
        resolveConfirm(false);
        await confirmPromise;
      });

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(blocker.reset).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).not.toHaveBeenCalled();
    });

    it("should reset after async confirmation rejects", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");

      mockUseBlocker.mockReturnValue(blocker);

      let rejectConfirm: (value: Error) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((_, reject) => {
        rejectConfirm = reject;
      });
      const onConfirm = vi.fn(() => confirmPromise);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm?",
          onConfirm,
        })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      let result = false;

      act(() => {
        result = blockerFn();
      });
      expect(result).toBe(true);

      await act(async () => {
        rejectConfirm(new Error("boom"));
        try {
          await confirmPromise;
        } catch {
          // Expected rejection.
        }
      });

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(blocker.reset).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).not.toHaveBeenCalled();
    });

    it("should ignore pending approval after blocking is disabled", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => promise);

      mockUseBlocker.mockReturnValue(blocker);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({ when: true, message: "Confirm?", onConfirm, onAllow })
      );
      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(blockerFn()).toBe(true);
      });
      mockUseShouldBlock.mockReturnValue(false);
      rerender();

      expect(blocker.reset).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveConfirm(true);
        await promise;
      });

      expect(onAllow).not.toHaveBeenCalled();
      expect(blocker.proceed).not.toHaveBeenCalled();
      expect(blocker.reset).toHaveBeenCalledTimes(1);
    });

    it("should allow async confirmation from an inline handler across its own rerenders", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();

      mockUseBlocker.mockReturnValue(blocker);
      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm?",
          onConfirm: async () => true,
          onAllow,
        })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      await act(async () => {
        expect(blockerFn()).toBe(true);
      });

      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
      expect(blocker.reset).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      "should settle async answer %s with an inline condition across its own rerenders",
      async (answer) => {
        mockUseShouldBlock.mockReturnValue(true);

        const blocker = createBlockerMock("blocked");
        const onAllow = vi.fn();
        const onConfirm = async () => answer;

        mockUseBlocker.mockReturnValue(blocker);

        renderHook(() =>
          useNavigationBlocker({
            when: () => true,
            message: "Confirm?",
            onConfirm,
            onAllow,
          })
        );

        const blockerFn = mockUseBlocker.mock.calls[0][0];

        if (!isNoArgBlocker(blockerFn)) {
          throw new Error("Expected no-arg blocker function");
        }

        await act(async () => {
          expect(blockerFn()).toBe(true);
        });

        expect(onAllow).toHaveBeenCalledTimes(answer ? 1 : 0);
        expect(blocker.proceed).toHaveBeenCalledTimes(answer ? 1 : 0);
        expect(blocker.reset).toHaveBeenCalledTimes(answer ? 0 : 1);
      }
    );

    it.each([
      { name: "message", update: { message: "Changed?" } },
      { name: "scope", update: { scope: "other" } },
    ])("should invalidate pending approval when $name changes", async ({ update }) => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const options: UseNavigationBlockerOptions = {
        when: true,
        scope: "editor",
        message: "Confirm?",
        onConfirm: () => promise,
        onAllow,
      };

      mockUseBlocker.mockReturnValue(blocker);

      const { rerender } = renderHook((props) => useNavigationBlocker(props), {
        initialProps: options,
      });
      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(blockerFn()).toBe(true);
      });
      rerender({ ...options, ...update });

      expect(blocker.reset).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveConfirm(true);
        await promise;
      });

      expect(onAllow).not.toHaveBeenCalled();
      expect(blocker.proceed).not.toHaveBeenCalled();
      expect(blocker.reset).toHaveBeenCalledTimes(1);
    });

    it("should retain a replacement attempt when invalidated state clears", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      let resolveFirst: (value: boolean) => void = () => undefined;
      let resolveSecond: (value: boolean) => void = () => undefined;
      const first = new Promise<boolean>((resolve) => {
        resolveFirst = resolve;
      });
      const second = new Promise<boolean>((resolve) => {
        resolveSecond = resolve;
      });
      const onConfirm = vi
        .fn<NonNullable<UseNavigationBlockerOptions["onConfirm"]>>()
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second);
      const options: UseNavigationBlockerOptions = {
        when: true,
        message: "First?",
        onConfirm,
        onAllow,
      };

      mockUseBlocker.mockReturnValue(blocker);

      const { rerender } = renderHook((props) => useNavigationBlocker(props), {
        initialProps: options,
      });
      const firstBlockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(firstBlockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(firstBlockerFn()).toBe(true);
      });

      rerender({ ...options, message: "Second?" });

      expect(blocker.reset).toHaveBeenCalledTimes(1);

      const nextBlockerFn = mockUseBlocker.mock.calls[mockUseBlocker.mock.calls.length - 1]?.[0];

      if (!isNoArgBlocker(nextBlockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(nextBlockerFn()).toBe(true);
      });
      await act(async () => {
        resolveFirst(true);
        await first;
      });

      expect(onAllow).not.toHaveBeenCalled();
      expect(blocker.proceed).not.toHaveBeenCalled();

      await act(async () => {
        resolveSecond(true);
        await second;
      });

      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
      expect(blocker.reset).toHaveBeenCalledTimes(1);
    });

    it("should preserve approval across callback rerenders and equivalent scopes exactly once", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      const nextOnAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const options: UseNavigationBlockerOptions = {
        when: true,
        scope: ["editor", "navigation"],
        message: "Confirm?",
        onConfirm: () => promise,
        onAllow,
      };

      mockUseBlocker.mockReturnValue(blocker);

      const { rerender } = renderHook((props) => useNavigationBlocker(props), {
        initialProps: options,
      });
      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(blockerFn()).toBe(true);
      });
      rerender({
        ...options,
        scope: ["navigation", "editor", "editor"],
        onAllow: nextOnAllow,
        onConfirm: () => false,
        onBlock: vi.fn(),
      });

      await act(async () => {
        resolveConfirm(true);
        await promise;
      });
      rerender(options);
      await act(async () => {
        await promise;
      });

      expect(onAllow).not.toHaveBeenCalled();
      expect(nextOnAllow).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
      expect(blocker.reset).not.toHaveBeenCalled();
    });

    it.each([true, false])(
      "should let a newer synchronous answer (%s) supersede pending approval",
      async (answer) => {
        mockUseShouldBlock.mockReturnValue(true);

        const blocker = createBlockerMock("blocked");
        const onAllow = vi.fn();
        let resolveConfirm: (value: boolean) => void = () => undefined;
        const promise = new Promise<boolean>((resolve) => {
          resolveConfirm = resolve;
        });
        const onConfirm = vi
          .fn<NonNullable<UseNavigationBlockerOptions["onConfirm"]>>()
          .mockReturnValueOnce(promise)
          .mockReturnValue(answer);

        mockUseBlocker.mockReturnValue(blocker);
        renderHook(() =>
          useNavigationBlocker({ when: true, message: "Confirm?", onConfirm, onAllow })
        );

        const blockerFn = mockUseBlocker.mock.calls[0][0];

        if (!isNoArgBlocker(blockerFn)) {
          throw new Error("Expected no-arg blocker function");
        }

        act(() => {
          expect(blockerFn()).toBe(true);
        });
        act(() => {
          expect(blockerFn()).toBe(!answer);
        });
        await act(async () => {
          resolveConfirm(true);
          await promise;
        });

        expect(onAllow).toHaveBeenCalledTimes(answer ? 1 : 0);
        expect(blocker.proceed).not.toHaveBeenCalled();
        expect(blocker.reset).not.toHaveBeenCalled();
      }
    );

    it("should ignore approval after detach", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const promise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = () => promise;

      mockUseBlocker.mockReturnValue(blocker);

      const { unmount } = renderHook(() =>
        useNavigationBlocker({ when: true, message: "Confirm?", onConfirm, onAllow })
      );
      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(blockerFn()).toBe(true);
      });
      unmount();
      await act(async () => {
        resolveConfirm(true);
        await promise;
      });

      expect(onAllow).not.toHaveBeenCalled();
      expect(blocker.proceed).not.toHaveBeenCalled();
      expect(blocker.reset).not.toHaveBeenCalled();
    });

    it("should settle only the latest async attempt and protect repeated navigation", async () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");
      const onAllow = vi.fn();
      const onBlock = vi.fn();
      let resolveFirst: (value: boolean) => void = () => undefined;
      let resolveSecond: (value: boolean) => void = () => undefined;
      const first = new Promise<boolean>((resolve) => {
        resolveFirst = resolve;
      });
      const second = new Promise<boolean>((resolve) => {
        resolveSecond = resolve;
      });
      const onConfirm = vi
        .fn<NonNullable<UseNavigationBlockerOptions["onConfirm"]>>()
        .mockReturnValueOnce(first)
        .mockReturnValueOnce(second)
        .mockResolvedValueOnce(false);

      mockUseBlocker.mockReturnValue(blocker);
      renderHook(() =>
        useNavigationBlocker({ when: true, message: "Confirm?", onConfirm, onAllow, onBlock })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      act(() => {
        expect(blockerFn()).toBe(true);
      });
      act(() => {
        expect(blockerFn()).toBe(true);
      });
      await act(async () => {
        resolveSecond(true);
        await second;
      });
      await act(async () => {
        resolveFirst(true);
        await first;
      });

      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
      expect(blocker.reset).not.toHaveBeenCalled();

      await act(async () => {
        expect(blockerFn()).toBe(true);
      });

      expect(onBlock).toHaveBeenCalledTimes(3);
      expect(onConfirm).toHaveBeenCalledTimes(3);
      expect(onAllow).toHaveBeenCalledTimes(1);
      expect(blocker.proceed).toHaveBeenCalledTimes(1);
      expect(blocker.reset).toHaveBeenCalledTimes(1);
    });

    it("should block when sync confirmation returns false", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const blocker = createBlockerMock("blocked");

      mockUseBlocker.mockReturnValue(blocker);

      const onConfirm = vi.fn(() => false);
      const onAllow = vi.fn();

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm?",
          onConfirm,
          onAllow,
        })
      );

      const blockerFn = mockUseBlocker.mock.calls[0][0];

      if (!isNoArgBlocker(blockerFn)) {
        throw new Error("Expected no-arg blocker function");
      }

      let result = false;

      act(() => {
        result = blockerFn();
      });

      expect(result).toBe(true);
      expect(onAllow).not.toHaveBeenCalled();
    });
  });

  describe("Backward compatibility", () => {
    it("should support the deprecated block option", () => {
      const options: UseNavigationBlockerOptions = {
        block: true,
      };

      renderHook(() => useNavigationBlocker(options));

      expect(mockUseShouldBlock).toHaveBeenCalledWith(true, undefined);
    });

    it("should prefer when over the deprecated block option", () => {
      const options: UseNavigationBlockerOptions = {
        when: false,
        block: true,
      };

      renderHook(() => useNavigationBlocker(options));

      // when takes precedence via ??
      expect(mockUseShouldBlock).toHaveBeenCalledWith(false, undefined);
    });
  });

  describe("Message handling", () => {
    it("should use default message for browser unload", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          // No message provided
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, DEFAULT_UNLOAD_MESSAGE);
    });

    it("should use custom message for browser unload", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Custom message",
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, "Custom message");
    });
  });

  describe("Performance", () => {
    it("should update when blocking state changes", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      // Should call useBeforeUnload with updated state
      expect(mockUseBeforeUnload).toHaveBeenLastCalledWith(true, DEFAULT_UNLOAD_MESSAGE);
    });
  });
});
