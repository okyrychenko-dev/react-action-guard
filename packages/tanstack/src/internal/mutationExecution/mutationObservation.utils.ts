import type { MutationObservation } from "./mutationExecution.types";

/** Shares authoritative native observation without sharing pending execution ownership. */
export function createMutationObservation(readNativeError: () => boolean): MutationObservation {
  const listeners = new Set<VoidFunction>();

  function refresh(): void {
    for (const listener of [...listeners]) {
      if (listeners.has(listener)) {
        listener();
      }
    }
  }

  function subscribe(listener: VoidFunction): VoidFunction {
    listeners.add(listener);

    function unsubscribe(): void {
      listeners.delete(listener);
    }

    return unsubscribe;
  }

  return { refresh, isError: readNativeError, subscribe };
}
