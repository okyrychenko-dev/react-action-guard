import { BlockingAction, Middleware, MiddlewareContext } from "../middleware";
import { DEFAULT_PRIORITY, DEFAULT_REASON, DEFAULT_SCOPE } from "./uiBlockingStore.constants";
import { normalizeScopeToArray } from "./uiBlockingStore.utils";
import type {
  BlockerConfig,
  BlockerInfo,
  StoredBlocker,
  UIBlockingStore,
} from "./uiBlockingStore.types";
import type { StateCreator } from "zustand";

/**
 * Normalize priority value to ensure it's non-negative
 */
const normalizePriority = (priority?: number, fallback: number = DEFAULT_PRIORITY): number => {
  return priority !== undefined ? Math.max(0, priority) : fallback;
};

/**
 * Create middleware context object
 */
const createMiddlewareContext = (
  action: BlockingAction,
  blockerId: string,
  config?: Partial<BlockerConfig>,
  prevState?: Partial<StoredBlocker>
): MiddlewareContext => ({
  action,
  blockerId,
  config,
  timestamp: Date.now(),
  ...(prevState && { prevState }),
});

/**
 * UI Blocking Store Slice
 *
 * Implements the state and actions for UI blocking management.
 * This slice follows the Zustand slice pattern for better code organization.
 */
