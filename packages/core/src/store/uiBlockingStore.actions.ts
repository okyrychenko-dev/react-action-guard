import { isDefined, isFunction, isMap } from "@okyrychenko-dev/type-utils";
import { devtools } from "zustand/middleware";
import { createBlockingLifecycle } from "./blockingLifecycle/blockingLifecycle";
import type { DevtoolsOptions } from "zustand/middleware";
import type { Middleware, MiddlewareContext } from "../middleware/middleware.types";
import type {
  BlockingLifecycle,
  BlockingLifecycleSnapshot,
} from "./blockingLifecycle/blockingLifecycle.types";
import type {
  ActiveBlockers,
  BlockingStateCreator,
  DevtoolsStoreMutators,
  LifecycleActionsCreator,
  LifecycleEnhancedCreator,
  OptionalActiveBlockers,
  StoreMutatorStack,
  StoreStateChange,
  StoreUpdateArgs,
} from "./uiBlockingStore.actions.types";
import type { BlockerConfig, UIBlockingStore } from "./uiBlockingStore.types";

function blockersFromSnapshot(snapshot: BlockingLifecycleSnapshot): ActiveBlockers {
  const activeBlockers: ActiveBlockers = new Map();

  for (const blocker of snapshot) {
    const { id, ...config } = blocker;

    activeBlockers.set(id, config);
  }

  return activeBlockers;
}

function createActions(lifecycle: BlockingLifecycle): LifecycleActionsCreator {
  return (set, get) => {
    lifecycle.observe((context) => {
      const { runMiddlewares } = get();

      void runMiddlewares(context);
    });

    return {
      activeBlockers: new Map(),
      blockingSnapshot: lifecycle.getSnapshot(),
      middlewares: new Map(),

      registerMiddleware: (name: string, middleware: Middleware) => {
        set((state) => {
          const middlewares = new Map(state.middlewares);

          middlewares.set(name, middleware);

          return { middlewares };
        });
      },

      unregisterMiddleware: (name: string) => {
        set((state) => {
          const middlewares = new Map(state.middlewares);

          middlewares.delete(name);

          return { middlewares };
        });
      },

      runMiddlewares: async (context: MiddlewareContext) => {
        const { middlewares } = get();

        for (const middleware of middlewares.values()) {
          try {
            await middleware(context);
          } catch {
            // Compatibility observers cannot interrupt blocker transitions.
          }
        }
      },

      addBlocker: (id: string, config: BlockerConfig = {}) => {
        lifecycle.add(id, config);
      },
      updateBlocker: (id: string, config: Partial<BlockerConfig> = {}) => {
        lifecycle.update(id, config);
      },
      removeBlocker: (id: string) => {
        lifecycle.remove(id);
      },
      clearAllBlockers: () => {
        lifecycle.clear();
      },
      clearBlockersForScope: (scope: string) => {
        lifecycle.clearScope(scope);
      },
      isBlocked: (scope) => lifecycle.isBlocked(scope),
      getBlockingInfo: (scope) => lifecycle.getBlockingInfo(scope),
    };
  };
}

/**
 * The lifecycle owns transitions and timers. External Zustand writes are
 * normalized before Zustand publishes them to subscribers.
 */
function createLifecycleStateCreator<TMutators extends StoreMutatorStack>(
  enhance: LifecycleEnhancedCreator<TMutators>
): BlockingStateCreator<TMutators> {
  return (set, get, api) => {
    const lifecycle = createBlockingLifecycle();
    let restoring = false;
    const externallyPublishedSnapshots = new WeakSet<BlockingLifecycleSnapshot>();
    // Track the current lifecycle projection to distinguish its writes from external replacements.
    let publishedBlockers: ActiveBlockers = new Map();

    function normalizedBlockersFor(
      update: StoreStateChange,
      current: UIBlockingStore
    ): OptionalActiveBlockers {
      const { activeBlockers } = update;

      if (
        !("activeBlockers" in update) ||
        activeBlockers === current.activeBlockers ||
        activeBlockers === publishedBlockers
      ) {
        return undefined;
      }

      restoring = true;
      try {
        lifecycle.restore(isMap(activeBlockers) ? activeBlockers : new Map());
      } finally {
        restoring = false;
      }

      const restoredSnapshot = lifecycle.getSnapshot();

      // A reentrant restore may be delivered after this external write has already published it.
      externallyPublishedSnapshots.add(restoredSnapshot);
      publishedBlockers = blockersFromSnapshot(restoredSnapshot);

      return publishedBlockers;
    }

    function setWithLifecycle(...args: StoreUpdateArgs): void {
      const current = get();

      if (args[1] === true) {
        const [update] = args;
        const next = isFunction(update) ? update(current) : update;

        if (Object.is(next, current)) {
          return;
        }

        const activeBlockers = normalizedBlockersFor(next, current);

        const blockingSnapshot = lifecycle.getSnapshot();

        if (!isDefined(activeBlockers) && next.blockingSnapshot === blockingSnapshot) {
          set(next, true);

          return;
        }

        set({
          ...next,
          ...(isDefined(activeBlockers) ? { activeBlockers } : {}),
          blockingSnapshot,
        }, true);

        return;
      }

      const [update] = args;
      const next = isFunction(update) ? update(current) : update;

      if (Object.is(next, current)) {
        return;
      }

      const activeBlockers = normalizedBlockersFor(next, current);

      if (!isDefined(activeBlockers) && !("blockingSnapshot" in next)) {
        set(next);

        return;
      }

      set({
        ...next,
        ...(isDefined(activeBlockers) ? { activeBlockers } : {}),
        blockingSnapshot: lifecycle.getSnapshot(),
      });
    }

    api.setState = setWithLifecycle;

    lifecycle.subscribe((snapshot) => {
      if (restoring || externallyPublishedSnapshots.delete(snapshot)) {
        return;
      }

      publishedBlockers = blockersFromSnapshot(snapshot);
      api.setState({ activeBlockers: publishedBlockers, blockingSnapshot: snapshot });
    });

    return enhance(lifecycle)(setWithLifecycle, get, api);
  };
}

export const createUIBlockingActions = createLifecycleStateCreator(createActions);

export function createUIBlockingActionsWithDevtools(
  options: DevtoolsOptions
): BlockingStateCreator<DevtoolsStoreMutators> {
  return createLifecycleStateCreator((lifecycle) => devtools(createActions(lifecycle), options));
}
