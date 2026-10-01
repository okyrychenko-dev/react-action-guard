import { afterEach, describe, expect, it, vi } from "vitest";
import { uiBlockingStoreApi } from "../../store";
import { configureMiddleware } from "../configureMiddleware";

describe("configureMiddleware", () => {
  afterEach(() => {
    configureMiddleware([]);

    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should replace only configured observations and retain registration order", () => {
    const { addBlocker, observeBlockingEvents } = uiBlockingStoreApi.getState();
    const calls: Array<string> = [];
    const release = observeBlockingEvents(() => {
      calls.push("independent");
    });
    const previous = vi.fn();

    configureMiddleware([previous]);
    configureMiddleware([
      () => {
        calls.push("first");
      },
      () => {
        calls.push("second");
      },
    ]);
    addBlocker("configured");
    expect(previous).not.toHaveBeenCalled();
    expect(calls).toEqual(["independent", "first", "second"]);
    configureMiddleware([]);
    addBlocker("after-configure");
    expect(calls).toEqual(["independent", "first", "second", "independent"]);
    release();
  });
});
