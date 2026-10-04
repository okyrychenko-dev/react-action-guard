import { isFunction } from "@okyrychenko-dev/type-utils";
import { devtools } from "zustand/middleware";
import { createBlockingLifecycle } from "./blockingLifecycle";
import type { DevtoolsOptions } from "zustand/middleware";
import type { BlockingLifecycle } from "./blockingLifecycle";
import type {
  BlockingStateCreator,
  DevtoolsStoreMutators,
  LifecycleActionsCreator,
  LifecycleEnhancedCreator,
  StoreMutatorStack,
  StoreUpdateArgs,
} from "./uiBlockingStore.actions.types";

function createActions(lifecycle: BlockingLifecycle): LifecycleActionsCreator {
  return () => ({
    blockingSnapshot: lifecycle.getSnapshot(),
    observeBlockingEvents: lifecycle.observe,
    addBlocker: lifecycle.add,
    updateBlocker: lifecycle.update,
    replaceBlocker: lifecycle.replace,
    removeBlocker: lifecycle.remove,
    clearAllBlockers: lifecycle.clear,
    clearBlockersForScope: lifecycle.clearScope,
    isBlocked: lifecycle.isBlocked,
    getBlockingInfo: lifecycle.getBlockingInfo,
  });
}

/** Publish lifecycle snapshots through Zustand; external writes cannot replace the projection. */
function createLifecycleStateCreator<TMutators extends StoreMutatorStack>(
  enhance: LifecycleEnhancedCreator<TMutators>
): BlockingStateCreator<TMutators> {
  return (set, get, api) => {
    const lifecycle = createBlockingLifecycle();

    function setWithLifecycle(...args: StoreUpdateArgs): void {
      const current = get();

      if (args[1] === true) {
        const [update] = args;
        const next = isFunction(update) ? update(current) : update;

        if (!Object.is(next, current)) {
          set({ ...next, blockingSnapshot: lifecycle.getSnapshot() }, true);
        }

        return;
      }

      const [update] = args;
      const next = isFunction(update) ? update(current) : update;

      if (!Object.is(next, current)) {
        set({ ...next, blockingSnapshot: lifecycle.getSnapshot() });
      }
    }
    api.setState = setWithLifecycle;
    lifecycle.subscribe((blockingSnapshot) => {
      api.setState({ blockingSnapshot });
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
