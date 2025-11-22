import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useUIBlockingStore } from "../../store";
import { useBlocker } from "../../hooks/useBlocker";
import type { Middleware, MiddlewareContext } from "../middleware.types";

describe("Middleware Integration", () => {
  beforeEach(() => {
    useUIBlockingStore.getState().clearAllBlockers();
    // Clear all middleware
    const state = useUIBlockingStore.getState();
    state.middlewares.forEach((_, name) => {
      state.unregisterMiddleware(name);
    });
  });

  it("should execute middleware on add blocker", () => {
    const middlewareFn = vi.fn();
    const middleware: Middleware = (context) => {
      middlewareFn(context);
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("test-middleware", middleware);

    renderHook(() =>
      useBlocker("test-blocker", {
        scope: "test",
        reason: "Test reason",
      })
    );

    const result: Partial<MiddlewareContext> = {
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: "test",
        reason: "Test reason",
      },
    };

    expect(middlewareFn).toHaveBeenCalledWith(expect.objectContaining(result));
  });

  it("should execute middleware on remove blocker", () => {
    const middlewareFn = vi.fn();
    const middleware: Middleware = (context) => {
      middlewareFn(context);
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("test-middleware", middleware);

    const { unmount } = renderHook(() =>
      useBlocker("test-blocker", {
        scope: "test",
        reason: "Test reason",
      })
    );

    middlewareFn.mockClear();

    unmount();

    expect(middlewareFn).toHaveBeenCalledWith(
      expect.objectContaining({
        action: "remove",
        blockerId: "test-blocker",
      })
    );
  });

  it("should execute multiple middleware in registration order", async () => {
    const callOrder: Array<string> = [];

    const middleware1: Middleware = () => {
      callOrder.push("middleware1");
    };

    const middleware2: Middleware = () => {
      callOrder.push("middleware2");
    };

    const middleware3: Middleware = () => {
      callOrder.push("middleware3");
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("middleware1", middleware1);
    registerMiddleware("middleware2", middleware2);
    registerMiddleware("middleware3", middleware3);

    renderHook(() =>
      useBlocker("test-blocker", {
        scope: "test",
        reason: "Test reason",
      })
    );

    // Wait for async middleware execution
    await waitFor(() => {
      expect(callOrder).toEqual(["middleware1", "middleware2", "middleware3"]);
    });
  });

  it("should handle async middleware", async () => {
    const asyncMiddleware: Middleware = async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("async-middleware", asyncMiddleware);

    renderHook(() =>
      useBlocker("test-blocker", {
        scope: "test",
        reason: "Test reason",
      })
    );

    await waitFor(() => {
      const { isBlocked } = useUIBlockingStore.getState();
      expect(isBlocked("test")).toBe(true);
    });
  });

  it("should handle middleware errors gracefully", () => {
    const errorMiddleware: Middleware = () => {
      throw new Error("Middleware error");
    };

    const successMiddleware = vi.fn();

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("error-middleware", errorMiddleware);
    registerMiddleware("success-middleware", successMiddleware);

    expect(() =>
      renderHook(() =>
        useBlocker("test-blocker", {
          scope: "test",
          reason: "Test reason",
        })
      )
    ).not.toThrow();

    // Success middleware should still be called
    expect(successMiddleware).toHaveBeenCalled();
  });

  it("should allow middleware registration and unregistration", async () => {
    const middleware1 = vi.fn();
    const middleware2 = vi.fn();

    const { registerMiddleware, unregisterMiddleware } = useUIBlockingStore.getState();

    registerMiddleware("middleware1", middleware1);
    registerMiddleware("middleware2", middleware2);

    renderHook(() =>
      useBlocker("test-blocker-1", {
        scope: "test",
        reason: "Test reason",
      })
    );

    await waitFor(() => {
      expect(middleware1).toHaveBeenCalledTimes(1);
      expect(middleware2).toHaveBeenCalledTimes(1);
    });

    unregisterMiddleware("middleware1");

    renderHook(() =>
      useBlocker("test-blocker-2", {
        scope: "test",
        reason: "Test reason",
      })
    );

    await waitFor(() => {
      expect(middleware1).toHaveBeenCalledTimes(1); // Still 1
      expect(middleware2).toHaveBeenCalledTimes(2); // Now 2
    });
  });

  it("should provide correct context to middleware", () => {
    let capturedContext: MiddlewareContext | undefined;

    const middleware: Middleware = (context) => {
      capturedContext = context;
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("test-middleware", middleware);

    renderHook(() =>
      useBlocker("test-blocker", {
        scope: ["scope1", "scope2"],
        reason: "Test reason",
        priority: 75,
      })
    );

    expect(capturedContext).toMatchObject({
      action: "add",
      blockerId: "test-blocker",
      config: {
        scope: ["scope1", "scope2"],
        reason: "Test reason",
        priority: 75,
      },
    });
    expect(capturedContext?.timestamp).toBeTypeOf("number");
  });

  it("should not execute middleware if none registered", () => {
    expect(() =>
      renderHook(() =>
        useBlocker("test-blocker", {
          scope: "test",
          reason: "Test reason",
        })
      )
    ).not.toThrow();

    const { isBlocked } = useUIBlockingStore.getState();
    expect(isBlocked("test")).toBe(true);
  });

  it("should handle middleware re-registration with same name", () => {
    const middleware1 = vi.fn();
    const middleware2 = vi.fn();

    const { registerMiddleware } = useUIBlockingStore.getState();

    registerMiddleware("my-middleware", middleware1);

    renderHook(() =>
      useBlocker("test-blocker-1", {
        scope: "test",
        reason: "Test reason",
      })
    );

    expect(middleware1).toHaveBeenCalledTimes(1);
    expect(middleware2).not.toHaveBeenCalled();

    // Re-register with same name
    registerMiddleware("my-middleware", middleware2);

    renderHook(() =>
      useBlocker("test-blocker-2", {
        scope: "test",
        reason: "Test reason",
      })
    );

    expect(middleware1).toHaveBeenCalledTimes(1); // Still 1
    expect(middleware2).toHaveBeenCalledTimes(1); // Now called
  });

  it("should support middleware composition", async () => {
    const log: Array<string> = [];

    const loggingMiddleware: Middleware = (context) => {
      log.push(`[LOG] ${context.action} - ${context.blockerId}`);
    };

    const analyticsMiddleware: Middleware = (context) => {
      log.push(`[ANALYTICS] ${context.action} - ${context.blockerId}`);
    };

    const { registerMiddleware } = useUIBlockingStore.getState();
    registerMiddleware("logging", loggingMiddleware);
    registerMiddleware("analytics", analyticsMiddleware);

    const { unmount } = renderHook(() =>
      useBlocker("composed-blocker", {
        scope: "test",
        reason: "Test reason",
      })
    );

    await waitFor(() => {
      expect(log).toContain("[LOG] add - composed-blocker");
      expect(log).toContain("[ANALYTICS] add - composed-blocker");
    });

    unmount();

    await waitFor(() => {
      expect(log).toEqual([
        "[LOG] add - composed-blocker",
        "[ANALYTICS] add - composed-blocker",
        "[LOG] remove - composed-blocker",
        "[ANALYTICS] remove - composed-blocker",
      ]);
    });
  });
});
