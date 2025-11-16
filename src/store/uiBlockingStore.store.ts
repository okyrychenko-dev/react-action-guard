import { create } from "zustand";
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
 *
 */
export const useUIBlockingStore = create<UIBlockingStore>()(
  devtools(createUIBlockingActions, devtoolsConfig)
);
