import {
  UIBlockingProvider,
  uiBlockingStoreApi,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "../../../middleware";
import { resolveDevtoolsObservationSession } from "../acquireDevtoolsMiddleware";
import type { MiddlewareContext } from "@okyrychenko-dev/react-action-guard";
import type { ObservationSession } from "../acquireDevtoolsMiddleware.types";

function eventsOf(session: ObservationSession) {
  const { events } = session.devtoolsStore.getState();

  return events;
}

function maxEventsOf(session: ObservationSession) {
  const { maxEvents } = session.devtoolsStore.getState();

  return maxEvents;
}

afterEach(() => vi.restoreAllMocks());

describe("Observation session participation", () => {
  it("shares one history and observer across participants", () => {
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

  it("isolates blocking stores and retains session identity across epochs", () => {
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

  it("transfers authority to the earliest configured participant without applying candidate values", () => {
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
    expect(maxEventsOf(session)).toBe(10);
    later.updateConfiguration({ defaultOpen: true, maxEvents: 30 });
    expect(maxEventsOf(session)).toBe(10);
    successor.updateConfiguration({ defaultOpen: true, maxEvents: 20 });
    expect(maxEventsOf(session)).toBe(20);
    successor.release();
    later.release();
  });

  it("ignores stale releases and updates after a new epoch begins", () => {
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

  it("detaches observation before resetting runtime state on final release", () => {
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

  it("keeps custom-store automatic observation additive to manual middleware", () => {
    const store = renderHook(() => useUIBlockingContext(), { wrapper: UIBlockingProvider }).result
      .current;
    const session = resolveDevtoolsObservationSession(store);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const manual = vi.fn();
    const { addBlocker, registerMiddleware, removeBlocker, unregisterMiddleware } =
      store.getState();

    registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manual);
    const participant = session.participate();

    addBlocker("custom-manual-event");

    expect(manual).toHaveBeenCalled();
    expect(
      eventsOf(session).filter((event) => event.blockerId === "custom-manual-event")
    ).toHaveLength(1);
    expect(warn).toHaveBeenCalled();

    participant.release();
    unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
    removeBlocker("custom-manual-event");
  });

  it("preserves a manual registration installed during observation delivery and after release", () => {
    const {
      addBlocker,
      observeBlockingEvents,
      registerMiddleware,
      removeBlocker,
      unregisterMiddleware,
    } = uiBlockingStoreApi.getState();
    const manual = createDevtoolsMiddleware();
    const releaseEarlierObserver = observeBlockingEvents((event: MiddlewareContext) => {
      if (event.blockerId === "registration-event") {
        registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manual);
      }
    });
    const session = resolveDevtoolsObservationSession();
    const participant = session.participate();

    try {
      addBlocker("registration-event");
      expect(
        eventsOf(session).filter((event) => event.blockerId === "registration-event")
      ).toHaveLength(1);

      participant.release();
      addBlocker("after-release-event");
      expect(
        eventsOf(session).filter((event) => event.blockerId === "after-release-event")
      ).toHaveLength(1);
    } finally {
      participant.release();
      releaseEarlierObserver();
      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
      removeBlocker("registration-event");
      removeBlocker("after-release-event");
    }
  });

  it("keeps a manual global registration authoritative", () => {
    const { addBlocker, registerMiddleware, removeBlocker, unregisterMiddleware } =
      uiBlockingStoreApi.getState();

    registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware());
    const session = resolveDevtoolsObservationSession();
    const participant = session.participate();

    try {
      addBlocker("manual-event");
      expect(eventsOf(session).filter((event) => event.blockerId === "manual-event")).toHaveLength(
        1
      );
    } finally {
      participant.release();
      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
      removeBlocker("manual-event");
    }
  });
});
