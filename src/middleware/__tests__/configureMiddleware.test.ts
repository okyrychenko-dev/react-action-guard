import { beforeEach, describe, expect, it, vi } from "vitest";
import { uiBlockingStoreApi } from "../../store/uiBlockingStore.store";
import { configureMiddleware } from "../configureMiddleware";
import type { Middleware } from "../middleware.types";

describe("configureMiddleware", () => {
  beforeEach(() => {
    // Clear all middleware before each test
    const state = uiBlockingStoreApi.getState();
    state.middlewares.forEach((_, name) => {
      state.unregisterMiddleware(name);
    });
  });

  it("should register multiple middleware", () => {
    const middleware1: Middleware = vi.fn();
    const middleware2: Middleware = vi.fn();
    const middleware3: Middleware = vi.fn();

    configureMiddleware([middleware1, middleware2, middleware3]);

    const state = uiBlockingStoreApi.getState();

    expect(state.middlewares.size).toBe(3);
    expect(state.middlewares.get("middleware-0")).toBe(middleware1);
    expect(state.middlewares.get("middleware-1")).toBe(middleware2);
    expect(state.middlewares.get("middleware-2")).toBe(middleware3);
  });

  it("should handle empty array", () => {
    configureMiddleware([]);

    const state = uiBlockingStoreApi.getState();

    expect(state.middlewares.size).toBe(0);
  });

  it("should handle single middleware", () => {
    const middleware: Middleware = vi.fn();

    configureMiddleware([middleware]);

    const state = uiBlockingStoreApi.getState();

    expect(state.middlewares.size).toBe(1);
    expect(state.middlewares.get("middleware-0")).toBe(middleware);
  });

  it("should generate unique names for each middleware", () => {
    const middleware1: Middleware = vi.fn();
    const middleware2: Middleware = vi.fn();

    configureMiddleware([middleware1, middleware2]);

    const state = uiBlockingStoreApi.getState();
    const names = Array.from(state.middlewares.keys());

    expect(names).toContain("middleware-0");
    expect(names).toContain("middleware-1");
    expect(new Set(names).size).toBe(2); // All names are unique
  });
});
