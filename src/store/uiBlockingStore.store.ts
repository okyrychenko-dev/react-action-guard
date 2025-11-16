import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { createUIBlockingActions } from "./uiBlockingStore.actions";
import { devtoolsConfig } from "./uiBlockingStore.config";
import type { UIBlockingStoreState, UIBlockingStoreActions } from "./uiBlockingStore.types";

/**
 * UI Blocking Store
 *
 * Global Zustand store for managing UI blocking state across the application.
 * Uses the slice pattern for better code organization and maintainability.
 *
 * Features:
 * - Priority-based blocking system
 * - Scope-based blocking (global, specific areas, or multiple scopes)
 * - Automatic cleanup on unmount (when using hooks)
 * - DevTools integration for debugging
 *
 */
export const uiBlockingStore = create<UIBlockingStoreState & UIBlockingStoreActions>()(
  devtools(createUIBlockingActions, devtoolsConfig)
);

/**
 * UI Blocking Store Hook
 *
 * Hook version of the UI Blocking Store for use in React components.
 * This is an alias for `uiBlockingStore` that follows React hooks naming convention.
 *
 * @see {@link uiBlockingStore} - The underlying Zustand store
 */
export const useUIBlockingStore = uiBlockingStore;
