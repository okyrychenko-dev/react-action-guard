import { describe, expect, it } from "vitest";
import { formatLogData, getActionEmoji } from "../loggerMiddleware.utils";

describe("loggerMiddleware.utils", () => {
  it("returns an emoji for every supported action and falls back for unknown actions", () => {
    expect(getActionEmoji("add")).toBe("➕");
    expect(getActionEmoji("update")).toBe("🔄");
    expect(getActionEmoji("remove")).toBe("➖");
    expect(getActionEmoji("timeout")).toBe("⏱️");
    expect(getActionEmoji("clear")).toBe("🧹");
    expect(getActionEmoji("clear_scope")).toBe("🎯");
    expect(getActionEmoji("unexpected")).toBe("❓");
  });

  it("returns empty log data when no config or special fields are provided", () => {
    expect(
      formatLogData({
        action: "remove",
        blockerId: "blocker",
        timestamp: Date.now(),
      })
    ).toEqual({});
  });

  it("returns config details directly when only config is present", () => {
    expect(
      formatLogData({
        action: "add",
        blockerId: "blocker",
        timestamp: Date.now(),
        config: {
          scope: "checkout",
          reason: "Submitting order",
          priority: 90,
        },
      })
    ).toEqual({
      scope: "checkout",
      reason: "Submitting order",
      priority: 90,
    });
  });

  it("keeps special fields when scope, count, or previous state are present", () => {
    expect(
      formatLogData({
        action: "clear_scope",
        blockerId: "blocker",
        timestamp: Date.now(),
        scope: "checkout",
        count: 2,
        config: {
          scope: "checkout",
          reason: "Submitting order",
        },
        prevState: {
          scope: "checkout",
          reason: "Previous reason",
          priority: 50,
        },
      })
    ).toEqual({
      scope: "checkout",
      count: 2,
      config: {
        scope: "checkout",
        reason: "Submitting order",
      },
      prevState: {
        scope: "checkout",
        reason: "Previous reason",
        priority: 50,
      },
    });
  });
});
