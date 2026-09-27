import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { hashKey } from "@tanstack/react-query";
import { useEffect, useId, useRef } from "react";
import type {
  BlockingCoordinationOptions,
  BlockingPolicy,
  BlockingState,
} from "./useBlockingCoordination.types";

function resolveReason(
  state: BlockingState,
  config: BlockingPolicy,
  defaultReason: string
): string {
  const { reason = defaultReason, reasonOnLoading, reasonOnFetching, reasonOnError } = config;

  if (state.loading && reasonOnLoading !== undefined) {
    return reasonOnLoading;
  }
  if (state.fetching && reasonOnFetching !== undefined) {
    return reasonOnFetching;
  }
  if (state.error && reasonOnError !== undefined) {
    return reasonOnError;
  }

  return reason;
}

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
  const blockerId = key
    ? `${kind}-${hashKey(key)}-${instanceId}`
    : kind === "queries"
      ? instanceId
      : `${kind}-${instanceId}`;
  const store = useResolvedStoreApi();
  const { addBlocker, updateBlocker, removeBlocker } = store.getState();
  const registered = useRef(false);

  const {
    scope,
    priority = defaultPriority,
    timeout,
    onTimeout,
    onLoading = true,
    onFetching = false,
    onError = false,
  } = config;

  const shouldBlock =
    (onLoading && state.loading) || (onFetching && state.fetching) || (onError && state.error);
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

    if (shouldBlock) {
      if (registered.current) {
        updateBlocker(blockerId, blockerConfig);
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
    updateBlocker,
    removeBlocker,
    blockerId,
    shouldBlock,
    scope,
    currentReason,
    priority,
    timeout,
    onTimeout,
  ]);
}
