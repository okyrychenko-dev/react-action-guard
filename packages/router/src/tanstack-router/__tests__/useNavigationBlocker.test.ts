import { useRouter } from "@tanstack/react-router";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../../core";
import { useNavigationBlocker } from "../useNavigationBlocker";
import type { SafeTanStackRouter } from "../types";

type RouterMock = SafeTanStackRouter | { history: null };

declare module "@tanstack/react-router" {
  export function useRouter(): RouterMock;
}

// Mock dependencies
vi.mock("@tanstack/react-router", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../../core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../core")>();
  return {
    ...actual,
    useShouldBlock: vi.fn(),
    useBeforeUnload: vi.fn(),
  };
});

const mockUseRouter = vi.mocked(useRouter);
const mockUseShouldBlock = vi.mocked(useShouldBlock);
const mockUseBeforeUnload = vi.mocked(useBeforeUnload);

describe("useNavigationBlocker (TanStack Router)", () => {
  let mockUnblock: () => void;
  let mockBlock: ReturnType<typeof vi.fn<SafeTanStackRouter["history"]["block"]>>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShouldBlock.mockReturnValue(false);
    mockUnblock = vi.fn();
    mockBlock = vi.fn(() => mockUnblock);

    const mockRouter: SafeTanStackRouter = {
      history: {
        block: mockBlock,
      },
    };

    mockUseRouter.mockReturnValue(mockRouter);
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
  });

  describe("TanStack Router history blocking", () => {
    it("should call router.history.block when shouldBlock is true", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(mockBlock).toHaveBeenCalled();
    });

    it("should not call router.history.block when shouldBlock is false", () => {
      mockUseShouldBlock.mockReturnValue(false);

      renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(mockBlock).not.toHaveBeenCalled();
    });

    it("should cleanup blocker on unmount", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { unmount } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      unmount();

      expect(mockUnblock).toHaveBeenCalled();
    });

    it("should cleanup and re-block when shouldBlock changes", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      const firstUnblock = mockUnblock;

      // Change condition
      mockUseShouldBlock.mockReturnValue(false);
      rerender();

      expect(firstUnblock).toHaveBeenCalled();

      // Change back
      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      expect(mockBlock).toHaveBeenCalledTimes(2);
    });
  });

  describe("Blocking behavior", () => {
    it("should return isBlocking: false when not blocking", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(result.current.isBlocking).toBe(false);
    });

    it("should return isBlocking: true when blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(result.current.isBlocking).toBe(true);
    });
  });

  describe("Callbacks", () => {
    it("should pass blocker function to router.history.block", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Test",
        })
      );

      expect(mockBlock).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should call async onConfirm only once", async () => {
      mockUseShouldBlock.mockReturnValue(true);
      const retry = vi.fn();

      let resolveConfirm: (value: boolean) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => confirmPromise);
      const onAllow = vi.fn();

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm navigation?",
          onConfirm,
          onAllow,
        })
      );

      const blockerFn = mockBlock.mock.calls[0]?.[0];
      expect(blockerFn).toBeTypeOf("function");

      blockerFn?.({ retry });

      resolveConfirm(true);
      await confirmPromise;

      await waitFor(() => {
        expect(onConfirm).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Message handling", () => {
    it("should use default message for browser unload", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, DEFAULT_UNLOAD_MESSAGE);
    });

    it("should use custom message", () => {
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

  describe("Edge cases", () => {
    it("should handle missing router.history gracefully", () => {
      mockUseShouldBlock.mockReturnValue(true);
      mockUseRouter.mockReturnValue({
        history: null,
      });

      const { result } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      // Should not crash
      expect(result.current.isBlocking).toBe(true);
      expect(mockBlock).not.toHaveBeenCalled();
    });

    it("should update blocking when message changes", () => {
      mockUseShouldBlock.mockReturnValue(true);
      let message = "Message 1";

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: true,
          message,
        })
      );

      message = "Message 2";
      rerender();

      // Should re-block with new message
      expect(mockBlock).toHaveBeenCalledTimes(2);
    });
  });
});
