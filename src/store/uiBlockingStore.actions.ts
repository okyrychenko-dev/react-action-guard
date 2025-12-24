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
   * Add a blocker to the store
   *
   * @param id - Unique blocker identifier
   * @param config - Optional blocker configuration
   *
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
   * Update blocker metadata. If timeout is updated, the timer will be restarted.
   *
   * @param id - Unique blocker identifier
   * @param config - Partial blocker configuration to merge
   *
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
   * Remove a blocker from the store
   *
   * @param id - Blocker identifier to remove
   *
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
   * Check if a scope is currently blocked
   *
   * @param scope - Scope or array of scopes to check (default: "global")
   * @returns True if any of the scopes are blocked
   *
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
   * Get detailed blocking information for a specific scope
   *
   * @param scope - Scope to get blocking information for
   * @returns Array of blockers affecting the scope, sorted by priority (highest first)
   *
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
   * Clear all blockers from the store
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
   * Clear all blockers for a specific scope
   *
   * @param scope - Scope to clear blockers for
   *
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
