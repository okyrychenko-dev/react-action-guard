import {
  UIBlockingProvider,
  createPerformanceMiddleware,
  uiBlockingStoreApi,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveDevtoolsObservationSession } from "../acquireDevtoolsMiddleware";
import type { ObservationSession } from "../acquireDevtoolsMiddleware.types";

function eventsOf(session: ObservationSession) {
  const { events } = session.devtoolsStore.getState();

  return events;
}

function maxEventsOf(session: ObservationSession) {
  const { maxEvents } = session.devtoolsStore.getState();

  return maxEvents;
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("Observation session participation", () => {
  it("should preserve moved lifetimes and global exclusions in callbacks and session history", () => {
    vi.useFakeTimers();

    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const participant = session.participate();
    const {
      addBlocker,
      updateBlocker,
      removeBlocker,
      clearBlockersForScope,
      clearAllBlockers,
      observeBlockingEvents,
      isBlocked,
    } = store.getState();
    const onSlowBlock = vi.fn();
    const releasePerformance = observeBlockingEvents(
      createPerformanceMiddleware({ slowBlockThreshold: 0, onSlowBlock })
    );

    addBlocker("x", { scope: "a" });
    addBlocker("y", { scope: ["a", "c"] });
    addBlocker("global");
    addBlocker("global-array", { scope: ["global", "a"] });

    vi.advanceTimersByTime(100);

    updateBlocker("x", { scope: "b" });
    clearBlockersForScope("a");

    expect(onSlowBlock.mock.calls).toEqual([["y", 100]]);
    expect(isBlocked("b")).toBe(true);

    vi.advanceTimersByTime(100);

    removeBlocker("x");

    expect(
      eventsOf(session).find((event) => event.action === "remove" && event.blockerId === "x")
        ?.duration
    ).toBe(200);

    clearBlockersForScope("global");
    removeBlocker("global");
    removeBlocker("global-array");

    expect(onSlowBlock.mock.calls).toEqual([
      ["y", 100],
      ["x", 200],
      ["global", 200],
      ["global-array", 200],
    ]);

    for (const id of ["global", "global-array"]) {
      expect(
        eventsOf(session).find((event) => event.action === "remove" && event.blockerId === id)
          ?.duration
      ).toBe(200);
    }

    addBlocker("x", { scope: "a" });

    vi.advanceTimersByTime(25);

    clearAllBlockers();
    addBlocker("x", { scope: "b" });

    vi.advanceTimersByTime(50);

    removeBlocker("x");

    expect(onSlowBlock.mock.calls.slice(-2)).toEqual([
      ["x", 25],
      ["x", 50],
    ]);
    expect(
      eventsOf(session)
        .filter((event) => event.action === "remove" && event.blockerId === "x")
        .map((event) => event.duration)
    ).toEqual([50, 200]);
    expect(
      eventsOf(session)
        .filter((event) => event.action === "clear" || event.action === "clear_scope")
        .every((event) => event.duration === undefined)
    ).toBe(true);

    releasePerformance();
    participant.release();

    expect(eventsOf(session)).toEqual([]);
  });

  it("should restart replacement timing and finalize timeout only once", () => {
    vi.useFakeTimers();

    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const participant = session.participate();
    const { addBlocker, updateBlocker, removeBlocker, observeBlockingEvents } = store.getState();
    const onSlowBlock = vi.fn();
    const releasePerformance = observeBlockingEvents(
      createPerformanceMiddleware({ slowBlockThreshold: 0, onSlowBlock })
    );

    addBlocker("reused", { scope: "a" });

    vi.advanceTimersByTime(100);

    addBlocker("reused", { scope: ["b", "c"], timeout: 200 });

    vi.advanceTimersByTime(50);

    updateBlocker("reused", { reason: "still pending" });

    vi.advanceTimersByTime(150);

    expect(onSlowBlock.mock.calls).toEqual([["reused", 200]]);

    const terminal = eventsOf(session).filter(
      (event) => event.action === "timeout" || event.action === "remove"
    );

    expect(terminal.map((event) => [event.action, event.duration])).toEqual([
      ["remove", undefined],
      ["timeout", 200],
    ]);

    addBlocker("reused", { scope: "c" });

    vi.advanceTimersByTime(25);

    removeBlocker("reused");

    expect(onSlowBlock.mock.calls).toEqual([
      ["reused", 200],
      ["reused", 25],
    ]);
    expect(eventsOf(session)[0].duration).toBe(25);

    releasePerformance();
    participant.release();
  });

  it("should keep a literal star ID separate from bulk event timing", () => {
    vi.useFakeTimers();

    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const participant = session.participate();
    const { addBlocker, removeBlocker, clearBlockersForScope, observeBlockingEvents } =
      store.getState();
    const onSlowBlock = vi.fn();
    const releasePerformance = observeBlockingEvents(
      createPerformanceMiddleware({ slowBlockThreshold: 0, onSlowBlock })
    );

    addBlocker("*", { scope: "b" });
    addBlocker("y", { scope: "a" });

    vi.advanceTimersByTime(100);

    clearBlockersForScope("a");

    expect(eventsOf(session)[0].duration).toBeUndefined();

    vi.advanceTimersByTime(100);

    removeBlocker("*");

    expect(eventsOf(session)[0].duration).toBe(200);
    expect(onSlowBlock.mock.calls).toEqual([
      ["y", 100],
      ["*", 200],
    ]);

    releasePerformance();
    participant.release();
  });

  it("should preserve a replacement added by the timeout callback", () => {
    vi.useFakeTimers();

    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const participant = session.participate();
    const { addBlocker, removeBlocker, observeBlockingEvents, isBlocked } = store.getState();
    const onSlowBlock = vi.fn();
    const releasePerformance = observeBlockingEvents(
      createPerformanceMiddleware({ slowBlockThreshold: 0, onSlowBlock })
    );

    addBlocker("reentrant", {
      scope: "old",
      timeout: 100,
      onTimeout: () => {
        addBlocker("reentrant", { scope: "replacement" });
      },
    });

    vi.advanceTimersByTime(100);

    expect(isBlocked("replacement")).toBe(true);
    expect(onSlowBlock.mock.calls).toEqual([["reentrant", 100]]);
    expect(eventsOf(session).find((event) => event.action === "timeout")?.duration).toBe(100);

    vi.advanceTimersByTime(75);

    removeBlocker("reentrant");

    expect(onSlowBlock.mock.calls).toEqual([
      ["reentrant", 100],
      ["reentrant", 75],
    ]);
    expect(eventsOf(session)[0].duration).toBe(75);

    releasePerformance();
    participant.release();
  });

  it.each(["remove", "clear", "clear_scope"])(
    "should not finalize an already %s lifetime again after callback replacement",
    (cleanup) => {
      vi.useFakeTimers();

      const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
        .current;
      const session = resolveDevtoolsObservationSession(store);
      const participant = session.participate();
      const {
        addBlocker,
        removeBlocker,
        clearAllBlockers,
        clearBlockersForScope,
        observeBlockingEvents,
      } = store.getState();
      const onSlowBlock = vi.fn();
      const releasePerformance = observeBlockingEvents(
        createPerformanceMiddleware({ slowBlockThreshold: 0, onSlowBlock })
      );

      addBlocker("reentrant", {
        scope: "old",
        timeout: 100,
        onTimeout: () => {
          if (cleanup === "remove") {
            removeBlocker("reentrant");
          } else if (cleanup === "clear") {
            clearAllBlockers();
          } else {
            clearBlockersForScope("old");
          }
          addBlocker("reentrant", { scope: "replacement" });
        },
      });
      vi.advanceTimersByTime(100);
      expect(onSlowBlock.mock.calls).toEqual([["reentrant", 100]]);
      expect(
        eventsOf(session).find((event) => event.action === "timeout")?.duration
      ).toBeUndefined();
      vi.advanceTimersByTime(75);
      removeBlocker("reentrant");
      expect(onSlowBlock.mock.calls).toEqual([
        ["reentrant", 100],
        ["reentrant", 75],
      ]);
      expect(eventsOf(session)[0].duration).toBe(75);
      releasePerformance();
      participant.release();
    }
  );

  it("should share one history and observer across participants", () => {
    const session = resolveDevtoolsObservationSession();
    const first = session.participate({ defaultOpen: true, maxEvents: 10 });
    const second = session.participate();
    const { addBlocker, removeBlocker } = uiBlockingStoreApi.getState();

    addBlocker("shared-event");

    const { events, isOpen } = session.devtoolsStore.getState();

    expect(events.filter((event) => event.blockerId === "shared-event")).toHaveLength(1);
    expect(isOpen).toBe(true);

    first.release();
    first.release();

    addBlocker("second-event");
    expect(eventsOf(session).some((event) => event.blockerId === "second-event")).toBe(true);

    second.release();

    removeBlocker("shared-event");
    removeBlocker("second-event");
    expect(eventsOf(session)).toEqual([]);
  });

  it("should isolate blocking stores and retain session identity across epochs", () => {
    const firstStore = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider })
      .result.current;
    const secondStore = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider })
      .result.current;
    const firstSession = resolveDevtoolsObservationSession(firstStore);
    const secondSession = resolveDevtoolsObservationSession(secondStore);
    const first = firstSession.participate();
    const second = secondSession.participate();
    const { addBlocker } = firstStore.getState();

    addBlocker("first-only");

    expect(eventsOf(firstSession)).toHaveLength(1);
    expect(eventsOf(secondSession)).toHaveLength(0);

    first.release();
    second.release();

    expect(resolveDevtoolsObservationSession(firstStore)).toBe(firstSession);
  });

  it("should transfer authority to the earliest configured participant without applying candidate values", () => {
    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const first = session.participate({ defaultOpen: false, maxEvents: 10 });
    const successor = session.participate({ defaultOpen: true, maxEvents: 20 });
    const later = session.participate({ defaultOpen: true, maxEvents: 30 });

    expect(maxEventsOf(session)).toBe(10);
    expect(warn).toHaveBeenCalled();

    first.release();
    first.updateConfiguration({ defaultOpen: true, maxEvents: 50 });

    expect(maxEventsOf(session)).toBe(10);

    later.updateConfiguration({ defaultOpen: true, maxEvents: 30 });

    expect(maxEventsOf(session)).toBe(10);

    successor.updateConfiguration({ defaultOpen: true, maxEvents: 20 });

    expect(maxEventsOf(session)).toBe(20);

    successor.release();
    later.release();
  });

  it("should preserve the current open state when a successor updates maxEvents", () => {
    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);

    vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const owner = session.participate({ defaultOpen: false, maxEvents: 10 });
    const successor = session.participate({ defaultOpen: true, maxEvents: 20 });
    const { setOpen } = session.devtoolsStore.getState();

    setOpen(true);
    setOpen(false);

    owner.release();
    successor.updateConfiguration({ defaultOpen: true, maxEvents: 30 });

    const { isOpen, maxEvents } = session.devtoolsStore.getState();

    expect(isOpen).toBe(false);
    expect(maxEvents).toBe(30);

    successor.release();
  });

  it("should ignore stale releases and updates after a new epoch begins", () => {
    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const previous = session.participate({ defaultOpen: true, maxEvents: 10 });

    previous.release();

    const current = session.participate({ defaultOpen: false, maxEvents: 25 });

    previous.release();
    previous.updateConfiguration({ defaultOpen: true, maxEvents: 50 });

    expect(maxEventsOf(session)).toBe(25);

    current.release();
  });

  it("should detach observation before resetting runtime state on final release", () => {
    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const participant = session.participate({ defaultOpen: true, maxEvents: 10 });
    const { addBlocker, removeBlocker } = store.getState();

    addBlocker("before-reset");

    const { events: recordedEvents, selectEvent, togglePause } = session.devtoolsStore.getState();
    const recordedEvent = recordedEvents.find((event) => event.blockerId === "before-reset");

    expect(recordedEvent).toBeDefined();

    selectEvent(recordedEvent?.id ?? null);
    togglePause();

    let emittedDuringReset = false;
    const unsubscribe = session.devtoolsStore.subscribe((state) => {
      if (!emittedDuringReset && !state.isOpen) {
        emittedDuringReset = true;
        addBlocker("during-reset");
      }
    });

    participant.release();

    const { events, isOpen, isPaused, maxEvents, selectedEventId } =
      session.devtoolsStore.getState();

    expect(emittedDuringReset).toBe(true);
    expect({ events, isOpen, isPaused, maxEvents, selectedEventId }).toEqual({
      events: [],
      isOpen: false,
      isPaused: false,
      maxEvents: 200,
      selectedEventId: null,
    });

    unsubscribe();

    removeBlocker("before-reset");
    removeBlocker("during-reset");
  });

  it("should release only session observation and preserve an independent observation lease", () => {
    const { addBlocker, observeBlockingEvents, removeBlocker } = uiBlockingStoreApi.getState();
    const manual = vi.fn();
    const releaseManual = observeBlockingEvents(manual);
    const session = resolveDevtoolsObservationSession();
    const participant = session.participate();

    addBlocker("leased-event");

    expect(eventsOf(session).filter((event) => event.blockerId === "leased-event")).toHaveLength(1);
    expect(manual).toHaveBeenCalledOnce();

    participant.release();
    removeBlocker("leased-event");

    expect(eventsOf(session)).toEqual([]);
    expect(manual).toHaveBeenCalledTimes(2);

    releaseManual();
  });
});
