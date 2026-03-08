import { createShallowStore } from "@okyrychenko-dev/react-zustand-toolkit";
import { devtools } from "zustand/middleware";
import { createUIBlockingActions } from "./uiBlockingStore.actions";
import { devtoolsConfig } from "./uiBlockingStore.config";
import type { UIBlockingStore } from "./uiBlockingStore.types";

/**
 * UI Blocking Store
 *
 * Global Zustand store for managing UI blocking state across the application.
 *
 * Features:
 * - Priority-based blocking system
 * - Scope-based blocking (global, specific areas, or multiple scopes)
 * - Automatic cleanup on unmount (when using hooks)
 * - DevTools integration for debugging
 * - Automatic shallow comparison for selectors
 *
 */
const storeBindings = createShallowStore<UIBlockingStore, [["zustand/devtools", never]]>(
  devtools(createUIBlockingActions, devtoolsConfig)
);

const uiBlockingStoreApi = storeBindings.useStoreApi;

export function useUIBlockingStore(): UIBlockingStore;
export function useUIBlockingStore<T>(
  selector: (state: UIBlockingStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T;
export function useUIBlockingStore<T>(
  selector?: (state: UIBlockingStore) => T,
  equalityFn?: (a: T, b: T) => boolean
): T | UIBlockingStore {
  if (selector) {
    return storeBindings.useStore(selector, equalityFn);
  }

  return storeBindings.useStore();
}
export { uiBlockingStoreApi };
