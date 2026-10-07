import { type Nullable, isDefined, isNull } from "@okyrychenko-dev/type-utils";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useResolvedStoreApi } from "../../context";
import { useConfigRef } from "../useConfigRef";
import { areBlockerConfigsEqual, trackHookRegistration } from "./useActionBlocker.utils";
import type { BlockerConfig } from "../../store";
import type {
  UseBlockerRegistrationOptions,
  UseBlockerRegistrationReturn,
} from "./useBlockerRegistration.types";

/** Owns registration, reactive replacement and timeout completion for activation adapters. */
export function useBlockerRegistration({
  blockerId,
  config,
  endEpisodeOnTimeout = false,
}: UseBlockerRegistrationOptions): UseBlockerRegistrationReturn {
  const store = useResolvedStoreApi();
  const lastConfigRef = useRef<Nullable<BlockerConfig>>(null);
  const releaseRef = useRef<Nullable<VoidFunction>>(null);
  const expiredRef = useRef(false);
  const configRef = useConfigRef(config);

  const handleTimeout = useCallback(
    (id: string): void => {
      expiredRef.current = endEpisodeOnTimeout;
      configRef.current.onTimeout?.(id);
    },
    [configRef, endEpisodeOnTimeout]
  );

  const storeConfig = useMemo<BlockerConfig>(() => {
    const shouldTrackTimeout = endEpisodeOnTimeout && isDefined(config.timeout);
    const hasTimeoutCallback = isDefined(config.onTimeout);
    let onTimeout: BlockerConfig["onTimeout"];

    if (shouldTrackTimeout || hasTimeoutCallback) {
      onTimeout = handleTimeout;
    }

    return { ...config, onTimeout };
  }, [config, handleTimeout, endEpisodeOnTimeout]);
  const storeConfigRef = useConfigRef(storeConfig);

  const activate = useCallback((): void => {
    if (!blockerId || !isNull(releaseRef.current)) {
      return;
    }

    const { addBlocker } = store.getState();

    expiredRef.current = false;
    releaseRef.current = trackHookRegistration(store, blockerId);
    lastConfigRef.current = storeConfigRef.current;

    addBlocker(blockerId, storeConfigRef.current);
  }, [blockerId, store, storeConfigRef]);

  const deactivate = useCallback((): void => {
    if (isNull(releaseRef.current)) {
      return;
    }

    const { removeBlocker } = store.getState();

    releaseRef.current();
    releaseRef.current = null;
    lastConfigRef.current = null;
    expiredRef.current = false;

    removeBlocker(blockerId);
  }, [blockerId, store]);

  useEffect(() => deactivate, [deactivate]);

  useEffect(() => {
    if (
      isNull(lastConfigRef.current) ||
      expiredRef.current ||
      areBlockerConfigsEqual(lastConfigRef.current, storeConfig)
    ) {
      return;
    }

    const { replaceBlocker } = store.getState();

    replaceBlocker(blockerId, storeConfig);

    lastConfigRef.current = storeConfig;
  }, [blockerId, store, storeConfig]);

  return { activate, deactivate };
}
