import { useActionBlocker } from "@okyrychenko-dev/react-action-guard";
import { useId } from "react";
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
  const { scope, priority = defaultPriority, timeout, onTimeout } = config;

  const blocking = shouldBlock(state, config);
  const currentReason = resolveReason(state, config, defaultReason);

  useActionBlocker(
    blockerId,
    { scope, reason: currentReason, priority, timeout, onTimeout },
    blocking
  );
}
