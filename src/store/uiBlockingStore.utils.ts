import { StateCreator, StoreApi, StoreMutators, createStore, useStore } from "zustand";
import { useShallow } from "zustand/shallow";

/**
 * Creates a Zustand store with automatic shallow comparison for all selectors
 *
 * This utility wraps the standard Zustand store creation and automatically applies
 * `useShallow` to all selectors, preventing unnecessary re-renders when selected
 * values haven't changed (shallow equality).
 *
 * @template StoreState - The type of the store state
 * @template TMutators - Array of middleware mutators (e.g., devtools, persist)
 *
 * @param storeCreator - The state creator function for Zustand
 * @returns Object containing the store hook and store API
 *
 * @see https://docs.pmnd.rs/zustand/guides/prevent-rerenders-with-use-shallow
 */
export function createShallowStore<
  StoreState,
  TMutators extends Array<[keyof StoreMutators<StoreState, StoreState>, unknown]> = [],
>(
  storeCreator: StateCreator<StoreState, [], TMutators, StoreState>
): {
  useStore: <T>(selector: (state: StoreState) => T) => T;
  useStoreApi: StoreApi<StoreState>;
} {
  const storeApi: StoreApi<StoreState> = createStore<StoreState, TMutators>(storeCreator);

  const useScopedStore = <T>(selector: (state: StoreState) => T): T => {
    return useStore(storeApi, useShallow(selector));
  };

  return { useStore: useScopedStore, useStoreApi: storeApi };
}

/**
 * Normalize scope to array format
 *
 * @param scope - Single scope or array of scopes
 * @returns Array of scopes
 *
 * @internal
 */
export function normalizeScopeToArray(scope: string | ReadonlyArray<string>): Array<string> {
  if (typeof scope === "string") {
    return [scope];
  }
  return Array.from(scope);
}
