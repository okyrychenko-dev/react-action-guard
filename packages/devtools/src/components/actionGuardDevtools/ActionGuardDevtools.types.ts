import type { UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { ReactNode } from "react";
import type { StoreApi } from "zustand";
import type { DevtoolsPosition } from "../../types";

/**
 * Store API type for UIBlockingProvider integration
 */
export type UIBlockingStoreApi = StoreApi<UIBlockingStore>;

export interface ActionGuardDevtoolsProviderProps {
  children: ReactNode;
  /** Enable observation-session resources in production (default: false). */
  showInProduction?: boolean;
  /** Blocking store whose observation session is exposed to descendant Devtools hooks. */
  store?: UIBlockingStoreApi;
}

/**
 * Props for the main ActionGuardDevtools component
 */
export interface ActionGuardDevtoolsProps {
  /** Position of the toggle button and panel */
  position?: DevtoolsPosition;
  /** Whether the panel is open by default */
  defaultOpen?: boolean;
  /** Maximum number of events to store */
  maxEvents?: number;
  /**
   * Age in milliseconds after which an active blocker is flagged as potentially
   * stuck (a likely missing `unblock()`), shown with a warning badge (default: 10000).
   */
  stuckThresholdMs?: number;
  /** Whether to show in production (default: false) */
  showInProduction?: boolean;
  /**
   * Custom blocking store instance to observe instead of the global store.
   * Wrap the panel and adjacent `useDevtoolsStore` consumers in
   * `ActionGuardDevtoolsProvider` to expose this store's observation session.
   */
  store?: UIBlockingStoreApi;
}

export type DevtoolsKeyboardAction = "close" | "togglePause" | "clearEvents";

export interface DevtoolsKeyboardResult {
  action: DevtoolsKeyboardAction;
  preventDefault: boolean;
}
