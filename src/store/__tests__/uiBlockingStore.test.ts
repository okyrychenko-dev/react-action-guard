import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PRIORITY, DEFAULT_REASON, DEFAULT_SCOPE } from "../uiBlockingStore.constants";
import { uiBlockingStoreApi } from "../uiBlockingStore.store";

describe("uiBlockingStore", () => {
  beforeEach(() => {
    // Clear the store before each test
    uiBlockingStoreApi.getState().clearAllBlockers();
  });

  describe("addBlocker", () => {
    it("should add a blocker with default values", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker");

      expect(isBlocked()).toBe(true);
    });

    it("should add a blocker with custom scope", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "custom-scope" });

      expect(isBlocked("custom-scope")).toBe(true);
      expect(isBlocked("other-scope")).toBe(false);
    });

    it("should add a blocker with custom priority", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test", priority: 100 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.priority).toBe(100);
    });

    it("should add a blocker with custom reason", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test", reason: "Custom reason" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Custom reason");
    });

    it("should add a blocker with array of scopes", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: ["scope1", "scope2"] });

      expect(isBlocked("scope1")).toBe(true);
      expect(isBlocked("scope2")).toBe(true);
      expect(isBlocked("scope3")).toBe(false);
    });

    it("should add multiple blockers", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("blocker1", { scope: "test" });
      addBlocker("blocker2", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(2);
    });

    it("should normalize negative priority to 0", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("negative-priority", { scope: "test", priority: -100 });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(0);
    });

    it("should keep positive priority unchanged", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("positive-priority", { scope: "test", priority: 250 });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(250);
    });

    it("should normalize priority 0 to 0", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("zero-priority", { scope: "test", priority: 0 });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(0);
    });
  });

  describe("updateBlocker", () => {
    it("should update blocker metadata", () => {
      const { addBlocker, updateBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test", reason: "Initial", priority: 10 });
      updateBlocker("test-blocker", { reason: "Updated", priority: 50 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.reason).toBe("Updated");
      expect(info[0]?.priority).toBe(50);
    });

    it("should add blocker when it does not exist", () => {
      const { updateBlocker, isBlocked } = uiBlockingStoreApi.getState();

      updateBlocker("new-blocker", { scope: "test" });

      expect(isBlocked("test")).toBe(true);
    });

    it("should normalize negative priority to 0 on update", () => {
      const { addBlocker, updateBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test", priority: 50 });
      updateBlocker("test-blocker", { priority: -200 });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(0);
    });

    it("should keep positive priority unchanged on update", () => {
      const { addBlocker, updateBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test", priority: 10 });
      updateBlocker("test-blocker", { priority: 300 });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(300);
    });
  });

  describe("removeBlocker", () => {
    it("should remove an existing blocker", () => {
      const { addBlocker, removeBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test" });
      expect(isBlocked("test")).toBe(true);

      removeBlocker("test-blocker");
      expect(isBlocked("test")).toBe(false);
    });

    it("should not throw when removing non-existent blocker", () => {
      const { removeBlocker } = uiBlockingStoreApi.getState();

      expect(() => removeBlocker("non-existent")).not.toThrow();
    });

    it("should only remove specified blocker", () => {
      const { addBlocker, removeBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("blocker1", { scope: "test" });
      addBlocker("blocker2", { scope: "test" });

      removeBlocker("blocker1");

      expect(isBlocked("test")).toBe(true);
    });
  });

  describe("isBlocked", () => {
    it("should return false when no blockers exist", () => {
      const { isBlocked } = uiBlockingStoreApi.getState();

      expect(isBlocked()).toBe(false);
    });

    it("should return true for global scope when global blocker exists", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: DEFAULT_SCOPE });

      expect(isBlocked()).toBe(true);
    });

    it("should return true for any scope when global blocker exists", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: DEFAULT_SCOPE });

      expect(isBlocked("any-scope")).toBe(true);
    });

    it("should check multiple scopes", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "scope1" });

      expect(isBlocked(["scope1", "scope2"])).toBe(true);
      expect(isBlocked(["scope2", "scope3"])).toBe(false);
    });

    it("should handle string and array scopes consistently", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test" });

      expect(isBlocked("test")).toBe(true);
      expect(isBlocked(["test"])).toBe(true);
    });
  });

  describe("getBlockingInfo", () => {
    it("should return empty array when no blockers exist", () => {
      const { getBlockingInfo } = uiBlockingStoreApi.getState();

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(0);
    });

    it("should return blocker info for matching scope", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

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
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("global-blocker", { scope: DEFAULT_SCOPE });

      const info = getBlockingInfo("any-scope");
      expect(info).toHaveLength(1);
      expect(info[0]?.id).toBe("global-blocker");
    });

    it("should sort blockers by priority (highest first)", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

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
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("multi-scope", { scope: ["scope1", "scope2"] });

      const info1 = getBlockingInfo("scope1");
      const info2 = getBlockingInfo("scope2");

      expect(info1).toHaveLength(1);
      expect(info2).toHaveLength(1);
      expect(info1[0]?.id).toBe("multi-scope");
      expect(info2[0]?.id).toBe("multi-scope");
    });

    it("should include timestamp in blocker info", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();
      const now = Date.now();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.timestamp).toBeGreaterThanOrEqual(now);
    });
  });

  describe("clearAllBlockers", () => {
    it("should remove all blockers", () => {
      const { addBlocker, clearAllBlockers, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("blocker1", { scope: "scope1" });
      addBlocker("blocker2", { scope: "scope2" });
      addBlocker("blocker3", { scope: DEFAULT_SCOPE });

      clearAllBlockers();

      expect(isBlocked()).toBe(false);
      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(false);
    });

    it("should work when no blockers exist", () => {
      const { clearAllBlockers, isBlocked } = uiBlockingStoreApi.getState();

      expect(() => clearAllBlockers()).not.toThrow();
      expect(isBlocked()).toBe(false);
    });
  });

  describe("clearBlockersForScope", () => {
    it("should clear blockers for specific scope", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("blocker1", { scope: "scope1" });
      addBlocker("blocker2", { scope: "scope2" });

      clearBlockersForScope("scope1");

      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(true);
    });

    it("should not clear global blockers", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("global-blocker", { scope: DEFAULT_SCOPE });
      addBlocker("scoped-blocker", { scope: "test" });

      clearBlockersForScope("test");

      expect(isBlocked()).toBe(true); // Global blocker still exists
      expect(isBlocked("test")).toBe(true); // Still blocked by global
    });

    it("should handle array scopes", () => {
      const { addBlocker, clearBlockersForScope, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("multi-scope", { scope: ["scope1", "scope2"] });

      clearBlockersForScope("scope1");

      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(false);
    });

    it("should work when no blockers exist for scope", () => {
      const { clearBlockersForScope } = uiBlockingStoreApi.getState();

      expect(() => clearBlockersForScope("non-existent")).not.toThrow();
    });
  });

  describe("default values", () => {
    it("should use default scope when not provided", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker");

      const info = getBlockingInfo(DEFAULT_SCOPE);
      expect(info).toHaveLength(1);
      expect(info[0]?.scope).toBe(DEFAULT_SCOPE);
    });

    it("should use default reason when not provided", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info[0]?.reason).toBe(DEFAULT_REASON);
    });

    it("should use default priority when not provided", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "test" });

      const info = getBlockingInfo("test");
      expect(info[0]?.priority).toBe(DEFAULT_PRIORITY);
    });
  });

  describe("edge cases", () => {
    it("should handle empty string blocker id", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("", { scope: "test" });

      expect(isBlocked("test")).toBe(true);
    });

    it("should handle empty string scope", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("test-blocker", { scope: "" });

      expect(isBlocked("")).toBe(true);
    });

    it("should handle duplicate blocker ids (overwrite)", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("duplicate", { scope: "test", priority: 10 });
      addBlocker("duplicate", { scope: "test", priority: 20 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.priority).toBe(20);
    });
  });

  describe("timeout functionality", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should automatically remove blocker after timeout", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000 });

      expect(isBlocked("test")).toBe(true);

      vi.advanceTimersByTime(1000);

      expect(isBlocked("test")).toBe(false);
    });

    it("should not remove blocker before timeout", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000 });

      vi.advanceTimersByTime(500);

      expect(isBlocked("test")).toBe(true);
    });

    it("should not reset timeout when updating blocker metadata without timeout", () => {
      const { addBlocker, updateBlocker, isBlocked } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000, onTimeout });

      vi.advanceTimersByTime(500);
      updateBlocker("timeout-blocker", { reason: "Still blocking" });

      vi.advanceTimersByTime(600);

      expect(isBlocked("test")).toBe(false);
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it("should restart timeout when updateBlocker changes timeout value", () => {
      const { addBlocker, updateBlocker, isBlocked } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000, onTimeout });

      vi.advanceTimersByTime(500);
      // Update with new timeout - should restart the timer
      updateBlocker("timeout-blocker", { timeout: 2000 });

      // Original timeout would have expired, but timer was restarted
      vi.advanceTimersByTime(600);
      expect(isBlocked("test")).toBe(true);

      // New timeout expires after 2000ms from update
      vi.advanceTimersByTime(1500);
      expect(isBlocked("test")).toBe(false);
      expect(onTimeout).toHaveBeenCalledTimes(1);
    });

    it("should clear timeout when updateBlocker sets timeout to 0", () => {
      const { addBlocker, updateBlocker, isBlocked } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000, onTimeout });

      updateBlocker("timeout-blocker", { timeout: 0 });

      vi.advanceTimersByTime(2000);

      expect(isBlocked("test")).toBe(true);
      expect(onTimeout).not.toHaveBeenCalled();
    });

    it("should call onTimeout callback when blocker times out", () => {
      const { addBlocker } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("timeout-blocker", {
        scope: "test",
        timeout: 1000,
        onTimeout,
      });

      vi.advanceTimersByTime(1000);

      expect(onTimeout).toHaveBeenCalledTimes(1);
      expect(onTimeout).toHaveBeenCalledWith("timeout-blocker");
    });

    it("should not call onTimeout if blocker is removed manually before timeout", () => {
      const { addBlocker, removeBlocker } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("timeout-blocker", {
        scope: "test",
        timeout: 1000,
        onTimeout,
      });

      vi.advanceTimersByTime(500);
      removeBlocker("timeout-blocker");

      vi.advanceTimersByTime(1000);

      expect(onTimeout).not.toHaveBeenCalled();
    });

    it("should clear previous timeout when blocker is overwritten", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("timeout-blocker", { scope: "test", timeout: 1000 });

      vi.advanceTimersByTime(500);

      // Overwrite with new timeout
      addBlocker("timeout-blocker", { scope: "test", timeout: 2000 });

      // Original timeout would have expired
      vi.advanceTimersByTime(600);
      expect(isBlocked("test")).toBe(true);

      // New timeout expires
      vi.advanceTimersByTime(1500);
      expect(isBlocked("test")).toBe(false);
    });

    it("should store timeout value in blocker info", () => {
      const { addBlocker, getBlockingInfo } = uiBlockingStoreApi.getState();

      addBlocker("timeout-blocker", { scope: "test", timeout: 5000 });

      const info = getBlockingInfo("test");
      expect(info).toHaveLength(1);
      expect(info[0]?.timeout).toBe(5000);
    });

    it("should not set timeout if timeout is 0", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("no-timeout-blocker", { scope: "test", timeout: 0 });

      vi.advanceTimersByTime(10000);

      expect(isBlocked("test")).toBe(true);
    });

    it("should not set timeout if timeout is negative", () => {
      const { addBlocker, isBlocked } = uiBlockingStoreApi.getState();

      addBlocker("negative-timeout-blocker", { scope: "test", timeout: -1000 });

      vi.advanceTimersByTime(10000);

      expect(isBlocked("test")).toBe(true);
    });

    it("should clear all timeouts when clearAllBlockers is called", () => {
      const { addBlocker, clearAllBlockers, isBlocked } = uiBlockingStoreApi.getState();
      const onTimeout1 = vi.fn();
      const onTimeout2 = vi.fn();

      addBlocker("blocker1", { scope: "scope1", timeout: 1000, onTimeout: onTimeout1 });
      addBlocker("blocker2", { scope: "scope2", timeout: 2000, onTimeout: onTimeout2 });

      clearAllBlockers();

      vi.advanceTimersByTime(3000);

      expect(onTimeout1).not.toHaveBeenCalled();
      expect(onTimeout2).not.toHaveBeenCalled();
      expect(isBlocked("scope1")).toBe(false);
      expect(isBlocked("scope2")).toBe(false);
    });

    it("should clear timeout when clearBlockersForScope is called", () => {
      const { addBlocker, clearBlockersForScope } = uiBlockingStoreApi.getState();
      const onTimeout = vi.fn();

      addBlocker("scoped-blocker", { scope: "test", timeout: 1000, onTimeout });

      clearBlockersForScope("test");

      vi.advanceTimersByTime(2000);

      expect(onTimeout).not.toHaveBeenCalled();
    });
  });
});
