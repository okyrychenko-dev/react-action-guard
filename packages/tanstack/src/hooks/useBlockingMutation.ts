import {
  type DefaultError,
  type QueryClient,
  type UseMutationResult,
  useMutation,
} from "@tanstack/react-query";
import { useBlockingCoordination } from "../internal";
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

  useBlockingCoordination({
    kind: "mutation",
    key: mutationKey,
    state: { loading: mutation.isPending, fetching: false, error: mutation.isError },
    config: { ...blockingConfig, reasonOnLoading: blockingConfig.reasonOnPending },
    defaultReason: "Saving changes...",
    defaultPriority: 30,
  });

  return mutation;
}
