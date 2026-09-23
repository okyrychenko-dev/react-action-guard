import { afterEach, describe, expect, it, vi } from "vitest";
import { createBlockerId, isThenable, resolveConfirmResult } from "../utils";

describe("utils", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("isThenable", () => {
    it("should return true for thenable objects", () => {
      const thenable = { then: () => undefined };

      expect(isThenable(thenable)).toBe(true);
    });

    it("should return false for non-thenables", () => {
      expect(isThenable(null)).toBe(false);
      expect(isThenable(undefined)).toBe(false);
      expect(isThenable(1)).toBe(false);
      expect(isThenable({})).toBe(false);
    });
  });

  describe("resolveConfirmResult", () => {
    it("should use fallback when no custom handler is provided", () => {
      const result = resolveConfirmResult("Leave?", undefined, () => true);

      expect(result).toEqual({ kind: "sync", confirmed: true });
    });

    it("should return sync result for boolean handler", () => {
      const result = resolveConfirmResult(
        "Leave?",
        () => false,
        () => true
      );

      expect(result).toEqual({ kind: "sync", confirmed: false });
    });

    it("should return async result for thenable handler", async () => {
      const result = resolveConfirmResult(
        "Leave?",
        () => Promise.resolve(true),
        () => false
      );

      expect(result.kind).toBe("async");
      if (result.kind === "async") {
        await expect(result.promise).resolves.toBe(true);
      }
    });
  });

  describe("createBlockerId", () => {
    it("should omit the scope segment when no scope is provided", () => {
      vi.spyOn(Date, "now").mockReturnValue(100);

      expect(createBlockerId("navigation")).toBe("navigation-100");
    });

    it("should include a string scope and timestamp", () => {
      vi.spyOn(Date, "now").mockReturnValue(123);

      expect(createBlockerId("navigation", "checkout")).toBe("navigation-checkout-123");
    });

    it("should join array scopes", () => {
      vi.spyOn(Date, "now").mockReturnValue(456);

      expect(createBlockerId("navigation", ["checkout", "payment"])).toBe(
        "navigation-checkout-payment-456"
      );
    });
  });
});
