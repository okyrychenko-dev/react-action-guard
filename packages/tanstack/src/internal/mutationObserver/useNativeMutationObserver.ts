import {
  type DefaultError,
  MutationObserver,
  type QueryClient,
  type UseMutationOptions,
  notifyManager,
  shouldThrowError,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { NativeMutationObservation } from "./useNativeMutationObserver.types";

/** Owns the native observer using TanStack's client binding, options and subscription rules. */
export function useNativeMutationObserver<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClient?: QueryClient
): NativeMutationObservation<TData, TError, TVariables, TOnMutateResult> {
  const client = useQueryClient(queryClient);
  const [observer] = useState(
    () => new MutationObserver<TData, TError, TVariables, TOnMutateResult>(client, options)
  );

  useEffect(() => {
    observer.setOptions(options);
  }, [observer, options]);

  const subscribe = useCallback(
    (onStoreChange: VoidFunction) => observer.subscribe(notifyManager.batchCalls(onStoreChange)),
    [observer]
  );
  const getSnapshot = useCallback(() => observer.getCurrentResult(), [observer]);
  const result = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const boundaryError: unknown = result.error;

  if (result.error && shouldThrowError(observer.options.throwOnError, [result.error])) {
    throw boundaryError;
  }

  return { observer, result };
}
