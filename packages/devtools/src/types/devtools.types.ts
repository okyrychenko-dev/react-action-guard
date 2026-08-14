import type { BlockingAction } from "@okyrychenko-dev/react-action-guard";

/**
 * Extended event stored in devtools history
 */
export interface DevtoolsEvent {
  /** Unique event identifier */
  id: string;
  /** The action that occurred */
  action: BlockingAction;
  /** ID of the blocker */
  blockerId: string;
  /** Blocker configuration at time of event */
  config?: {
    scope?: string | ReadonlyArray<string>;
    reason?: string;
    priority?: number;
  };
  /** Unix timestamp of the event */
  timestamp: number;
  /** Previous state (available on remove/update) */
  prevState?: {
    scope?: string | ReadonlyArray<string>;
    reason?: string;
    priority?: number;
  };
  /** Duration in ms (calculated for remove events) */
  duration?: number;
  /** Scope attached directly to middleware event (for clear_scope, etc.) */
  scope?: string;
  /** Number of affected blockers for bulk actions */
  count?: number;
}

/**
 * Filter configuration for the timeline
 */
export interface DevtoolsFilter {
  /** Filter by action types */
  actions: Array<BlockingAction>;
  /** Filter by scope */
  scopes: Array<string>;
  /** Search query for blocker IDs */
  search: string;
}

/**
 * Position of the devtools panel
 */
export type DevtoolsPosition = "left" | "right";

/**
 * Aggregate statistics derived from the recorded event history.
 */
export interface DevtoolsEventStats {
  /** Total number of recorded events */
  total: number;
  /** Number of events per action type */
  byAction: Record<BlockingAction, number>;
  /** Number of events that carry a `duration` (remove/timeout) */
  durationSampleCount: number;
  /** Average duration (ms) across events that carry a duration */
  averageDurationMs: number;
  /** Longest recorded duration (ms) */
  maxDurationMs: number;
  /** Most frequent scopes, sorted by event count (descending) */
  topScopes: Array<{ scope: string; count: number }>;
}

/**
 * Devtools store state
 */
export interface DevtoolsState {
  /** Event history */
  events: Array<DevtoolsEvent>;
  /** Maximum number of events to keep */
  maxEvents: number;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Whether the panel is minimized */
  isMinimized: boolean;
  /** Active tab in the panel */
  activeTab: "timeline" | "blockers" | "stats";
  /** Current filter settings */
  filter: DevtoolsFilter;
  /** Selected event for detail view */
  selectedEventId: string | null;
  /** Whether devtools is paused (stops recording) */
  isPaused: boolean;
}

/**
 * Devtools store actions
 */
export interface DevtoolsActions {
  /** Add a new event to history */
  addEvent: (event: Omit<DevtoolsEvent, "id">) => void;
  /** Clear all events */
  clearEvents: VoidFunction;
  /** Toggle panel open/closed */
  toggleOpen: VoidFunction;
  /** Set panel open state */
  setOpen: (open: boolean) => void;
  /** Toggle minimized state */
  toggleMinimized: VoidFunction;
  /** Set active tab */
  setActiveTab: (tab: DevtoolsState["activeTab"]) => void;
  /** Update filter settings */
  setFilter: (filter: Partial<DevtoolsFilter>) => void;
  /** Reset filters to default */
  resetFilter: VoidFunction;
  /** Select an event for detail view */
  selectEvent: (eventId: string | null) => void;
  /** Toggle pause state */
  togglePause: VoidFunction;
  /** Set max events limit */
  setMaxEvents: (max: number) => void;
}

/**
 * Complete devtools store type
 */
export type DevtoolsStore = DevtoolsState & DevtoolsActions;
