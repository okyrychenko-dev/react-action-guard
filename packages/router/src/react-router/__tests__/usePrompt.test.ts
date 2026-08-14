import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useNavigationBlocker } from "../useNavigationBlocker";
import { usePrompt, usePromptWithOptions } from "../usePrompt";

// Mock useNavigationBlocker
vi.mock("../useNavigationBlocker", () => ({
  useNavigationBlocker: vi.fn(),
}));

const mockUseNavigationBlocker = vi.mocked(useNavigationBlocker);

describe("usePrompt (React Router)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigationBlocker.mockReturnValue({ isBlocking: false });
  });

  describe("Basic functionality", () => {
    it("should call useNavigationBlocker with message and when condition", () => {
      renderHook(() => usePrompt("Test message", true));

      expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
        message: "Test message",
        when: true,
        blockBrowserUnload: true,
      });
    });

    it("should work with false condition", () => {
      renderHook(() => usePrompt("Test message", false));

      expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
        message: "Test message",
        when: false,
        blockBrowserUnload: true,
      });
    });
  });

  describe("Simplified API", () => {
    it("should provide simpler alternative to useNavigationBlocker", () => {
      renderHook(() => usePrompt("Leave page?", true));

      expect(mockUseNavigationBlocker).toHaveBeenCalledTimes(1);
    });

    it("should update when parameters change", () => {
      let when = false;
      const { rerender } = renderHook(() => usePrompt("Test", when));

      expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
        message: "Test",
        when: false,
        blockBrowserUnload: true,
      });

      when = true;
      rerender();

      expect(mockUseNavigationBlocker).toHaveBeenLastCalledWith({
        message: "Test",
        when: true,
        blockBrowserUnload: true,
      });
    });
  });

  describe("Edge cases", () => {
    it("should handle empty message", () => {
      renderHook(() => usePrompt("", true));

      expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
        message: "",
        when: true,
        blockBrowserUnload: true,
      });
    });
  });
});

describe("usePromptWithOptions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseNavigationBlocker.mockReturnValue({ isBlocking: false });
  });

  it("should accept options object", () => {
    renderHook(() =>
      usePromptWithOptions({
        message: "Test message",
        when: true,
      })
    );

    expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
      message: "Test message",
      when: true,
      blockBrowserUnload: true,
    });
  });

  it("should pass through onBlock callback", () => {
    const onBlock = vi.fn();

    renderHook(() =>
      usePromptWithOptions({
        message: "Test",
        when: true,
        onBlock,
      })
    );

    expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
      message: "Test",
      when: true,
      onBlock,
      blockBrowserUnload: true,
    });
  });

  it("should pass through onAllow callback", () => {
    const onAllow = vi.fn();

    renderHook(() =>
      usePromptWithOptions({
        message: "Test",
        when: true,
        onAllow,
      })
    );

    expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
      message: "Test",
      when: true,
      onAllow,
      blockBrowserUnload: true,
    });
  });

  it("should pass through blockBrowserUnload option", () => {
    renderHook(() =>
      usePromptWithOptions({
        message: "Test",
        when: true,
        blockBrowserUnload: false,
      })
    );

    expect(mockUseNavigationBlocker).toHaveBeenCalledWith({
      message: "Test",
      when: true,
      blockBrowserUnload: false,
    });
  });
});
