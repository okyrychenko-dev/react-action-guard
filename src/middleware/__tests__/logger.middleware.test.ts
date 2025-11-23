import { beforeEach, describe, expect, it, vi } from "vitest";
import { BlockerConfig } from "../../store";
import { loggerMiddleware } from "../loggerMiddleware";
import type { MiddlewareContext } from "../middleware.types";

describe("loggerMiddleware", () => {
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(vi.fn());
  });

  it("should log add action", () => {
    const context: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking]"),
      expect.stringContaining("➕"),
      expect.stringContaining("test-blocker"),
      expect.anything()
    );
  });

  it("should log remove action", () => {
    const context: MiddlewareContext = {
      action: "remove",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking]"),
      expect.stringContaining("➖"),
      expect.stringContaining("test-blocker"),
      expect.anything()
    );
  });

  it("should log update action", () => {
    const context: MiddlewareContext = {
      action: "update",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "Updated reason",
      },
      prevState: {
        scope: "test",
        reason: "Old reason",
      },
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking]"),
      expect.stringContaining("🔄"),
      expect.stringContaining("test-blocker"),
      expect.anything()
    );
  });

  it("should log cancel action", () => {
    const context: MiddlewareContext = {
      action: "cancel",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking]"),
      expect.stringContaining("❌"),
      expect.stringContaining("test-blocker"),
      expect.anything()
    );
  });

  it("should log timeout action", () => {
    const context: MiddlewareContext = {
      action: "timeout",
      blockerId: "test-blocker",
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining("[UIBlocking]"),
      expect.stringContaining("⏱️"),
      expect.stringContaining("test-blocker"),
      expect.anything()
    );
  });

  it("should include config details when present", () => {
    const context: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: ["scope1", "scope2"],
        reason: "Test reason",
        priority: 100,
      },
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.objectContaining<BlockerConfig>({
        scope: ["scope1", "scope2"],
        reason: "Test reason",
        priority: 100,
      })
    );
  });

  it("should include prevState when present", () => {
    const context: MiddlewareContext = {
      action: "update",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "New reason",
      },
      prevState: {
        scope: "test",
        reason: "Old reason",
      },
      timestamp: Date.now(),
    };

    void loggerMiddleware(context);

    const result: Partial<MiddlewareContext> = {
      config: {
        scope: "test",
        reason: "New reason",
      },
      prevState: {
        scope: "test",
        reason: "Old reason",
      },
    };

    expect(consoleLogSpy).toHaveBeenCalledWith("[UIBlocking]", "🔄", "test-blocker", result);
  });
});
