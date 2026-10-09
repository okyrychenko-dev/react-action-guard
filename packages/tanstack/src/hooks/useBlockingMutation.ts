import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import { isDefined } from "@okyrychenko-dev/type-utils";
import {
  type DefaultError,
  type QueryClient,
  type UseMutationResult,
  hashKey,
} from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  createMutationExecutionOwner,
  createMutationObservation,
  hasMutationObserverKeyChanged,
} from "../internal/mutationExecution";
import { useNativeMutationObserver } from "../internal/mutationObserver";
import type { UseBlockingMutationOptions } from "./useBlockingMutation.types";

/** Wraps TanStack Mutation with UI blocking. */
export function useBlockingMutation<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
>(
  options: UseBlockingMutationOptions<TData, TError, TVariables, TOnMutateResult>,
  queryClient?: QueryClient
): UseMutationResult<TData, TError, TVariables, TOnMutateResult> {
  const { blockingConfig, mutationKey, ...mutationOptions } = options;
  const { observer, result: mutation } = useNativeMutationObserver(
    { mutationKey, ...mutationOptions },
    queryClient
  );

  const { mutate: nativeMutateAsync, reset: nativeReset } = mutation;
  const store = useResolvedStoreApi();
  const id = useId();
  const [ownerIdentity, setOwnerIdentity] = useState({ store, generation: 0 });

  if (ownerIdentity.store !== store) {
    setOwnerIdentity({ store, generation: ownerIdentity.generation + 1 });
  }

  const ownerId = `${id}:${String(ownerIdentity.generation)}`;

  const [observation] = useState(() => {
    function readNativeError(): boolean {
      return observer.getCurrentResult().isError;
    }

    return createMutationObservation(readNativeError);
  });

  const owner = useMemo(() => {
    // Detached owners can still have pending work when this store returns.
    return createMutationExecutionOwner({ store, id: ownerId, observation });
  }, [store, ownerId, observation]);

  useLayoutEffect(() => {
    owner.attach();

    return owner.detach;
  }, [owner]);

  // Publish committed configuration before any sibling layout effect can invoke work.
  // Store publication remains in layout effects or execution, never insertion effects.
  useInsertionEffect(() => {
    owner.configure(blockingConfig);
  }, [owner, blockingConfig]);

  useLayoutEffect(() => {
    owner.refresh();
  }, [owner, blockingConfig]);

  const keyHash = isDefined(mutationKey) ? hashKey(mutationKey) : undefined;
  const previousKey = useRef(keyHash);

  useEffect(() => {
    if (hasMutationObserverKeyChanged(previousKey.current, keyHash)) {
      owner.reset();
    }
    previousKey.current = keyHash;
  }, [owner, keyHash]);

  const mutateAsync = useCallback<typeof nativeMutateAsync>(
    (variables, mutateOptions) => {
      const token = owner.begin();

      try {
        const promise = nativeMutateAsync(variables, mutateOptions);

        observation.refresh();

        void promise.then(
          () => {
            owner.finish(token);
          },
          () => {
            owner.finish(token);
          }
        );

        return promise;
      } catch (error) {
        owner.finish(token);
        throw error;
      }
    },
    [owner, nativeMutateAsync, observation]
  );

  const mutate = useCallback<
    UseMutationResult<TData, TError, TVariables, TOnMutateResult>["mutate"]
  >(
    (variables, mutateOptions) => {
      void mutateAsync(variables, mutateOptions).catch(() => undefined);
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    nativeReset();

    owner.reset();
  }, [owner, nativeReset]);

  return { ...mutation, mutate, mutateAsync, reset };
}
