import { renderHook } from "@testing-library/react";
import { useRouter } from "next/router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../../core";
import { useNavigationBlocker } from "../usePagesRouterBlocker";
import { createMockRouter } from "./test-helpers";
import type { MockRouter, RouterEventHandler } from "./test-helpers";
import type { Mock } from "vitest";

// Mock dependencies
vi.mock("next/router", () => ({
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

describe("useNavigationBlocker (Next.js Pages Router)", () => {
  let mockRouter: MockRouter;
  let onMock: Mock<(event: string, handler: RouterEventHandler) => void>;
  let offMock: Mock<(event: string, handler: RouterEventHandler) => void>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShouldBlock.mockReturnValue(false);

    mockRouter = createMockRouter();
    onMock = mockRouter.events.on;
    offMock = mockRouter.events.off;
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

  describe("Next.js router events", () => {
    it("should register routeChangeStart listener when blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(onMock).toHaveBeenCalledWith("routeChangeStart", expect.any(Function));
    });

    it("should not register listener when not blocking", () => {
      mockUseShouldBlock.mockReturnValue(false);

      renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(onMock).not.toHaveBeenCalled();
    });

    it("should cleanup listener on unmount", () => {
      mockUseShouldBlock.mockReturnValue(true);

      const { unmount } = renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      const handler = onMock.mock.calls[0][1];

      unmount();

      expect(offMock).toHaveBeenCalledWith("routeChangeStart", handler);
    });

    it("should cleanup and re-register when blocking state changes", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(onMock).not.toHaveBeenCalled();

      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      expect(onMock).toHaveBeenCalled();
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

  describe("Custom confirmation", () => {
    it("should re-attempt navigation after async confirmation", async () => {
      mockUseShouldBlock.mockReturnValue(true);
      const onAllow = vi.fn();
      let resolveConfirm: (value: boolean) => void = () => undefined;
      const confirmPromise = new Promise<boolean>((resolve) => {
        resolveConfirm = resolve;
      });
      const onConfirm = vi.fn(() => confirmPromise);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Confirm navigation?",
          onConfirm,
          onAllow,
        })
      );

      const handler = onMock.mock.calls[0][1];

      expect(() => handler("/next")).toThrow("Route change aborted by user");
      expect(mockRouter.events.emit).toHaveBeenCalledWith("routeChangeError");

      resolveConfirm(true);
      await confirmPromise;
      await Promise.resolve();

      expect(onConfirm).toHaveBeenCalledTimes(1);
      expect(mockRouter.push).toHaveBeenCalledWith("/next");

      expect(() => handler("/next")).not.toThrow();
      expect(onAllow).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("should update listener when message changes", () => {
      mockUseShouldBlock.mockReturnValue(true);
      let message = "Message 1";

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: true,
          message,
        })
      );

      const firstHandler = onMock.mock.calls[0][1];

      message = "Message 2";
      rerender();

      const secondHandler = onMock.mock.calls[1][1];

      // Should have different handlers (new closure)
      expect(firstHandler).not.toBe(secondHandler);
    });
  });

  describe("Edge cases", () => {
    it("should handle navigation without message", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          // No message
        })
      );

      // Should still register listener
      expect(onMock).toHaveBeenCalled();
    });

    it("should handle scope array", () => {
      renderHook(() =>
        useNavigationBlocker({
          scope: ["scope1", "scope2"],
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(undefined, ["scope1", "scope2"]);
    });
  });
});
