import { Middleware, MiddlewareContext } from "../middleware";

/**
 * Configuration for a blocker
 */
export interface BlockerConfig {
  scope?: string | ReadonlyArray<string>;
  reason?: string;
  priority?: number;
  timestamp?: number;
}

/**
 * Stored blocker with all required fields
 */
export interface StoredBlocker {
  scope: string | ReadonlyArray<string>;
  reason: string;
  priority: number;
  timestamp: number;
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