export const createUIBlockingActions: StateCreator<UIBlockingStore, [], [], UIBlockingStore> = (
  set,
  get
) => ({
  // State
  activeBlockers: new Map(),
  middlewares: new Map(),

  registerMiddleware: (name: string, middleware: Middleware) => {
    set((state) => {
      const newMiddlewares = new Map(state.middlewares);
      newMiddlewares.set(name, middleware);
      return { middlewares: newMiddlewares };
    });
  },

  unregisterMiddleware: (name: string) => {
    set((state) => {
      const newMiddlewares = new Map(state.middlewares);
      newMiddlewares.delete(name);
      return { middlewares: newMiddlewares };
    });
  },

  runMiddlewares: async (context: MiddlewareContext) => {
    const { middlewares } = get();

    for (const [name, middleware] of middlewares) {
      try {
        await middleware(context);
      } catch (error) {
        console.error(`[UIBlocking] Middleware "${name}" error:`, error);
      }
    }
  },

  // Actions
  /**
   * Adds a new blocker or overwrites an existing one.
   * 
   * If a blocker with the same ID already exists, it will be replaced and any
   * existing timeout will be cleared. The blocker is active immediately after
   * being added. Triggers middleware with 'add' action.
   * 
   * @param id - Unique identifier for the blocker. Must be unique within the store.
   * @param config - Blocker configuration. All fields are optional with defaults applied.
   * 
   * @example
   * Basic usage
   * ```ts
   * store.getState().addBlocker('save-operation', {
   *   scope: 'form',
   *   reason: 'Saving data...',
   *   priority: 70
   * });
   * ```
   * 
   * @example
   * With timeout
   * ```ts
   * store.getState().addBlocker('api-call', {
   *   scope: 'global',
   *   reason: 'Loading...',
   *   timeout: 30000, // Auto-remove after 30 seconds
   *   onTimeout: (id) => console.warn(`${id} timed out`)
   * });
   * ```
   * 
   * @see {@link removeBlocker} to remove a blocker
   * @see {@link updateBlocker} to update an existing blocker
   */
  addBlocker: (id: string, config: BlockerConfig = {}): void => {
    // Clear existing timeout if blocker is being overwritten
    const existingBlocker = get().activeBlockers.get(id);
    if (existingBlocker?.timeoutId) {
      clearTimeout(existingBlocker.timeoutId);
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    // Set up timeout if specified
    if (config.timeout && config.timeout > 0) {
      timeoutId = setTimeout(() => {
        // Check if blocker still exists
        if (get().activeBlockers.has(id)) {
          // Call onTimeout callback before removing
          config.onTimeout?.(id);

          // Run timeout middleware
          void get().runMiddlewares(
            createMiddlewareContext("timeout", id, {
              scope: config.scope,
              reason: config.reason,
              priority: config.priority,
              timeout: config.timeout,
            })
          );

          // Remove the blocker (this will also run "remove" middleware)
          get().removeBlocker(id);
        }
      }, config.timeout);
    }

    set((state) => {
      const newBlockers = new Map(state.activeBlockers);
      const storedBlocker: StoredBlocker = {
        scope: config.scope ?? DEFAULT_SCOPE,
        reason: config.reason ?? DEFAULT_REASON,
        priority: normalizePriority(config.priority),
        timestamp: config.timestamp ?? Date.now(),
        timeout: config.timeout,
        timeoutId,
        onTimeout: config.onTimeout,
      };
      newBlockers.set(id, storedBlocker);

      return { activeBlockers: newBlockers };
    });

    void get().runMiddlewares(
      createMiddlewareContext("add", id, {
        scope: config.scope,
        reason: config.reason,
        priority: config.priority,
        timeout: config.timeout,
      })
    );
  },

  /**
   * Updates an existing blocker or creates it if it doesn't exist.
   * 
   * Merges the provided configuration with existing blocker data. If the timeout
   * is changed, the timeout timer is restarted. Triggers middleware with 'update' action.
   * 
   * @param id - Identifier of the blocker to update
   * @param config - Partial configuration to merge with existing blocker data
   * 
   * @example
   * Update blocker reason
   * ```ts
   * store.getState().updateBlocker('save', {
   *   reason: 'Saving additional data...'
   * });
   * ```
   * 
   * @example
   * Extend timeout
   * ```ts
   * store.getState().updateBlocker('api-call', {
   *   timeout: 60000 // Extend to 60 seconds
   * });
   * ```
   * 
   * @see {@link addBlocker} to create a new blocker
   */
  updateBlocker: (id: string, config: Partial<BlockerConfig> = {}): void => {
    const existingBlocker = get().activeBlockers.get(id);

    if (!existingBlocker) {
      get().addBlocker(id, config);
      return;
    }

    // Handle timeout update - restart timer if timeout changed
    let timeoutId = existingBlocker.timeoutId;
    const timeoutChanged =
      config.timeout !== undefined && config.timeout !== existingBlocker.timeout;

    if (timeoutChanged) {
      // Clear old timeout
      if (existingBlocker.timeoutId) {
        clearTimeout(existingBlocker.timeoutId);
      }

      // Set up new timeout if specified
      if (config.timeout && config.timeout > 0) {
        const newTimeout = config.timeout;
        const newOnTimeout = config.onTimeout ?? existingBlocker.onTimeout;

        timeoutId = setTimeout(() => {
          if (get().activeBlockers.has(id)) {
            newOnTimeout?.(id);

            void get().runMiddlewares(
              createMiddlewareContext("timeout", id, {
                scope: config.scope ?? existingBlocker.scope,
                reason: config.reason ?? existingBlocker.reason,
                priority: config.priority ?? existingBlocker.priority,
                timeout: newTimeout,
              })
            );

            get().removeBlocker(id);
          }
        }, newTimeout);
      } else {
        timeoutId = undefined;
      }
    }

    const updatedBlocker: StoredBlocker = {
      ...existingBlocker,
      scope: config.scope ?? existingBlocker.scope,
      reason: config.reason ?? existingBlocker.reason,
      priority: normalizePriority(config.priority, existingBlocker.priority),
      timestamp: config.timestamp ?? existingBlocker.timestamp,
      timeout: config.timeout ?? existingBlocker.timeout,
      timeoutId,
      onTimeout: config.onTimeout ?? existingBlocker.onTimeout,
    };

    set((state) => {
      const newBlockers = new Map(state.activeBlockers);
      newBlockers.set(id, updatedBlocker);

      return { activeBlockers: newBlockers };
    });

    void get().runMiddlewares(
      createMiddlewareContext(
        "update",
        id,
        {
          scope: updatedBlocker.scope,
          reason: updatedBlocker.reason,
          priority: updatedBlocker.priority,
          timeout: updatedBlocker.timeout,
          onTimeout: updatedBlocker.onTimeout,
          timestamp: updatedBlocker.timestamp,
        },
        {
          scope: existingBlocker.scope,
          reason: existingBlocker.reason,
          priority: existingBlocker.priority,
          timeout: existingBlocker.timeout,
          onTimeout: existingBlocker.onTimeout,
          timestamp: existingBlocker.timestamp,
        }
      )
    );
  },

  /**
   * Removes a blocker from the store.
   * 
   * Clears any associated timeout and triggers middleware with 'remove' action.
   * Safe to call even if the blocker doesn't exist (no-op in that case).
   * 
   * @param id - Identifier of the blocker to remove
   * 
   * @example
   * ```ts
   * // Add and remove a blocker
   * store.getState().addBlocker('temp', { scope: 'form' });
   * // ... later
   * store.getState().removeBlocker('temp');
   * ```
   * 
   * @see {@link addBlocker} to add a blocker
   * @see {@link clearAllBlockers} to remove all blockers at once
   */
  removeBlocker: (id: string): void => {
    const prevBlocker = get().activeBlockers.get(id);

    // Clear timeout if it exists
    if (prevBlocker?.timeoutId) {
      clearTimeout(prevBlocker.timeoutId);
    }

    set((state) => {
      const newBlockers = new Map(state.activeBlockers);
      newBlockers.delete(id);

      return { activeBlockers: newBlockers };
    });

    if (prevBlocker) {
      void get().runMiddlewares(createMiddlewareContext("remove", id, prevBlocker, prevBlocker));
    }
  },

  /**
   * Checks if one or more scopes are currently blocked.
   * 
   * Returns true if ANY blocker affects the specified scope(s). Global scope
   * blockers will cause this to return true for any scope check.
   * 
   * @param scope - Scope(s) to check. Defaults to "global" if not specified.
   *                Can be a single scope string or array of scopes.
   * @returns true if any of the specified scopes are currently blocked
   * 
   * @example
   * Single scope check
   * ```ts
   * const isFormBlocked = store.getState().isBlocked('form');
   * console.log(isFormBlocked); // true or false
   * ```
   * 
   * @example
   * Multiple scopes check
   * ```ts
   * const isBlocked = store.getState().isBlocked(['form', 'navigation']);
   * // Returns true if either 'form' OR 'navigation' has active blockers
   * ```
   * 
   * @see {@link getBlockingInfo} for detailed blocker information
   */
  isBlocked: (scope: string | ReadonlyArray<string> = DEFAULT_SCOPE): boolean => {
    const { activeBlockers } = get();
    const scopes = normalizeScopeToArray(scope);

    for (const [, blocker] of activeBlockers) {
      // Global blocking blocks everything
      if (blocker.scope === DEFAULT_SCOPE) {
        return true;
      }

      // Check scope intersection
      const blockerScopes = normalizeScopeToArray(blocker.scope);

      if (scopes.some((s) => blockerScopes.includes(s))) {
        return true;
      }
    }

    return false;
  },

  /**
   * Gets detailed information about all blockers affecting a specific scope.
   * 
   * Returns an array of blocker objects sorted by priority (highest first).
   * Includes global blockers and scope-specific blockers. Each blocker object
   * contains id, reason, priority, scope, timestamp, and timeout information.
   * 
   * @param scope - Scope to get blocking information for
   * @returns Array of {@link BlockerInfo} objects, sorted by priority descending
   * 
   * @example
   * Display blocker details
   * ```ts
   * const blockers = store.getState().getBlockingInfo('form');
   * blockers.forEach(blocker => {
   *   console.log(`${blocker.id}: ${blocker.reason}`);
   *   console.log(`Priority: ${blocker.priority}`);
   * });
   * ```
   * 
   * @example
   * Get highest priority blocker
   * ```ts
   * const blockers = store.getState().getBlockingInfo('navigation');
   * const topBlocker = blockers[0]; // Highest priority
   * if (topBlocker) {
   *   console.log(`Top blocker: ${topBlocker.reason}`);
   * }
   * ```
   * 
   * @see {@link isBlocked} for a simple boolean check
   * @see {@link BlockerInfo} for the structure of returned objects
   */
  getBlockingInfo: (scope: string): ReadonlyArray<BlockerInfo> => {
    const { activeBlockers } = get();
    const blockers: Array<BlockerInfo> = [];

    for (const [id, blocker] of activeBlockers) {
      const blockerScopes = normalizeScopeToArray(blocker.scope);

      if (blocker.scope === DEFAULT_SCOPE || blockerScopes.includes(scope)) {
        blockers.push({ id, ...blocker });
      }
    }

    return blockers.sort((a, b) => b.priority - a.priority);
  },

  /**
   * Removes all active blockers from the store.
   * 
   * Clears all timeouts and triggers middleware with 'clear' action.
   * Useful for resetting the blocking state.
   * 
   * @example
   * ```ts
   * // Clear all blockers on logout
   * store.getState().clearAllBlockers();
   * ```
   * 
   * @see {@link clearBlockersForScope} to clear blockers for a specific scope
   */
  clearAllBlockers: (): void => {
    const { activeBlockers } = get();
    const count = activeBlockers.size;

    // Clear all timeouts before clearing blockers
    for (const [, blocker] of activeBlockers) {
      if (blocker.timeoutId) {
        clearTimeout(blocker.timeoutId);
      }
    }

    set({ activeBlockers: new Map() });

    // Notify middleware about clear action
    if (count > 0) {
      void get().runMiddlewares({
        action: "clear",
        blockerId: "*",
        timestamp: Date.now(),
        count,
      });
    }
  },

  /**
   * Removes all blockers that affect a specific scope.
   * 
   * Clears timeouts for removed blockers and triggers middleware with
   * 'clear_scope' action. Global scope blockers are NOT cleared by this method.
   * 
   * @param scope - Scope to clear blockers for
   * 
   * @example
   * Clear form blockers
   * ```ts
   * // Clear all blockers affecting 'form' scope
   * store.getState().clearBlockersForScope('form');
   * ```
   * 
   * @example
   * Clear on navigation
   * ```ts
   * // Clear navigation blockers when user navigates away
   * store.getState().clearBlockersForScope('navigation');
   * ```
   * 
   * @see {@link clearAllBlockers} to clear all blockers
   */
  clearBlockersForScope: (scope: string): void => {
    const { activeBlockers } = get();
    let count = 0;

    // Clear timeouts for blockers that will be removed
    for (const [, blocker] of activeBlockers) {
      const blockerScopes = normalizeScopeToArray(blocker.scope);
      if (blockerScopes.includes(scope)) {
        if (blocker.timeoutId) {
          clearTimeout(blocker.timeoutId);
        }
        count++;
      }
    }

    set((state) => {
      const newBlockers = new Map();

      for (const [id, blocker] of state.activeBlockers) {
        const blockerScopes = normalizeScopeToArray(blocker.scope);

        if (!blockerScopes.includes(scope)) {
          newBlockers.set(id, blocker);
        }
      }

      return { activeBlockers: newBlockers };
    });

    // Notify middleware about clear_scope action
    if (count > 0) {
      void get().runMiddlewares({
        action: "clear_scope",
        blockerId: "*",
        timestamp: Date.now(),
        scope,
        count,
      });
    }
  },
});
