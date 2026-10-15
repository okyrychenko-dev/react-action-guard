import { useIsBlocked } from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useShouldBlock } from "../useShouldBlock";

// Mock react-action-guard
vi.mock("@okyrychenko-dev/react-action-guard", () => ({
  useIsBlocked: vi.fn(),
}));

// Get properly typed mock
const mockUseIsBlocked = vi.mocked(useIsBlocked);

describe("useShouldBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseIsBlocked.mockReturnValue(false);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("Condition-based blocking", () => {
    it("should return false when no conditions are provided", () => {
      const { result } = renderHook(() => useShouldBlock(undefined, undefined));

      expect(result.current).toBe(false);
    });

    it("should return true when the when option is true", () => {
      const { result } = renderHook(() => useShouldBlock(true));

      expect(result.current).toBe(true);
    });

    it("should return false when the when option is false", () => {
      const { result } = renderHook(() => useShouldBlock(false));

      expect(result.current).toBe(false);
    });

    it("should handle function condition", () => {
      const condition = vi.fn(() => true);
      const { result } = renderHook(() => useShouldBlock(condition));

      expect(result.current).toBe(true);
      expect(condition).toHaveBeenCalled();
    });

    it("should accept pure function conditions without a development warning", () => {
      vi.stubEnv("NODE_ENV", "development");

      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
      const condition = (): boolean => true;

      const { rerender } = renderHook(() => useShouldBlock(condition));

      rerender();

      expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should update when condition changes", () => {
      let when = false;
      const { result, rerender } = renderHook(() => useShouldBlock(when));

      expect(result.current).toBe(false);

      when = true;
      rerender();

      expect(result.current).toBe(true);
    });
  });

  describe("Scope-based blocking", () => {
    it("should return true when scope is blocked", () => {
      mockUseIsBlocked.mockReturnValue(true);

      const { result } = renderHook(() => useShouldBlock(undefined, "test-scope"));

      expect(result.current).toBe(true);
      expect(useIsBlocked).toHaveBeenCalledWith("test-scope");
    });

    it("should handle array of scopes", () => {
      mockUseIsBlocked.mockReturnValue(false);

      const { result } = renderHook(() => useShouldBlock(undefined, ["scope1", "scope2"]));

      expect(result.current).toBe(false);
      expect(useIsBlocked).toHaveBeenCalledWith(["scope1", "scope2"]);
    });

    it("should return true when single scope in array is blocked", () => {
      mockUseIsBlocked.mockReturnValue(true);

      const { result } = renderHook(() => useShouldBlock(undefined, ["blocked-scope"]));

      expect(result.current).toBe(true);
      expect(useIsBlocked).toHaveBeenCalledWith("blocked-scope");
    });
  });

  describe("Combined conditions (OR logic)", () => {
    it("should return true if either when=true OR scope is blocked", () => {
      mockUseIsBlocked.mockReturnValue(false);

      const { result } = renderHook(() => useShouldBlock(true, "test-scope"));

      expect(result.current).toBe(true);
    });

    it("should return true when scope is blocked even if when=false", () => {
      mockUseIsBlocked.mockReturnValue(true);

      const { result } = renderHook(() => useShouldBlock(false, "test-scope"));

      expect(result.current).toBe(true);
    });

    it("should return true when both conditions are true", () => {
      mockUseIsBlocked.mockReturnValue(true);

      const { result } = renderHook(() => useShouldBlock(true, "test-scope"));

      expect(result.current).toBe(true);
    });
  });

  describe("Performance optimizations", () => {
    it("should memoize scope normalization", () => {
      const scope = "test-scope";
      const { result, rerender } = renderHook(() => useShouldBlock(undefined, scope));

      const firstResult = result.current;

      rerender();

      const secondResult = result.current;

      // Results should be referentially stable
      expect(firstResult).toBe(secondResult);
    });

    it("should refresh a stable predicate while preserving scope OR semantics", () => {
      let dirty = false;
      const condition = (): boolean => dirty;
      const { result, rerender } = renderHook(() => useShouldBlock(condition, "editor"));

      expect(result.current).toBe(false);
      dirty = true;
      rerender();
      expect(result.current).toBe(true);
      dirty = false;
      rerender();
      expect(result.current).toBe(false);
      mockUseIsBlocked.mockReturnValue(true);
      rerender();
      expect(result.current).toBe(true);
      mockUseIsBlocked.mockReturnValue(false);
      rerender();
      expect(result.current).toBe(false);
    });
  });

  describe("Edge cases", () => {
    it("should handle undefined scope gracefully", () => {
      const { result } = renderHook(() => useShouldBlock(true, undefined));

      expect(result.current).toBe(true);
    });

    it("should handle empty array scope", () => {
      const { result } = renderHook(() => useShouldBlock(undefined, []));

      expect(result.current).toBe(false);
    });

    it("should handle scope changing from undefined to defined", () => {
      let scope: string | undefined = undefined;
      const { result, rerender } = renderHook(() => useShouldBlock(undefined, scope));

      expect(result.current).toBe(false);

      mockUseIsBlocked.mockReturnValue(true);
      scope = "new-scope";
      rerender();

      expect(result.current).toBe(true);
    });
  });
});
