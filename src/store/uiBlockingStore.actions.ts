import type { StateCreator } from "zustand";
import type {
  BlockerConfig,
  BlockerInfo,
  StoredBlocker,
  UIBlockingStore,
} from "./uiBlockingStore.types";
import { DEFAULT_SCOPE, DEFAULT_REASON, DEFAULT_PRIORITY } from "./uiBlockingStore.constants";
import { normalizeScopeToArray } from "./uiBlockingStore.utils";
import { Middleware, MiddlewareContext } from "../middleware";

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
    console.log(`[UIBlocking] Registered middleware: ${name}`);
  },

  unregisterMiddleware: (name: string) => {
    set((state) => {
      const newMiddlewares = new Map(state.middlewares);
      newMiddlewares.delete(name);
      return { middlewares: newMiddlewares };
    });
    console.log(`[UIBlocking] Unregistered middleware: ${name}`);
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
    set((state) => {
      const newBlockers = new Map(state.activeBlockers);
      const storedBlocker: StoredBlocker = {
        scope: config.scope ?? DEFAULT_SCOPE,
        reason: config.reason ?? DEFAULT_REASON,
        priority: config.priority ?? DEFAULT_PRIORITY,
        timestamp: config.timestamp ?? Date.now(),
      };
      newBlockers.set(id, storedBlocker);

      return { activeBlockers: newBlockers };
    });

    void get().runMiddlewares({
      action: "add",
      blockerId: id,
      config: {
        scope: config.scope,
        reason: config.reason,
        priority: config.priority,
      },
      timestamp: Date.now(),
    });
  },

  /**
   * Remove a blocker from the store
   *
   * @param id - Blocker identifier to remove
   *
   */
  removeBlocker: (id: string): void => {
    const prevBlocker = get().activeBlockers.get(id);

    set((state) => {
      const newBlockers = new Map(state.activeBlockers);
      newBlockers.delete(id);

      return { activeBlockers: newBlockers };
    });

    if (prevBlocker) {
      void get().runMiddlewares({
        action: "remove",
        blockerId: id,
        config: prevBlocker,
        timestamp: Date.now(),
        prevState: prevBlocker,
      });
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
    set({ activeBlockers: new Map() });
  },

  /**
   * Clear all blockers for a specific scope
   *
   * @param scope - Scope to clear blockers for
   *
   */
  clearBlockersForScope: (scope: string): void => {
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
  },
});
