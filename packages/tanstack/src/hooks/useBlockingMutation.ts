import { useResolvedStoreApi } from "@okyrychenko-dev/react-action-guard";
import {
  type DefaultError,
  type QueryClient,
  type UseMutationResult,
  hashKey,
  useMutation,
} from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import {
  createMutationExecutionOwner,
  hasMutationObserverKeyChanged,
} from "../internal/mutationExecution";
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
  const mutation = useMutation({ mutationKey, ...mutationOptions }, queryClient);

  const { mutateAsync: nativeMutateAsync, reset: nativeReset } = mutation;
  const store = useResolvedStoreApi();
  const id = useId();
  const owner = useMemo(() => createMutationExecutionOwner({ store, id }), [store, id]);

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

  const keyHash = mutationKey ? hashKey(mutationKey) : undefined;
  const previousKey = useRef(keyHash);

  useEffect(() => {
    if (hasMutationObserverKeyChanged(previousKey.current, keyHash)) {
      owner.reset();
    }
    previousKey.current = keyHash;
  }, [owner, keyHash]);

  const mutateAsync = useCallback<typeof mutation.mutateAsync>(
    (variables, mutateOptions) => {
      const token = owner.begin();

      try {
        owner.markLatest(token);

        const promise = nativeMutateAsync(variables, mutateOptions);

        void promise.then(
          () => {
            owner.finish(token, false);
          },
          () => {
            owner.finish(token, true);
          }
        );

        return promise;
      } catch (error) {
        owner.finish(token, false);
        throw error;
      }
    },
    [owner, nativeMutateAsync]
  );

  const mutate = useCallback<typeof mutation.mutate>(
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
