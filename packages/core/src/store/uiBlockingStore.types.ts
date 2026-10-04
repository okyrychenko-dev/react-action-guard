import type { Middleware } from "../middleware";
import type { BlockingLifecycleSnapshot } from "./blockingLifecycle";

/**
 * Configuration options for creating or updating a blocker.
 *
 * @public
 * @since 0.6.0
 */
export interface BlockerConfig {
  scope?: string | ReadonlyArray<string>;
  reason?: string;
  /** Priority level (negative values are normalized to 0) */
  priority?: number;
  timestamp?: number;
  /** Automatically remove the blocker after N milliseconds */
  timeout?: number;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}

/**
 * Complete blocker information including its unique identifier.
 *
 * @public
 * @since 0.6.0
 */
export interface BlockerInfo {
  readonly id: string;
  readonly scope: string | ReadonlyArray<string>;
  readonly reason: string;
  readonly priority: number;
  readonly timestamp: number;
  readonly timeout?: number;
  readonly onTimeout?: (blockerId: string) => void;
}

/** Immutable projection published by the Zustand adapter. */
export interface UIBlockingStoreState {
  readonly blockingSnapshot: BlockingLifecycleSnapshot;
}

/**
 * All available actions for managing UI blocking state.
 *
 * @public
 * @since 0.6.0
 */
export interface UIBlockingStoreActions {
  addBlocker: (id: string, config?: BlockerConfig) => void;
  updateBlocker: (id: string, config?: Partial<BlockerConfig>) => void;
  /** @internal Apply current reactive configuration, clearing omitted optional fields. */
  replaceBlocker: (id: string, config: BlockerConfig) => void;
  removeBlocker: (id: string) => void;
  isBlocked: (scope?: string | ReadonlyArray<string>) => boolean;
  getBlockingInfo: (scope: string) => ReadonlyArray<Readonly<BlockerInfo>>;
  clearAllBlockers: VoidFunction;
  clearBlockersForScope: (scope: string) => void;
  /** Observe lifecycle transitions through an anonymous, ownership-safe lease. */
  observeBlockingEvents: (observer: Middleware) => VoidFunction;
}

/**
 * Complete UI blocking store type combining state and actions.
 *
 * @public
 * @since 0.6.0
 */
export type UIBlockingStore = UIBlockingStoreState & UIBlockingStoreActions;
