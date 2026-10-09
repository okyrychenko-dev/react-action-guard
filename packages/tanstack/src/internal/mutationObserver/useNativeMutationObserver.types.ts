import type { MutationObserver, MutationObserverResult } from "@tanstack/react-query";

export interface NativeMutationObservation<TData, TError, TVariables, TOnMutateResult> {
  observer: MutationObserver<TData, TError, TVariables, TOnMutateResult>;
  result: MutationObserverResult<TData, TError, TVariables, TOnMutateResult>;
}
