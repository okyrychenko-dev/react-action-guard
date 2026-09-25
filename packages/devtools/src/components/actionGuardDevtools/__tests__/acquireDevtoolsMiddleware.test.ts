import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { describe, expect, it } from "vitest";
import { DEVTOOLS_MIDDLEWARE_NAME, createDevtoolsMiddleware } from "../../../middleware";
import {
  acquireDevtoolsMiddleware,
  resolveDevtoolsObservationSession,
} from "../acquireDevtoolsMiddleware";
import type { MiddlewareContext } from "@okyrychenko-dev/react-action-guard";

describe("acquireDevtoolsMiddleware", () => {
  it("should keep automatic observation for a manual registration made during delivery", () => {
    const {
      addBlocker,
      observeBlockingEvents,
      registerMiddleware,
      removeBlocker,
      unregisterMiddleware,
    } = uiBlockingStoreApi.getState();
    const manualMiddleware = createDevtoolsMiddleware();

    function registerManualObserver(event: MiddlewareContext): void {
      if (event.blockerId === "registration-event") {
        registerMiddleware(DEVTOOLS_MIDDLEWARE_NAME, manualMiddleware);
      }
    }

    const releaseEarlierObserver = observeBlockingEvents(registerManualObserver);
    const session = resolveDevtoolsObservationSession();
    const releaseSession = acquireDevtoolsMiddleware(session);

    try {
      addBlocker("registration-event");

      const { events } = session.devtoolsStore.getState();

      expect(events.filter(({ blockerId }) => blockerId === "registration-event")).toHaveLength(1);
    } finally {
      releaseSession();
      releaseEarlierObserver();
      unregisterMiddleware(DEVTOOLS_MIDDLEWARE_NAME);
      removeBlocker("registration-event");
    }
  });

  it("should release a session idempotently", () => {
    const session = resolveDevtoolsObservationSession();
    const release = acquireDevtoolsMiddleware(session);

    const { addBlocker, removeBlocker } = uiBlockingStoreApi.getState();

    addBlocker("observed");
    const { events: observedEvents } = session.devtoolsStore.getState();

    expect(observedEvents.some(({ blockerId }) => blockerId === "observed")).toBe(true);

    release();
    release();
    addBlocker("after-release");

    const { events: eventsAfterRelease } = session.devtoolsStore.getState();

    expect(eventsAfterRelease).toEqual([]);
    removeBlocker("observed");
    removeBlocker("after-release");
  });
});
