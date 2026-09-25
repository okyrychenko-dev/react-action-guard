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
import type {
  BlockerConfig,
  BlockingObservationOptions,
  UIBlockingStore,
} from "./uiBlockingStore.types";

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
    const namedObservations = new Map<string, VoidFunction>();
    const eventMiddlewares = new WeakMap<MiddlewareContext, ReadonlyMap<string, Middleware>>();
    const eventNamedObservations = new WeakMap<
      MiddlewareContext,
      ReadonlyMap<string, VoidFunction>
    >();

    function captureEventMiddlewares(context: MiddlewareContext): void {
      const { middlewares } = get();

      eventMiddlewares.set(context, new Map(middlewares));
      eventNamedObservations.set(context, new Map(namedObservations));
    }

    function observeBlockingEvents(
      observer: Middleware,
      options?: BlockingObservationOptions
    ): VoidFunction {
      const name = options?.skipWhenNamedMiddlewareActive;

      if (name === undefined) {
        return lifecycle.observe(observer);
      }

      const namedMiddlewareName: string = name;

      function observeUnlessNamedMiddleware(context: MiddlewareContext): ReturnType<Middleware> {
        const registrationAtStart = eventNamedObservations.get(context)?.get(namedMiddlewareName);

        if (
          registrationAtStart !== undefined &&
          namedObservations.get(namedMiddlewareName) === registrationAtStart
        ) {
          return;
        }

        return observer(context);
      }

      return lifecycle.observe(observeUnlessNamedMiddleware);
    }

    function registerMiddleware(name: string, middleware: Middleware): void {
      if (!namedObservations.has(name)) {
        function observeNamedMiddleware(context: MiddlewareContext): ReturnType<Middleware> {
          const eventMiddleware = eventMiddlewares.get(context);
          const currentMiddleware = eventMiddleware?.get(name);

          return currentMiddleware?.(context);
        }

        const release = lifecycle.observe(observeNamedMiddleware);

        namedObservations.set(name, release);
      }

      set((state) => {
        const middlewares = new Map(state.middlewares);

        middlewares.set(name, middleware);

        return { middlewares };
      });
    }

    function unregisterMiddleware(name: string): void {
      namedObservations.get(name)?.();
      namedObservations.delete(name);

      set((state) => {
        const middlewares = new Map(state.middlewares);

        middlewares.delete(name);

        return { middlewares };
      });
    }

    function runMiddlewares(context: MiddlewareContext): Promise<void> {
      const { middlewares } = get();
      const completions: Array<Promise<void>> = [];

      for (const middleware of middlewares.values()) {
        try {
          completions.push(Promise.resolve(middleware(context)));
        } catch {
          // Compatibility observers cannot interrupt blocker transitions.
        }
      }

      return Promise.allSettled(completions).then(() => undefined);
    }

    function addBlocker(id: string, config: BlockerConfig = {}): void {
      lifecycle.add(id, config);
    }

    function updateBlocker(id: string, config: Partial<BlockerConfig> = {}): void {
      lifecycle.update(id, config);
    }

    function removeBlocker(id: string): void {
      lifecycle.remove(id);
    }

    function clearAllBlockers(): void {
      lifecycle.clear();
    }

    function clearBlockersForScope(scope: string): void {
      lifecycle.clearScope(scope);
    }

    function isBlocked(scope?: string | ReadonlyArray<string>): boolean {
      return lifecycle.isBlocked(scope);
    }

    function getBlockingInfo(scope: string): BlockingLifecycleSnapshot {
      return lifecycle.getBlockingInfo(scope);
    }

    lifecycle.observe(captureEventMiddlewares);

    return {
      activeBlockers: new Map(),
      blockingSnapshot: lifecycle.getSnapshot(),
      middlewares: new Map(),
      observeBlockingEvents,
      registerMiddleware,
      unregisterMiddleware,
      runMiddlewares,
      addBlocker,
      updateBlocker,
      removeBlocker,
      clearAllBlockers,
      clearBlockersForScope,
      isBlocked,
      getBlockingInfo,
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

        set(
          {
            ...next,
            ...(isDefined(activeBlockers) ? { activeBlockers } : {}),
            blockingSnapshot,
          },
          true
        );

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
