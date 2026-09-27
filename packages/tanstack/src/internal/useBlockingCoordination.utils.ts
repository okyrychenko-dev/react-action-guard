import { type Optional, isDefined } from "@okyrychenko-dev/type-utils";
import { type QueryKey, hashKey } from "@tanstack/react-query";
import type { BlockingKind, BlockingPolicy, BlockingState } from "./useBlockingCoordination.types";

export function resolveReason(
  state: BlockingState,
  config: BlockingPolicy,
  defaultReason: string
): string {
  const { reason = defaultReason, reasonOnLoading, reasonOnFetching, reasonOnError } = config;

  if (state.loading && isDefined(reasonOnLoading)) {
    return reasonOnLoading;
  }
  if (state.fetching && isDefined(reasonOnFetching)) {
    return reasonOnFetching;
  }
  if (state.error && isDefined(reasonOnError)) {
    return reasonOnError;
  }

  return reason;
}

export function resolveBlockerId(
  kind: BlockingKind,
  key: Optional<QueryKey>,
  instanceId: string
): string {
  if (isDefined(key)) {
    return `${kind}-${hashKey(key)}-${instanceId}`;
  }

  return kind === "queries" ? instanceId : `${kind}-${instanceId}`;
}

export function shouldBlock(state: BlockingState, config: BlockingPolicy): boolean {
  const { onLoading = true, onFetching = false, onError = false } = config;

  return (onLoading && state.loading) || (onFetching && state.fetching) || (onError && state.error);
}
