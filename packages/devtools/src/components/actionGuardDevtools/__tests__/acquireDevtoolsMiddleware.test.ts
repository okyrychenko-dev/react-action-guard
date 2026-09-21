import { DEVTOOLS_MIDDLEWARE_NAME } from "@devtools/middleware";
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

    release();
    release();

    const { middlewares } = uiBlockingStoreApi.getState();

    expect(middlewares.has(DEVTOOLS_MIDDLEWARE_NAME)).toBe(false);
  });
});
