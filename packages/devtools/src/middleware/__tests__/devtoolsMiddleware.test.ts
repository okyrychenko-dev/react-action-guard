import { beforeEach, describe, expect, it } from "vitest";
import { devtoolsStoreApi } from "../../store";
import { createDevtoolsMiddleware } from "../devtoolsMiddleware";
import type { MiddlewareContext } from "@okyrychenko-dev/react-action-guard";

describe("devtoolsMiddleware", () => {
  beforeEach(() => {
    const store = devtoolsStoreApi.getState();
    store.clearEvents();
  });

  it("should record add events", () => {
    const middleware = createDevtoolsMiddleware();
    const context: MiddlewareContext = {
      action: "add",
      blockerId: "test-blocker",
      timestamp: Date.now(),
      config: {
        scope: "global",
        reason: "Test",
        priority: 10,
      },
      prevState: undefined,
    };

    void middleware(context);

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(1);
    expect(store.events[0].action).toBe("add");
    expect(store.events[0].blockerId).toBe("test-blocker");
  });

  it("should record remove events with duration", () => {
    const middleware = createDevtoolsMiddleware();
    const addTime = Date.now();
    const removeTime = addTime + 1000;

    // Add blocker
    void middleware({
      action: "add",
      blockerId: "test-blocker",
      timestamp: addTime,
      config: { scope: "global" },
      prevState: undefined,
    });

    // Remove blocker
    void middleware({
      action: "remove",
      blockerId: "test-blocker",
      timestamp: removeTime,
      config: { scope: "global" },
      prevState: undefined,
    });

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(2);

    // Events are prepended, so remove event is first (index 0)
    const removeEvent = store.events[0];
    expect(removeEvent.action).toBe("remove");
    expect(removeEvent.duration).toBe(1000);
  });

  it("should record update events", () => {
    const middleware = createDevtoolsMiddleware();
    const context: MiddlewareContext = {
      action: "update",
      blockerId: "test-blocker",
      timestamp: Date.now(),
      config: {
        scope: "global",
        priority: 20,
      },
      prevState: {
        scope: "global",
        priority: 10,
      },
    };

    void middleware(context);

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(1);
    expect(store.events[0].action).toBe("update");
    expect(store.events[0].prevState).toEqual({
      scope: "global",
      priority: 10,
    });
  });

  it("should handle multiple blockers independently", () => {
    const middleware = createDevtoolsMiddleware();
    const timestamp = Date.now();

    void middleware({
      action: "add",
      blockerId: "blocker-1",
      timestamp,
      config: { scope: "scope-1" },
      prevState: undefined,
    });

    void middleware({
      action: "add",
      blockerId: "blocker-2",
      timestamp: timestamp + 100,
      config: { scope: "scope-2" },
      prevState: undefined,
    });

    void middleware({
      action: "remove",
      blockerId: "blocker-1",
      timestamp: timestamp + 500,
      config: { scope: "scope-1" },
      prevState: undefined,
    });

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(3);

    const removeEvent = store.events.find(
      (e) => e.action === "remove" && e.blockerId === "blocker-1"
    );
    expect(removeEvent?.duration).toBe(500);
  });

  it("should handle remove without matching add", () => {
    const middleware = createDevtoolsMiddleware();

    void middleware({
      action: "remove",
      blockerId: "unknown-blocker",
      timestamp: Date.now(),
      config: { scope: "global" },
      prevState: undefined,
    });

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(1);
    expect(store.events[0].duration).toBeUndefined();
  });

  it("should record clear events with count", () => {
    const middleware = createDevtoolsMiddleware();
    const context: MiddlewareContext = {
      action: "clear",
      blockerId: "*",
      timestamp: Date.now(),
      count: 5,
    };

    void middleware(context);

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(1);
    expect(store.events[0].action).toBe("clear");
    expect(store.events[0].blockerId).toBe("*");
    expect(store.events[0].count).toBe(5);
  });

  it("should record clear_scope events with scope and count", () => {
    const middleware = createDevtoolsMiddleware();
    const context: MiddlewareContext = {
      action: "clear_scope",
      blockerId: "*",
      timestamp: Date.now(),
      scope: "checkout",
      count: 3,
    };

    void middleware(context);

    const store = devtoolsStoreApi.getState();
    expect(store.events).toHaveLength(1);
    expect(store.events[0].action).toBe("clear_scope");
    expect(store.events[0].blockerId).toBe("*");
    expect(store.events[0].scope).toBe("checkout");
    expect(store.events[0].count).toBe(3);
  });

  it("should clear tracked blocker timestamps after clear", () => {
    const middleware = createDevtoolsMiddleware();
    const timestamp = Date.now();

    void middleware({
      action: "add",
      blockerId: "blocker-1",
      timestamp,
      config: { scope: "checkout" },
      prevState: undefined,
    });

    void middleware({
      action: "clear",
      blockerId: "*",
      timestamp: timestamp + 100,
      count: 1,
    });

    void middleware({
      action: "remove",
      blockerId: "blocker-1",
      timestamp: timestamp + 200,
      config: { scope: "checkout" },
      prevState: undefined,
    });

    const store = devtoolsStoreApi.getState();
    expect(store.events[0].action).toBe("remove");
    expect(store.events[0].duration).toBeUndefined();
  });

  it("should clear tracked blocker timestamps after clear_scope", () => {
    const middleware = createDevtoolsMiddleware();
    const timestamp = Date.now();

    void middleware({
      action: "add",
      blockerId: "checkout-blocker",
      timestamp,
      config: { scope: "checkout" },
      prevState: undefined,
    });

    void middleware({
      action: "add",
      blockerId: "profile-blocker",
      timestamp,
      config: { scope: "profile" },
      prevState: undefined,
    });

    void middleware({
      action: "clear_scope",
      blockerId: "*",
      timestamp: timestamp + 100,
      scope: "checkout",
      count: 1,
    });

    void middleware({
      action: "remove",
      blockerId: "checkout-blocker",
      timestamp: timestamp + 200,
      config: { scope: "checkout" },
      prevState: undefined,
    });

    void middleware({
      action: "remove",
      blockerId: "profile-blocker",
      timestamp: timestamp + 300,
      config: { scope: "profile" },
      prevState: undefined,
    });

    const store = devtoolsStoreApi.getState();
    const checkoutRemoveEvent = store.events.find(
      (event) => event.blockerId === "checkout-blocker"
    );
    const profileRemoveEvent = store.events.find((event) => event.blockerId === "profile-blocker");

    expect(checkoutRemoveEvent?.duration).toBeUndefined();
    expect(profileRemoveEvent?.duration).toBe(300);
  });
});
