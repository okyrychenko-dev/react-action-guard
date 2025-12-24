import { Middleware, MiddlewareContext } from "../middleware";

/**
 * Configuration for a blocker
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
 * Stored blocker with all required fields
 */
export interface StoredBlocker {
  scope: string | ReadonlyArray<string>;
  reason: string;
  priority: number;
  timestamp: number;
  /** Timeout duration in milliseconds (if set) */
  timeout?: number;
  /** Internal timeout ID for cleanup */
  timeoutId?: ReturnType<typeof setTimeout>;
  /** Callback invoked when the blocker is automatically removed due to timeout */
  onTimeout?: (blockerId: string) => void;
}

/**
 * Blocker information including its ID
 */
export interface BlockerInfo extends StoredBlocker {
  id: string;
}

/**
 * Internal store state
 */
export interface UIBlockingStoreState {
  activeBlockers: Map<string, StoredBlocker>;
  middlewares: Map<string, Middleware>;
}

/**
 * Store actions
 */
export interface UIBlockingStoreActions {
  addBlocker: (id: string, config?: BlockerConfig) => void;
  updateBlocker: (id: string, config?: Partial<BlockerConfig>) => void;
  removeBlocker: (id: string) => void;
  isBlocked: (scope?: string | ReadonlyArray<string>) => boolean;
  getBlockingInfo: (scope: string) => ReadonlyArray<BlockerInfo>;
  clearAllBlockers: VoidFunction;
  clearBlockersForScope: (scope: string) => void;
  registerMiddleware: (name: string, middleware: Middleware) => void;
  unregisterMiddleware: (name: string) => void;
  runMiddlewares: (context: MiddlewareContext) => Promise<void>;
}

/**
 * Complete store type (state + actions)
 */
export type UIBlockingStore = UIBlockingStoreState & UIBlockingStoreActions;
