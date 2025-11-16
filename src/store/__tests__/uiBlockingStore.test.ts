import { describe, it, expect, beforeEach } from "vitest";
import { useUIBlockingStore } from "../uiBlockingStore.store";
import { DEFAULT_SCOPE, DEFAULT_REASON, DEFAULT_PRIORITY } from "../uiBlockingStore.constants";

describe("uiBlockingStore", () => {
  beforeEach(() => {
    // Clear the store before each test
    useUIBlockingStore.getState().clearAllBlockers();
  });

  describe("addBlocker", () => {
    it("should add a blocker with default values", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker");

      expect(isBlocked()).toBe(true);
    });

    it("should add a blocker with custom scope", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "custom-scope" });

      expect(isBlocked("custom-scope")).toBe(true);
      expect(isBlocked("other-scope")).toBe(false);
    });

    it("should add a blocker with custom priority", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test", priority: 100 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.priority).toBe(100);
    });

    it("should add a blocker with custom reason", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test", reason: "Custom reason" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Custom reason");
    });

    it("should add a blocker with array of scopes", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: ["scope1", "scope2"] });

      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
      expect(isBlocked("scope3")).toBe(false);
    });

    it("should add multiple blockers", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("blocker1", { scope: "test" });
      addBlocker("blocker2", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(2);
    });
  });

  describe("removeBlocker", () => {
    it("should remove an existing blocker", () => {
      const { addBlocker, removeBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test" });
      expect(isBlocked("test")).toBe(true);

      removeBlocker("test-blocker");
      expect(isBlocked("test")).toBe(false);
    });

    it("should not throw when removing non-existent blocker", () => {
      const { removeBlocker } = useUIBlockingStore.getState();

      expect(() => removeBlocker("non-existent")).not.toThrow();
    });

    it("should only remove specified blocker", () => {
      const { addBlocker, removeBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("blocker1", { scope: "test" });
      addBlocker("blocker2", { scope: "test" });

      removeBlocker("blocker1");

      expect(isBlocked("test")).toBe(true);
    });
  });

  describe("isBlocked", () => {
    it("should return false when no blockers exist", () => {
      const { isBlocked } = useUIBlockingStore.getState();

      expect(isBlocked()).toBe(false);
    });

    it("should return true for global scope when global blocker exists", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: DEFAULT_SCOPE });

      expect(isBlocked()).toBe(true);
    });

    it("should return true for any scope when global blocker exists", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: DEFAULT_SCOPE });

      expect(isBlocked("any-scope")).toBe(true);
    });

    it("should check multiple scopes", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "scope1" });

      expect(isBlocked(["scope1", "scope2"])).toBe(true);
      expect(isBlocked(["scope2", "scope3"])).toBe(false);
    });

    it("should handle string and array scopes consistently", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test" });

      expect(isBlocked("test")).toBe(true);
      expect(isBlocked(["test"])).toBe(true);
    });
  });

  describe("getBlockingInfo", () => {
    it("should return empty array when no blockers exist", () => {
      const { getBlockingInfo } = useUIBlockingStore.getState();

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(0);
    });

    it("should return blocker info for matching scope", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker", {
        scope: "test",
        reason: "Test reason",
        priority: 50,
      });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]).toMatchObject({
        id: "test-blocker",
        scope: "test",
        reason: "Test reason",
        priority: 50,
      });
    });

    it("should return global blockers for any scope", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("global-blocker", { scope: DEFAULT_SCOPE });

      const info = getBlockingInfo("any-scope");
      expect(info).toHaveLength(1);
      expect(info[0]?.id).toBe("global-blocker");
    });

    it("should sort blockers by priority (highest first)", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("low-priority", { scope: "test", priority: 10 });
      addBlocker("high-priority", { scope: "test", priority: 100 });
      addBlocker("medium-priority", { scope: "test", priority: 50 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(3);
      expect(info[0]?.id).toBe("high-priority");
      expect(info[1]?.id).toBe("medium-priority");
      expect(info[2]?.id).toBe("low-priority");
    });

    it("should include blockers with array scopes", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("multi-scope", { scope: ["scope1", "scope2"] });

      const info1 = getBlockingInfo("scope1");
      const info2 = getBlockingInfo("scope2");

      expect(info1).toHaveLength(1);
      expect(info2).toHaveLength(1);
      expect(info1[0]?.id).toBe("multi-scope");
      expect(info2[0]?.id).toBe("multi-scope");
    });

    it("should include timestamp in blocker info", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();
      const now = Date.now();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.timestamp).toBeGreaterThanOrEqual(now);
    });
  });

  describe("clearAllBlockers", () => {
    it("should remove all blockers", () => {
      const { addBlocker, clearAllBlockers, isBlocked } = useUIBlockingStore.getState();

      addBlocker("blocker1", { scope: "scope1" });
      addBlocker("blocker2", { scope: "scope2" });
      addBlocker("blocker3", { scope: DEFAULT_SCOPE });

      clearAllBlockers();

      expect(isBlocked()).toBe(false);
      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(false);
    });

    it("should work when no blockers exist", () => {
      const { clearAllBlockers, isBlocked } = useUIBlockingStore.getState();

      expect(() => clearAllBlockers()).not.toThrow();
      expect(isBlocked()).toBe(false);
    });
  });

  describe("clearBlockersForScope", () => {
    it("should clear blockers for specific scope", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = useUIBlockingStore.getState();

      addBlocker("blocker1", { scope: "scope1" });
      addBlocker("blocker2", { scope: "scope2" });

      clearBlockersForScope("scope1");

      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(true);
    });

    it("should not clear global blockers", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = useUIBlockingStore.getState();

      addBlocker("global-blocker", { scope: DEFAULT_SCOPE });
      addBlocker("scoped-blocker", { scope: "test" });

      clearBlockersForScope("test");

      expect(isBlocked()).toBe(true); // Global blocker still exists
      expect(isBlocked("test")).toBe(true); // Still blocked by global
    });

    it("should handle array scopes", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = useUIBlockingStore.getState();

      addBlocker("multi-scope", { scope: ["scope1", "scope2"] });

      clearBlockersForScope("scope1");

      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(false);
    });

    it("should work when no blockers exist for scope", () => {
      const { clearBlockersForScope } = useUIBlockingStore.getState();

      expect(() => clearBlockersForScope("non-existent")).not.toThrow();
    });
  });

  describe("default values", () => {
    it("should use default scope when not provided", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker");

      const info = getBlockingInfo(DEFAULT_SCOPE);
      expect(info).toHaveLength(1);
      expect(info[0]?.scope).toBe(DEFAULT_SCOPE);
    });

    it("should use default reason when not provided", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info[0]?.reason).toBe(DEFAULT_REASON);
    });

    it("should use default priority when not provided", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(DEFAULT_PRIORITY);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string blocker id", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("", { scope: "test" });

      expect(isBlocked("test")).toBe(true);
    });

    it("should handle empty string scope", () => {
      const { addBlocker, isBlocked } = useUIBlockingStore.getState();

      addBlocker("test-blocker", { scope: "" });

      expect(isBlocked("")).toBe(true);
    });

    it("should handle duplicate blocker ids (overwrite)", () => {
      const { addBlocker, getBlockingInfo } = useUIBlockingStore.getState();

      addBlocker("duplicate", { scope: "test", priority: 10 });
      addBlocker("duplicate", { scope: "test", priority: 20 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.priority).toBe(20);
    });
  });
});
