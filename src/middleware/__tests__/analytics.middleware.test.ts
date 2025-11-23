import { describe, it, expect, beforeEach, vi } from "vitest";
import { createAnalyticsMiddleware } from "../analyticsMiddleware";
import type { MiddlewareContext } from "../middleware.types";
import { BlockerConfig } from "../../store";

describe("createAnalyticsMiddleware", () => {
  describe("Google Analytics", () => {
    let gtagMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      gtagMock = vi.fn();
      window.gtag = gtagMock as typeof window.gtag;
    });

    it("should track add action to GA", () => {
      const middleware = createAnalyticsMiddleware({ provider: "ga" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(gtagMock).toHaveBeenCalledWith("event", "ui_blocking_add", {
        blocker_id: "test-blocker",
        scope: "test",
        reason: "Test reason",
      });
    });

    it("should track remove action to GA", () => {
      const middleware = createAnalyticsMiddleware({ provider: "ga" });

      const context: MiddlewareContext = {
        action: "remove",
        blockerId: "test-blocker",
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(gtagMock).toHaveBeenCalledWith("event", "ui_blocking_remove", {
        blocker_id: "test-blocker",
      });
    });

    it("should handle array scopes in GA", () => {
      const middleware = createAnalyticsMiddleware({ provider: "ga" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: ["scope1", "scope2"],
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(gtagMock).toHaveBeenCalledWith("event", "ui_blocking_add", {
        blocker_id: "test-blocker",
        scope: "scope1,scope2",
        reason: "Test reason",
      });
    });

    it("should not throw if gtag is not available", () => {
      delete window.gtag;

      const middleware = createAnalyticsMiddleware({ provider: "ga" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      expect(() => middleware(context)).not.toThrow();
    });
  });

  describe("Mixpanel", () => {
    let mixpanelMock: { track: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      mixpanelMock = {
        track: vi.fn(),
      };
      window.mixpanel = mixpanelMock as typeof window.mixpanel;
    });

    it("should track add action to Mixpanel", () => {
      const middleware = createAnalyticsMiddleware({ provider: "mixpanel" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
          priority: 50,
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(mixpanelMock.track).toHaveBeenCalledWith("UI Blocking Add", {
        blocker_id: "test-blocker",
        scope: "test",
        reason: "Test reason",
        priority: 50,
      });
    });

    it("should track timeout action to Mixpanel", () => {
      const middleware = createAnalyticsMiddleware({ provider: "mixpanel" });

      const context: MiddlewareContext = {
        action: "timeout",
        blockerId: "test-blocker",
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(mixpanelMock.track).toHaveBeenCalledWith("UI Blocking Timeout", {
        blocker_id: "test-blocker",
      });
    });

    it("should handle array scopes in Mixpanel", () => {
      const middleware = createAnalyticsMiddleware({ provider: "mixpanel" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: ["scope1", "scope2", "scope3"],
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(mixpanelMock.track).toHaveBeenCalledWith("UI Blocking Add", {
        blocker_id: "test-blocker",
        scope: "scope1,scope2,scope3",
        reason: "Test reason",
      });
    });

    it("should not throw if mixpanel is not available", () => {
      delete window.mixpanel;

      const middleware = createAnalyticsMiddleware({ provider: "mixpanel" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      expect(() => middleware(context)).not.toThrow();
    });
  });

  describe("Amplitude", () => {
    let amplitudeMock: { track: ReturnType<typeof vi.fn> };

    beforeEach(() => {
      amplitudeMock = {
        track: vi.fn(),
      };
      window.amplitude = amplitudeMock as typeof window.amplitude;
    });

    it("should track add action to Amplitude", () => {
      const middleware = createAnalyticsMiddleware({ provider: "amplitude" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
          priority: 50,
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(amplitudeMock.track).toHaveBeenCalledWith("UI Blocking Add", {
        blocker_id: "test-blocker",
        scope: "test",
        reason: "Test reason",
        priority: 50,
      });
    });

    it("should track update action to Amplitude", () => {
      const middleware = createAnalyticsMiddleware({ provider: "amplitude" });

      const context: MiddlewareContext = {
        action: "update",
        blockerId: "test-blocker",
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(amplitudeMock.track).toHaveBeenCalledWith("UI Blocking Update", {
        blocker_id: "test-blocker",
      });
    });

    it("should handle array scopes in Amplitude", () => {
      const middleware = createAnalyticsMiddleware({ provider: "amplitude" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: ["scope1", "scope2", "scope3"],
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(amplitudeMock.track).toHaveBeenCalledWith("UI Blocking Add", {
        blocker_id: "test-blocker",
        scope: "scope1,scope2,scope3",
        reason: "Test reason",
      });
    });

    it("should not throw if amplitude is not available", () => {
      delete window.amplitude;

      const middleware = createAnalyticsMiddleware({ provider: "amplitude" });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      expect(() => middleware(context)).not.toThrow();
    });
  });

  describe("Custom tracker", () => {
    it("should use custom track function", () => {
      const trackMock = vi.fn();
      const middleware = createAnalyticsMiddleware({ track: trackMock });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(trackMock).toHaveBeenCalledWith("ui_blocking_add", {
        blocker_id: "test-blocker",
        scope: "test",
        reason: "Test reason",
      });
    });

    it("should track all action types with custom tracker", () => {
      const trackMock = vi.fn();
      const middleware = createAnalyticsMiddleware({ track: trackMock });

      const actions: Array<MiddlewareContext["action"]> = [
        "add",
        "remove",
        "update",
        "cancel",
        "timeout",
      ];

      actions.forEach((action) => {
        const context: MiddlewareContext = {
          action,
          blockerId: "test-blocker",
          timestamp: Date.now(),
        };

        void middleware(context);
      });

      expect(trackMock).toHaveBeenCalledTimes(5);
      expect(trackMock).toHaveBeenCalledWith("ui_blocking_add", expect.anything());
      expect(trackMock).toHaveBeenCalledWith("ui_blocking_remove", expect.anything());
      expect(trackMock).toHaveBeenCalledWith("ui_blocking_update", expect.anything());
      expect(trackMock).toHaveBeenCalledWith("ui_blocking_cancel", expect.anything());
      expect(trackMock).toHaveBeenCalledWith("ui_blocking_timeout", expect.anything());
    });

    it("should handle errors in custom tracker", () => {
      const trackMock = vi.fn(() => {
        throw new Error("Tracking failed");
      });
      const middleware = createAnalyticsMiddleware({ track: trackMock });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      expect(() => middleware(context)).not.toThrow();
    });
  });

  describe("Priority in analytics", () => {
    it("should include priority when provided", () => {
      const trackMock = vi.fn();
      const middleware = createAnalyticsMiddleware({ track: trackMock });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
          priority: 75,
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      expect(trackMock).toHaveBeenCalledWith(
        "ui_blocking_add",
        expect.objectContaining({
          priority: 75,
        })
      );
    });

    it("should not include priority when not provided", () => {
      const trackMock = vi.fn();
      const middleware = createAnalyticsMiddleware({ track: trackMock });

      const context: MiddlewareContext = {
        action: "add",
        blockerId: "test-blocker",
        config: {
          scope: "test",
          reason: "Test reason",
        },
        timestamp: Date.now(),
      };

      void middleware(context);

      const result: BlockerConfig = {
        priority: undefined,
      };

      expect(trackMock).toHaveBeenCalledWith(
        "ui_blocking_add",
        expect.not.objectContaining(result)
      );
    });
  });
});
