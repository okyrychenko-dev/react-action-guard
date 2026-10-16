import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { createBlockingLifecycle } from "../blockingLifecycle";
import type { Middleware, MiddlewareContext } from "../../../middleware";
import type { BlockingLifecycleObservation } from "../blockingLifecycle.types";

describe("Blocking lifecycle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should emit the latest metadata after the timeout callback updates its registration", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const events: Array<MiddlewareContext> = [];

    lifecycle.observe((event) => {
      events.push(event);
    });
    lifecycle.add("save", {
      scope: "original",
      reason: "pending",
      priority: 1,
      timeout: 100,
      onTimeout: () => {
        lifecycle.update("save", {
          scope: ["updated", "navigation"],
          reason: "expired",
          priority: 9,
        });
      },
    });
    vi.advanceTimersByTime(100);

    const added = events.find(({ action }) => action === "add");
    const expired = events.find(({ action }) => action === "timeout");

    expect(expired?.config).toEqual({
      scope: ["updated", "navigation"],
      reason: "expired",
      priority: 9,
      timeout: 100,
    });
    expect(added?.registration).toBeDefined();
    expect(expired?.registration).toBe(added?.registration);
    expect(events.map(({ action }) => action)).toEqual(["add", "update", "timeout", "remove"]);
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it.each([3_600_000, 2_147_483_648])(
    "should count completed timer chunks for timeout %s when the monotonic clock pauses",
    (timeout) => {
      vi.useFakeTimers();
      vi.spyOn(performance, "now").mockReturnValue(0);

      const lifecycle = createBlockingLifecycle();
      const onTimeout = vi.fn();
      const events: Array<string> = [];

      lifecycle.observe(({ action }) => {
        events.push(action);
      });
      lifecycle.add("sleeping", { timeout, onTimeout });

      vi.advanceTimersByTime(timeout - 1);

      expect(lifecycle.isBlocked()).toBe(true);
      expect(onTimeout).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);

      expect(lifecycle.isBlocked()).toBe(false);
      expect(onTimeout).toHaveBeenCalledExactlyOnceWith("sleeping");
      expect(events).toEqual(["add", "timeout", "remove"]);
    }
  );

  it.each([
    { timeout: 100, clockShift: -86_400_000 },
    { timeout: 4_294_967_294, clockShift: -86_400_000 },
    { timeout: 4_294_967_294, clockShift: 86_400_000 },
  ])(
    "should expire after $timeout elapsed milliseconds despite a wall-clock shift of $clockShift",
    ({ timeout, clockShift }) => {
      vi.useFakeTimers();
      vi.setSystemTime(100_000_000);

      const lifecycle = createBlockingLifecycle();
      const onTimeout = vi.fn();
      const events: Array<string> = [];

      lifecycle.observe(({ action }) => {
        events.push(action);
      });
      lifecycle.add("save", { timeout, onTimeout });

      vi.advanceTimersByTime(50);
      vi.setSystemTime(Date.now() + clockShift);
      vi.advanceTimersByTime(timeout - 51);

      expect(lifecycle.isBlocked()).toBe(true);
      expect(onTimeout).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);

      expect(lifecycle.isBlocked()).toBe(false);
      expect(onTimeout).toHaveBeenCalledExactlyOnceWith("save");
      expect(events).toEqual(["add", "timeout", "remove"]);
    }
  );

  it.each([NaN, Infinity, -Infinity, Number.MAX_VALUE])(
    "should reject invalid timeout %s atomically on add, replacement and update",
    (timeout) => {
      vi.useFakeTimers();

      const lifecycle = createBlockingLifecycle();
      const onTimeout = vi.fn();
      const events = vi.fn<Middleware>();

      lifecycle.observe(events);
      lifecycle.add("save", { timeout: 100, onTimeout });

      vi.advanceTimersByTime(40);

      const snapshot = lifecycle.getSnapshot();

      expect(() => lifecycle.add("other", { timeout })).toThrow(RangeError);
      expect(() => lifecycle.add("save", { timeout })).toThrow(RangeError);
      expect(() => lifecycle.replace("save", { timeout })).toThrow(RangeError);
      expect(() => lifecycle.update("save", { timeout })).toThrow(RangeError);
      expect(lifecycle.getSnapshot()).toBe(snapshot);
      expect(events).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(60);

      expect(onTimeout).toHaveBeenCalledExactlyOnceWith("save");
      expect(lifecycle.isBlocked()).toBe(false);
    }
  );

  it.each([undefined, 0, -1, -Number.MAX_VALUE])(
    "should leave timeout %s active without automatic expiration",
    (timeout) => {
      vi.useFakeTimers();

      const lifecycle = createBlockingLifecycle();
      const onTimeout = vi.fn();

      lifecycle.add("indefinite", { timeout, onTimeout });

      vi.advanceTimersByTime(4_294_967_296);

      expect(lifecycle.isBlocked()).toBe(true);
      expect(onTimeout).not.toHaveBeenCalled();

      lifecycle.clear();
    }
  );

  it("should preserve a valid existing deadline near the representability limit", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const lifecycle = createBlockingLifecycle();
    const timeout = Number.MAX_SAFE_INTEGER - 1_000;

    lifecycle.add("save", { timeout });

    vi.advanceTimersByTime(1);

    expect(() => lifecycle.update("save", { reason: "updated" })).not.toThrow();
    expect(() => lifecycle.replace("save", { timeout, reason: "replaced" })).not.toThrow();
    expect(lifecycle.getSnapshot()[0]?.reason).toBe("replaced");
    expect(lifecycle.isBlocked()).toBe(true);

    lifecycle.clear();
  });

  it("should ignore a late chunk after replacing a long-lived registration", () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => undefined);

    const lifecycle = createBlockingLifecycle();
    const onTimeout = vi.fn();

    lifecycle.add("save", { timeout: 4_294_967_294, onTimeout });

    vi.advanceTimersByTime(2_147_483_647);

    lifecycle.add("save", { reason: "new owner" });

    vi.advanceTimersByTime(2_147_483_647);

    expect(onTimeout).not.toHaveBeenCalled();
    expect(lifecycle.getSnapshot()[0]?.reason).toBe("new owner");

    lifecycle.clear();
  });

  it("should keep a long timeout blocked until its exact deadline and expire once", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const onTimeout = vi.fn();
    const events: Array<string> = [];

    lifecycle.observe(({ action }) => {
      events.push(action);
    });
    lifecycle.add("long", { timeout: 2_147_483_648, onTimeout });

    vi.advanceTimersByTime(2_147_483_647);

    expect(lifecycle.isBlocked()).toBe(true);
    expect(onTimeout).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(lifecycle.isBlocked()).toBe(false);
    expect(onTimeout).toHaveBeenCalledExactlyOnceWith("long");
    expect(events).toEqual(["add", "timeout", "remove"]);
  });

  it("should preserve reactive deadlines and invoke only the current callback", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const obsolete = vi.fn();
    const current = vi.fn();

    lifecycle.add("saving", { timeout: 100, onTimeout: obsolete, timestamp: 10 });

    vi.advanceTimersByTime(40);

    lifecycle.replace("saving", { timeout: 100, onTimeout: current, reason: "Updated" });

    expect(lifecycle.getSnapshot()[0]?.timestamp).toBe(10);

    vi.advanceTimersByTime(59);

    expect(lifecycle.isBlocked()).toBe(true);

    vi.advanceTimersByTime(1);

    expect(current).toHaveBeenCalledWith("saving");
    expect(obsolete).not.toHaveBeenCalled();
    expect(lifecycle.isBlocked()).toBe(false);
  });

  it("should clear an undefined callback without extending an unchanged deadline", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const onTimeout = vi.fn();

    lifecycle.add("save", { timeout: 100, onTimeout });

    vi.advanceTimersByTime(40);

    lifecycle.replace("save", { timeout: 100, onTimeout: undefined });

    vi.advanceTimersByTime(60);

    expect(onTimeout).not.toHaveBeenCalled();
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it("should restart changed reactive timeouts and cancel removed timeouts", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();

    lifecycle.add("save", { timeout: 100 });

    vi.advanceTimersByTime(40);

    lifecycle.replace("save", { timeout: 200 });

    vi.advanceTimersByTime(199);

    expect(lifecycle.isBlocked()).toBe(true);

    vi.advanceTimersByTime(1);

    expect(lifecycle.isBlocked()).toBe(false);

    lifecycle.replace("save", { timeout: 50 });

    vi.advanceTimersByTime(20);

    lifecycle.replace("save", { timeout: undefined });

    vi.advanceTimersByTime(100);

    expect(lifecycle.getSnapshot()[0]?.timeout).toBeUndefined();
    expect(lifecycle.isBlocked()).toBe(true);

    lifecycle.clear();
  });

  it("should preserve omitted and undefined fields in imperative patches", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const onTimeout = vi.fn();

    lifecycle.update("save", {
      scope: "form",
      reason: "Saving",
      priority: 20,
      timeout: 100,
      onTimeout,
    });

    const initial = lifecycle.getSnapshot();

    vi.advanceTimersByTime(40);
    lifecycle.update("save", {
      scope: undefined,
      reason: undefined,
      priority: undefined,
      timeout: undefined,
      onTimeout: undefined,
    });

    expect(lifecycle.getSnapshot()).toEqual(initial);

    vi.advanceTimersByTime(60);

    expect(onTimeout).toHaveBeenCalledWith("save");
    expect(lifecycle.isBlocked("form")).toBe(false);
  });

  it("should reuse its snapshot until a transition publishes new state", () => {
    const lifecycle = createBlockingLifecycle();
    const initial = lifecycle.getSnapshot();

    expect(lifecycle.getSnapshot()).toBe(initial);

    lifecycle.add("first");

    const added = lifecycle.getSnapshot();

    expect(added).not.toBe(initial);
    expect(lifecycle.getSnapshot()).toBe(added);
  });

  it("should release only the matching snapshot subscription", () => {
    const lifecycle = createBlockingLifecycle();
    const listener = vi.fn();
    const releaseFirst = lifecycle.subscribe(listener);
    const releaseSecond = lifecycle.subscribe(listener);

    lifecycle.add("first");

    expect(listener).toHaveBeenCalledTimes(2);

    releaseFirst();
    releaseFirst();
    lifecycle.remove("first");

    expect(listener).toHaveBeenCalledTimes(3);

    releaseSecond();
    lifecycle.add("second");
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it("should deliver each snapshot to all subscribers before a reentrant publication", () => {
    const lifecycle = createBlockingLifecycle();
    const received: Array<string> = [];

    lifecycle.subscribe((snapshot) => {
      const ids = snapshot.map(({ id }) => id).join(",");

      received.push(`first:${ids}`);

      if (ids === "first") {
        lifecycle.clear();
      }
    });
    lifecycle.subscribe((snapshot) => {
      received.push(`second:${snapshot.map(({ id }) => id).join(",")}`);
    });

    lifecycle.add("first");

    expect(received).toEqual(["first:first", "second:first", "first:", "second:"]);
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it("should drain chained reentrant publications in transition order", () => {
    const lifecycle = createBlockingLifecycle();
    const received: Array<string> = [];

    lifecycle.subscribe((snapshot) => {
      const ids = snapshot.map(({ id }) => id).join(",");

      received.push(`first:${ids}`);

      if (ids === "first") {
        lifecycle.add("second");
        throw Error("subscriber");
      }
    });
    lifecycle.subscribe((snapshot) => {
      const ids = snapshot.map(({ id }) => id).join(",");

      received.push(`second:${ids}`);

      if (ids === "first,second") {
        lifecycle.remove("first");
      }
    });

    lifecycle.add("first");

    expect(received).toEqual([
      "first:first",
      "second:first",
      "first:first,second",
      "second:first,second",
      "first:second",
      "second:second",
    ]);
    expect(lifecycle.getSnapshot().map(({ id }) => id)).toEqual(["second"]);
  });

  it("should emit transition events in snapshot order across reentrant actions", () => {
    const lifecycle = createBlockingLifecycle();
    const events: Array<string> = [];

    lifecycle.subscribe((snapshot) => {
      if (snapshot.some(({ id }) => id === "first")) {
        lifecycle.clear();
      }
    });
    lifecycle.observe(({ action }) => {
      events.push(action);
    });

    lifecycle.add("first");

    expect(events).toEqual(["add", "clear"]);
  });

  it("should finish an event before delivering actions started by its observers", () => {
    const lifecycle = createBlockingLifecycle();
    const received: Array<string> = [];

    lifecycle.observe(({ action }) => {
      received.push(`first:${action}`);

      if (action === "add") {
        lifecycle.clear();
      }
    });
    lifecycle.observe(({ action }) => {
      received.push(`second:${action}`);
    });

    lifecycle.add("first");

    expect(received).toEqual(["first:add", "second:add", "first:clear", "second:clear"]);
  });

  it("should expose synchronous immutable reads across transitions", () => {
    const lifecycle = createBlockingLifecycle();
    const observation: BlockingLifecycleObservation = lifecycle;
    const observed: Array<ReadonlyArray<string>> = [];

    observation.subscribe((snapshot) => observed.push(snapshot.map(({ id }) => id)));

    lifecycle.add("first", { scope: "form", priority: 10 });

    const earlier = observation.getSnapshot();

    lifecycle.add("second", { scope: "form", priority: 20 });
    lifecycle.update("first", { reason: "Updated" });
    lifecycle.clearScope("form");

    expect(earlier.map(({ id }) => id)).toEqual(["first"]);
    expect(Object.isFrozen(earlier)).toBe(true);
    expect(Object.isFrozen(earlier[0])).toBe(true);
    expect(lifecycle.getBlockingInfo("form")).toEqual([]);
    expect(observed).toEqual([["first"], ["first", "second"], ["first", "second"], []]);
  });

  it("should expose readonly entries from scoped blocker reads", () => {
    const lifecycle = createBlockingLifecycle();

    lifecycle.add("first", { scope: "form" });

    const info = lifecycle.getBlockingInfo("form");

    expectTypeOf(info).toEqualTypeOf<ReturnType<typeof lifecycle.getSnapshot>>();
    expect(Object.isFrozen(info)).toBe(true);
    expect(Object.isFrozen(info[0])).toBe(true);
  });

  it("should preserve update-as-upsert and ordered timeout then removal events", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const events: Array<string> = [];

    lifecycle.observe(({ action }) => {
      events.push(action);
    });

    lifecycle.update("first", {
      scope: "form",
      timeout: 10,
      onTimeout: () => {
        throw Error("callback");
      },
    });
    expect(lifecycle.isBlocked("form")).toBe(true);
    expect(() => vi.advanceTimersByTime(10)).not.toThrow();

    expect(lifecycle.isBlocked("form")).toBe(false);
    expect(events).toEqual(["add", "timeout", "remove"]);
  });

  it("should ignore a replaced blocker's stale timeout", () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "clearTimeout").mockImplementation(() => undefined);

    const lifecycle = createBlockingLifecycle();
    const oldTimeout = vi.fn();

    lifecycle.add("first", { timeout: 10, onTimeout: oldTimeout });
    vi.advanceTimersByTime(5);
    lifecycle.add("first", { reason: "replacement", timeout: 20 });
    vi.advanceTimersByTime(5);

    expect(oldTimeout).not.toHaveBeenCalled();
    expect(lifecycle.getSnapshot()[0]?.reason).toBe("replacement");
    vi.advanceTimersByTime(15);
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it("should preserve a timer when metadata changes and use the latest callback", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const initial = vi.fn();
    const latest = vi.fn();

    lifecycle.add("first", { timeout: 10, onTimeout: initial });
    vi.advanceTimersByTime(5);
    lifecycle.update("first", { onTimeout: latest });
    vi.advanceTimersByTime(5);

    expect(initial).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledWith("first");
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it("should clear targeted blockers while preserving global blockers", () => {
    const lifecycle = createBlockingLifecycle();
    const events: Array<string> = [];

    lifecycle.observe(({ action }) => {
      events.push(action);
    });

    lifecycle.add("global");
    lifecycle.add("form", { scope: "form" });
    lifecycle.clearScope("form");

    expect(lifecycle.getSnapshot().map(({ id }) => id)).toEqual(["global"]);
    lifecycle.clear();
    expect(lifecycle.getSnapshot()).toEqual([]);
    expect(events).toEqual(["add", "add", "clear_scope", "clear"]);
  });

  it("should preserve a replacement created by a timeout callback", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();

    lifecycle.add("first", {
      timeout: 10,
      onTimeout: () => {
        lifecycle.add("first", { reason: "replacement" });
      },
    });

    vi.advanceTimersByTime(10);
    expect(lifecycle.getSnapshot()[0]?.reason).toBe("replacement");
  });

  it("should defer observers registered during delivery until the next event", () => {
    const lifecycle = createBlockingLifecycle();
    const received: Array<string> = [];

    lifecycle.observe(() => {
      received.push("first");
      lifecycle.observe(() => {
        received.push("later");
      });
    });

    lifecycle.add("first");
    expect(received).toEqual(["first"]);

    lifecycle.add("second");
    expect(received).toEqual(["first", "first", "later"]);
  });

  it("should skip an observer released before its turn in the current event", () => {
    const lifecycle = createBlockingLifecycle();
    const received: Array<string> = [];
    const laterLease: { release?: VoidFunction } = {};

    lifecycle.observe(() => {
      received.push("first");
      laterLease.release?.();
    });
    laterLease.release = lifecycle.observe(() => {
      received.push("later");
    });

    lifecycle.add("first");
    expect(received).toEqual(["first"]);
  });

  it("should release only the matching observer registration", () => {
    const lifecycle = createBlockingLifecycle();
    const observation: BlockingLifecycleObservation = lifecycle;
    const observer = vi.fn();
    const releaseFirst = observation.observe(observer);
    const releaseSecond = observation.observe(observer);

    lifecycle.add("first");
    expect(observer).toHaveBeenCalledTimes(2);

    releaseFirst();
    releaseFirst();
    lifecycle.remove("first");
    expect(observer).toHaveBeenCalledTimes(3);

    releaseSecond();
    lifecycle.add("second");
    expect(observer).toHaveBeenCalledTimes(3);
  });

  it("should isolate observer failures from transitions and later observers", async () => {
    const lifecycle = createBlockingLifecycle();
    const events: Array<string> = [];

    lifecycle.observe(() => {
      throw Error("observer");
    });
    lifecycle.observe(() => Promise.reject(Error("async observer")));
    lifecycle.observe(({ action }) => {
      events.push(action);
    });

    lifecycle.add("first");
    lifecycle.remove("first");
    await Promise.resolve();

    expect(events).toEqual(["add", "remove"]);
    expect(lifecycle.getSnapshot()).toEqual([]);
  });

  it("should normalize default values and preserve public transition contexts", () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);

    const lifecycle = createBlockingLifecycle();
    const observer = vi.fn<Middleware>();

    lifecycle.observe(observer);
    lifecycle.add("default");

    expect(lifecycle.getSnapshot()[0]).toMatchObject({
      id: "default",
      scope: "global",
      reason: "Unknown",
      priority: 0,
      timestamp: 1000,
    });

    lifecycle.update("default", { scope: ["form"], reason: "Saving", priority: -5 });

    expect(lifecycle.getBlockingInfo("form")[0]).toMatchObject({ reason: "Saving", priority: 0 });
    expect(observer.mock.calls[1]?.[0]).toMatchObject({
      action: "update",
      blockerId: "default",
      config: { reason: "Saving", priority: 0 },
      prevState: { scope: "global", reason: "Unknown" },
    });

    lifecycle.remove("default");

    expect(observer.mock.calls[2]?.[0]).toMatchObject({
      action: "remove",
      blockerId: "default",
      config: { reason: "Saving" },
    });
    expect(observer.mock.calls.every(([event]) => !("timeoutId" in (event.config ?? {})))).toBe(
      true
    );
  });

  it("should restart changed timeouts and disable them explicitly", () => {
    vi.useFakeTimers();

    const lifecycle = createBlockingLifecycle();
    const onTimeout = vi.fn();

    lifecycle.add("save", { timeout: 100, onTimeout });
    vi.advanceTimersByTime(50);
    lifecycle.update("save", { timeout: 200 });
    vi.advanceTimersByTime(100);
    expect(lifecycle.isBlocked()).toBe(true);
    lifecycle.update("save", { timeout: 0 });
    vi.advanceTimersByTime(500);
    expect(onTimeout).not.toHaveBeenCalled();
    expect(lifecycle.isBlocked()).toBe(true);
    lifecycle.update("save", { timeout: 10 });
    vi.advanceTimersByTime(10);
    expect(onTimeout).toHaveBeenCalledWith("save");
    expect(lifecycle.isBlocked()).toBe(false);
  });

  it.each(["remove", "clear", "clearScope"])(
    "should cancel timeout callbacks when blockers are released by %s",
    (operation) => {
      vi.useFakeTimers();

      const lifecycle = createBlockingLifecycle();
      const onTimeout = vi.fn();

      lifecycle.add("save", { scope: "form", timeout: 4_294_967_294, onTimeout });
      vi.advanceTimersByTime(2_147_483_647);
      if (operation === "remove") {
        lifecycle.remove("save");
      } else if (operation === "clear") {
        lifecycle.clear();
      } else {
        lifecycle.clearScope("form");
      }
      vi.advanceTimersByTime(2_147_483_647);
      expect(onTimeout).not.toHaveBeenCalled();
      expect(lifecycle.getSnapshot()).toEqual([]);
    }
  );
});
