import { UIBlockingProvider, useUIBlockingContext } from "@okyrychenko-dev/react-action-guard";
import { MutationObserver, QueryClient } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";
import { createDeferred } from "../../../test/test.utils";
import { createMutationExecutionOwner } from "../mutationExecution.utils";
import { createMutationObservation } from "../mutationObservation.utils";
import type { MutationExecutionFixture } from "./mutationExecution.test.types";

export function createMutationExecutionFixture(): MutationExecutionFixture {
  const firstStore = renderHook(useUIBlockingContext, { wrapper: UIBlockingProvider });
  const secondStore = renderHook(useUIBlockingContext, { wrapper: UIBlockingProvider });
  const a = createDeferred<string>();
  const b = createDeferred<string>();
  const client = new QueryClient({ defaultOptions: { mutations: { gcTime: Infinity } } });

  function mutationFn(name: string): Promise<string> {
    return name === "A" ? a.promise : b.promise;
  }

  const observer = new MutationObserver<string, Error, string>(client, { mutationFn });
  const release = observer.subscribe(() => undefined);

  function readNativeError(): boolean {
    return observer.getCurrentResult().isError;
  }

  const observation = createMutationObservation(readNativeError);
  const oldOwner = createMutationExecutionOwner({
    store: firstStore.result.current,
    id: "shared-hook",
    observation,
  });
  const currentOwner = createMutationExecutionOwner({
    store: secondStore.result.current,
    id: "shared-hook",
    observation,
  });

  oldOwner.configure({ scope: "owner-observer", onError: true, reasonOnError: "Latest error" });
  currentOwner.configure({ scope: "owner-observer", onError: true, reasonOnError: "Latest error" });
  oldOwner.attach();

  const { getBlockingInfo: oldInfo } = firstStore.result.current.getState();
  const { getBlockingInfo: currentInfo, observeBlockingEvents: observeCurrent } =
    secondStore.result.current.getState();

  function replace(): void {
    oldOwner.detach();
    currentOwner.attach();
  }

  function cleanup(): void {
    oldOwner.detach();
    currentOwner.detach();
    release();
    client.clear();
    firstStore.unmount();
    secondStore.unmount();
  }

  return {
    a,
    b,
    observer,
    oldOwner,
    currentOwner,
    oldInfo,
    currentInfo,
    observeCurrent,
    refreshNative: observation.refresh,
    replace,
    cleanup,
  };
}
