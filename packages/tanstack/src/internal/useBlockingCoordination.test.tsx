import {
  UIBlockingProvider,
  uiBlockingStoreApi,
  useUIBlockingContext,
} from "@okyrychenko-dev/react-action-guard";
import { renderHook } from "@testing-library/react";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBlockingCoordination } from "./useBlockingCoordination";
import type { BlockingCoordinationOptions } from "./useBlockingCoordination.types";

const idleState = { loading: false, fetching: false, error: false };

function useTestCoordination(options: BlockingCoordinationOptions): void {
  useBlockingCoordination(options);
}

function blockingReasons(): Array<string> {
  const { getBlockingInfo } = uiBlockingStoreApi.getState();

  return getBlockingInfo("coordination").map(({ reason }) => reason);
}

describe("useBlockingCoordination", () => {
  beforeEach(() => {
    const { clearAllBlockers } = uiBlockingStoreApi.getState();

    clearAllBlockers();
  });

  it("should apply shared policy and loading, fetching, error reason precedence", () => {
    const options: BlockingCoordinationOptions = {
      kind: "query",
      key: ["shared-policy"],
      state: idleState,
      config: {
        scope: "coordination",
        reason: "Default",
        reasonOnLoading: "Loading",
        reasonOnFetching: "Fetching",
        reasonOnError: "Error",
        onFetching: true,
        onError: true,
      },
      defaultReason: "Fallback",
      defaultPriority: 10,
    };
    const { rerender, unmount } = renderHook(useTestCoordination, { initialProps: options });

    expect(blockingReasons()).toEqual([]);

    options.state = { loading: true, fetching: true, error: true };
    rerender(options);
    expect(blockingReasons()).toEqual(["Loading"]);

    options.state = { loading: false, fetching: true, error: true };
    rerender(options);
    expect(blockingReasons()).toEqual(["Fetching"]);

    options.state = { loading: false, fetching: false, error: true };
    rerender(options);
    expect(blockingReasons()).toEqual(["Error"]);

    options.state = idleState;
    rerender(options);
    expect(blockingReasons()).toEqual([]);
    unmount();
  });

  it("should release only its own blocker after identity changes and unmount", () => {
    const options: BlockingCoordinationOptions = {
      kind: "query",
      key: ["first"],
      state: { loading: true, fetching: false, error: false },
      config: { scope: "coordination", reason: "Owned" },
      defaultReason: "Fallback",
      defaultPriority: 10,
    };
    const first = renderHook(useTestCoordination, { initialProps: options });
    const second = renderHook(useTestCoordination, { initialProps: options });

    expect(blockingReasons()).toEqual(["Owned", "Owned"]);

    options.key = ["second"];
    first.rerender(options);
    expect(blockingReasons()).toEqual(["Owned", "Owned"]);
    first.unmount();
    expect(blockingReasons()).toEqual(["Owned"]);
    second.unmount();
    expect(blockingReasons()).toEqual([]);
  });

  it("should forward timeout and callback to the blocking lifecycle", () => {
    vi.useFakeTimers();
    try {
      const onTimeout = vi.fn();
      const options: BlockingCoordinationOptions = {
        kind: "mutation",
        state: { loading: true, fetching: false, error: false },
        config: { scope: "coordination", timeout: 50, onTimeout },
        defaultReason: "Saving",
        defaultPriority: 30,
      };
      const { unmount } = renderHook(useTestCoordination, { initialProps: options });

      expect(blockingReasons()).toEqual(["Saving"]);
      vi.advanceTimersByTime(50);
      expect(onTimeout).toHaveBeenCalledOnce();
      expect(blockingReasons()).toEqual([]);
      unmount();
    } finally {
      vi.useRealTimers();
    }
  });
  it("should retain a single owned blocker across Strict Mode effects and config updates", () => {
    const options: BlockingCoordinationOptions = {
      kind: "query",
      key: ["strict"],
      state: { loading: true, fetching: false, error: false },
      config: { scope: "coordination", reason: "First" },
      defaultReason: "Fallback",
      defaultPriority: 10,
    };
    const { rerender, unmount } = renderHook(useTestCoordination, {
      initialProps: options,
      wrapper: StrictMode,
    });

    expect(blockingReasons()).toEqual(["First"]);
    rerender({ ...options, config: { ...options.config, reason: "Second" } });
    expect(blockingReasons()).toEqual(["Second"]);
    unmount();
    expect(blockingReasons()).toEqual([]);
  });

  it("should resolve the nearest provider and release its blocker independently of global state", () => {
    const options: BlockingCoordinationOptions = {
      kind: "queries",
      state: { loading: true, fetching: false, error: false },
      config: { scope: "coordination" },
      defaultReason: "Fallback",
      defaultPriority: 10,
    };
    const { result, unmount } = renderHook(
      () => {
        useBlockingCoordination(options);

        return useUIBlockingContext();
      },
      { wrapper: UIBlockingProvider }
    );
    const { getBlockingInfo } = result.current.getState();

    expect(getBlockingInfo("coordination")).toHaveLength(1);
    expect(blockingReasons()).toEqual([]);
    unmount();
    expect(getBlockingInfo("coordination")).toEqual([]);
  });

  it("should apply default policy, explicit opt-outs, fallback reasons, scopes and priority", () => {
    const options: BlockingCoordinationOptions = {
      kind: "mutation",
      state: { loading: false, fetching: true, error: true },
      config: { scope: ["coordination", "other"], priority: 42 },
      defaultReason: "Fallback",
      defaultPriority: 10,
    };
    const { rerender, unmount } = renderHook(useTestCoordination, { initialProps: options });

    expect(blockingReasons()).toEqual([]);
    rerender({ ...options, state: { loading: true, fetching: true, error: true } });

    const { getBlockingInfo } = uiBlockingStoreApi.getState();

    expect(getBlockingInfo("other")[0]).toMatchObject({ reason: "Fallback", priority: 42 });
    rerender({
      ...options,
      state: { loading: true, fetching: true, error: true },
      config: { ...options.config, onLoading: false },
    });
    expect(blockingReasons()).toEqual([]);
    unmount();
  });
});
