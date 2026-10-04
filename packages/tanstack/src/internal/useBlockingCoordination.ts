import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { useEffect, useId, useRef } from "react";
import { resolveBlockerId, resolveReason, shouldBlock } from "./useBlockingCoordination.utils";
import type { BlockingCoordinationOptions } from "./useBlockingCoordination.types";

/** Owns one blocker and interprets the shared TanStack blocking policy. */
export function useBlockingCoordination({
  kind,
  key,
  state,
  config,
  defaultReason,
  defaultPriority,
}: BlockingCoordinationOptions): void {
  const instanceId = useId();
  const blockerId = resolveBlockerId(kind, key, instanceId);
  const store = useResolvedStoreApi();
  const { addBlocker, replaceBlocker, removeBlocker } = store.getState();
  const registered = useRef(false);

  const { scope, priority = defaultPriority, timeout, onTimeout } = config;

  const blocking = shouldBlock(state, config);
  const currentReason = resolveReason(state, config, defaultReason);

  useEffect(() => {
    return () => {
      if (registered.current) {
        removeBlocker(blockerId);
        registered.current = false;
      }
    };
  }, [blockerId, removeBlocker]);

  useEffect(() => {
    const blockerConfig = { scope, reason: currentReason, priority, timeout, onTimeout };

    if (blocking) {
      if (registered.current) {
        replaceBlocker(blockerId, blockerConfig);
      } else {
        addBlocker(blockerId, blockerConfig);
        registered.current = true;
      }
    } else if (registered.current) {
      removeBlocker(blockerId);
      registered.current = false;
    }
  }, [
    addBlocker,
    replaceBlocker,
    removeBlocker,
    blockerId,
    blocking,
    scope,
    currentReason,
    priority,
    timeout,
    onTimeout,
  ]);
}
