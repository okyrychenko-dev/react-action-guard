import { uiBlockingStoreApi } from "@okyrychenko-dev/react-action-guard";
import { describe, expect, it } from "vitest";
import {
  acquireDevtoolsMiddleware,
  resolveDevtoolsObservationSession,
} from "../acquireDevtoolsMiddleware";

describe("acquireDevtoolsMiddleware", () => {
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
