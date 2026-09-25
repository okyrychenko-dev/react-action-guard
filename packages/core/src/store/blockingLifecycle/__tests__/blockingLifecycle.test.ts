import { afterEach, describe, expect, expectTypeOf, it, vi } from "vitest";
import { createBlockingLifecycle } from "../blockingLifecycle";
import type { BlockingLifecycleObservation } from "../blockingLifecycle.types";

describe("Blocking lifecycle", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
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
});
