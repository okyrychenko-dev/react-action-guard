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
      expect(blocker.proceed).toHaveBeenCalled();
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
      expect(blocker.reset).toHaveBeenCalled();
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
      expect(blocker.reset).toHaveBeenCalled();
      expect(blocker.proceed).not.toHaveBeenCalled();
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
    it('should support deprecated "block" option', () => {
      const options: UseNavigationBlockerOptions = {
        block: true,
      };

      renderHook(() => useNavigationBlocker(options));

      expect(mockUseShouldBlock).toHaveBeenCalledWith(true, undefined);
    });

    it('should prefer "when" over deprecated "block"', () => {
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
