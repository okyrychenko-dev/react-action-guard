import {
  type ShallowStoreBindings,
  createShallowStore,
} from "@okyrychenko-dev/react-zustand-toolkit";
import { type StateStorage, createJSONStorage, persist } from "zustand/middleware";
import { createDevtoolsActions } from "./devtoolsStore.actions";
import { DEVTOOLS_STORAGE_KEY, DEVTOOLS_STORAGE_VERSION } from "./devtoolsStore.constants";
import type { DevtoolsStore } from "../types/devtools.types";

/** No-op storage used when localStorage is unavailable (e.g. SSR). */
const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

/**
 * Subset of devtools state persisted across reloads.
 *
 * Only UI preferences are stored — never the recorded `events` (they belong to a
 * single session), nor transient state like `selectedEventId` / `isPaused`.
 *
 * `isOpen` and `maxEvents` are also excluded: both are owned by props (`defaultOpen` /
 * `maxEvents`) that `ActionGuardDevtools` re-applies on every mount, which would otherwise
 * clash with a restored value.
 */
type PersistedDevtoolsState = Pick<DevtoolsStore, "isMinimized" | "activeTab" | "filter">;

/**
 * Devtools Store
 *
 * Global Zustand store for managing devtools state across the application.
 *
 * Features:
 * - Event history with circular buffer
 * - Timeline filtering by action/scope/search
 * - Pause/resume recording
 * - Panel open/minimize states
 * - UI preferences persisted to localStorage across reloads
 * - Automatic shallow comparison for selectors
 */
const {
  useStore: useDevtoolsStore,
  useStoreApi: devtoolsStoreApi,
}: ShallowStoreBindings<DevtoolsStore, [["zustand/persist", unknown]]> = createShallowStore<
  DevtoolsStore,
  [["zustand/persist", unknown]]
>(
  persist(createDevtoolsActions, {
    name: DEVTOOLS_STORAGE_KEY,
    version: DEVTOOLS_STORAGE_VERSION,
    // Guard against SSR / environments without localStorage.
    storage: createJSONStorage(() =>
      typeof window === "undefined" ? noopStorage : window.localStorage
    ),
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

export { useDevtoolsStore, devtoolsStoreApi };
