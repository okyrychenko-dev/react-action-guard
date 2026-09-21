import {
  type ShallowStoreBindings,
  createShallowStore,
} from "@okyrychenko-dev/react-zustand-toolkit";
import { persist } from "zustand/middleware";
import { createDevtoolsActions } from "./devtoolsStore.actions";
import { DEVTOOLS_STORAGE_KEY, DEVTOOLS_STORAGE_VERSION } from "./devtoolsStore.constants";
import {
  type PersistedDevtoolsState,
  createDevtoolsPreferenceStorage,
} from "./devtoolsStore.persistence";
import type { DevtoolsStore } from "../types/devtools.types";

/**
 * Devtools Store
 *
 * Zustand store bindings for default and custom observation sessions.
 *
 * Features:
 * - Event history with circular buffer
 * - Timeline filtering by action/scope/search
 * - Pause/resume recording
 * - Panel open/minimize states
 * - UI preferences persisted to localStorage across reloads
 * - Automatic shallow comparison for selectors
 */
export type DevtoolsStoreBindings = ShallowStoreBindings<
  DevtoolsStore,
  [["zustand/persist", unknown]]
>;

export type DevtoolsStoreApi = DevtoolsStoreBindings["store"];

export function createDevtoolsStoreBindings(): DevtoolsStoreBindings {
  return createShallowStore<DevtoolsStore, [["zustand/persist", unknown]]>(
    persist(createDevtoolsActions, {
      name: DEVTOOLS_STORAGE_KEY,
      version: DEVTOOLS_STORAGE_VERSION,
      storage: createDevtoolsPreferenceStorage(),
      // `isOpen` / `maxEvents` are intentionally excluded — they are owned by the `defaultOpen`
      // and `maxEvents` props, which are re-applied on every mount and would clash with a
      // restored value.
      partialize: (state): PersistedDevtoolsState => ({
        isMinimized: state.isMinimized,
        activeTab: state.activeTab,
        filter: state.filter,
      }),
    })
  );
}

const { store: devtoolsStoreApi } = createDevtoolsStoreBindings();

export { devtoolsStoreApi };
