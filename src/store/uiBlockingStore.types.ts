import { Middleware, MiddlewareContext } from "../middleware";

/**
 * Configuration options for creating or updating a blocker.
 * 
 * All fields are optional. Defaults will be applied for any missing values:
 * - `scope`: "global"
 * - `reason`: "Blocking UI"
 * - `priority`: 50
 * - `timestamp`: Current time
 * 
 * @example
 * Basic configuration
 * ```ts
 * const config: BlockerConfig = {
 *   scope: 'form',
 *   reason: 'Submitting data...',
 *   priority: 70
 * };
 * ```
 * 
 * @example
 * With timeout and callback
 * ```ts
 * const config: BlockerConfig = {
 *   scope: ['form', 'navigation'],
 *   reason: 'Critical operation in progress',
 *   priority: 90,
 *   timeout: 30000, // 30 seconds
 *   onTimeout: (id) => {
 *     console.warn(`Blocker ${id} timed out`);
 *   }
 * };
 * ```
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
 * Internal representation of a blocker with all fields populated.
 * 
 * This is the stored format in the Map. All optional fields from {@link BlockerConfig}
 * are converted to required fields with default values applied.
 * 
 * @internal This type is primarily for internal use. Users should work with
 *           {@link BlockerConfig} for configuration and {@link BlockerInfo} for
 *           reading blocker data.
 * 
 * @since 0.6.0
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
 * Complete blocker information including its unique identifier.
 * 
 * This type extends {@link StoredBlocker} with the blocker's ID, making it
 * suitable for reading and displaying blocker information. Returned by
 * {@link UIBlockingStoreActions.getBlockingInfo} and used by {@link useBlockingInfo}.
 * 
 * @example
 * Accessing blocker info
 * ```ts
 * const blockers: BlockerInfo[] = store.getState().getBlockingInfo('form');
 * blockers.forEach(blocker => {
 *   console.log(`${blocker.id}: ${blocker.reason} (priority: ${blocker.priority})`);
 * });
 * ```
 * 
 * @public
 * @since 0.6.0
 */
export interface BlockerInfo extends StoredBlocker {
  id: string;
}

/**
 * Internal state structure of the UI blocking store.
 * 
 * Contains the core data structures for managing blockers and middleware.
 * This state is combined with {@link UIBlockingStoreActions} to create the
 * complete {@link UIBlockingStore} type.
 * 
 * @internal
 * @since 0.6.0
 */
export interface UIBlockingStoreState {
  activeBlockers: Map<string, StoredBlocker>;
  middlewares: Map<string, Middleware>;
}

/**
 * All available actions for managing UI blocking state.
 * 
 * These methods allow adding, removing, updating blockers, checking blocking status,
 * and managing middleware. Combined with {@link UIBlockingStoreState} to form
 * the complete {@link UIBlockingStore} type.
 * 
 * All actions are safe to call multiple times and handle edge cases gracefully.
 * 
 * @example
 * Using store actions directly
 * ```ts
 * import { uiBlockingStoreApi } from '@okyrychenko-dev/react-action-guard';
 * 
 * // Add a blocker
 * uiBlockingStoreApi.getState().addBlocker('my-blocker', {
 *   scope: 'form',
 *   reason: 'Processing...'
 * });
 * 
 * // Check if blocked
 * const isBlocked = uiBlockingStoreApi.getState().isBlocked('form');
 * 
 * // Remove blocker
 * uiBlockingStoreApi.getState().removeBlocker('my-blocker');
 * ```
 * 
 * @public
 * @since 0.6.0
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
 * Complete UI blocking store type combining state and actions.
 * 
 * This is the full store interface used by hooks like {@link useUIBlockingStore}
 * and accessible via {@link uiBlockingStoreApi}. It combines all state properties
 * from {@link UIBlockingStoreState} with all action methods from {@link UIBlockingStoreActions}.
 * 
 * @example
 * Using the complete store
 * ```ts
 * import { useUIBlockingStore } from '@okyrychenko-dev/react-action-guard';
 * 
 * function MyComponent() {
 *   const store = useUIBlockingStore();
 *   
 *   // Access state
 *   console.log(store.activeBlockers.size);
 *   
 *   // Call actions
 *   store.addBlocker('my-blocker', { scope: 'form' });
 *   
 *   return <div>...</div>;
 * }
 * ```
 * 
 * @public
 * @since 0.6.0
 */
export type UIBlockingStore = UIBlockingStoreState & UIBlockingStoreActions;
