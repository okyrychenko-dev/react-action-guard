import { describe, expect, it } from "vitest";
import { isThenable, resolveConfirmResult } from "../utils";

describe("utils", () => {
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
});
