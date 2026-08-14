import { renderHook } from "@testing-library/react";
import { type MockInstance, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_UNLOAD_MESSAGE, useBeforeUnload, useShouldBlock } from "../../core";
import { useNavigationBlocker } from "../useAppRouterBlocker";

// Mock dependencies
vi.mock("../../core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../core")>();
  return {
    ...actual,
    useShouldBlock: vi.fn(),
    useBeforeUnload: vi.fn(),
  };
});

const mockUseShouldBlock = vi.mocked(useShouldBlock);
const mockUseBeforeUnload = vi.mocked(useBeforeUnload);

describe("useNavigationBlocker (Next.js App Router)", () => {
  let consoleWarnSpy: MockInstance<typeof console.warn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseShouldBlock.mockReturnValue(false);
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
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
      renderHook(() => useNavigationBlocker({ scope: "test-scope" }));

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

  describe("Development warnings", () => {
    it("should warn in development when blocking is active", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("App Router has limited blocking support")
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should not warn when not blocking", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      mockUseShouldBlock.mockReturnValue(false);

      renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      expect(consoleWarnSpy).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Callbacks", () => {
    it("should not call onBlock without observable navigation interception", () => {
      const onBlock = vi.fn();
      mockUseShouldBlock.mockReturnValue(false);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: false,
          onBlock,
        })
      );

      expect(onBlock).not.toHaveBeenCalled();

      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      expect(onBlock).not.toHaveBeenCalled();
    });

    it("should not call onAllow (limitation of App Router)", () => {
      const onAllow = vi.fn();
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          onAllow,
        })
      );

      // onAllow is not called in App Router because we can't intercept navigation
      expect(onAllow).not.toHaveBeenCalled();
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

  describe("Limitations documentation", () => {
    it("should rely primarily on useBeforeUnload for blocking", () => {
      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
          message: "Test",
        })
      );

      // Primary blocking mechanism is useBeforeUnload
      expect(mockUseBeforeUnload).toHaveBeenCalledWith(true, "Test");
    });

    it("should warn developers about limitations", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      mockUseShouldBlock.mockReturnValue(true);

      renderHook(() =>
        useNavigationBlocker({
          when: true,
        })
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Link clicks cannot be blocked. Use Pages Router for full support.")
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Edge cases", () => {
    it("should handle scope array", () => {
      renderHook(() =>
        useNavigationBlocker({
          scope: ["scope1", "scope2"],
        })
      );

      expect(mockUseShouldBlock).toHaveBeenCalledWith(undefined, ["scope1", "scope2"]);
    });

    it("should update when blocking state changes", () => {
      mockUseShouldBlock.mockReturnValue(false);

      const { rerender } = renderHook(() =>
        useNavigationBlocker({
          when: false,
        })
      );

      mockUseShouldBlock.mockReturnValue(true);
      rerender();

      expect(mockUseBeforeUnload).toHaveBeenLastCalledWith(true, DEFAULT_UNLOAD_MESSAGE);
    });
  });
});
