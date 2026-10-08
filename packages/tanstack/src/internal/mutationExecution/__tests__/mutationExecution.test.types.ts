import type { UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { MutationObserver } from "@tanstack/react-query";
import type { createDeferred } from "../../../test/test.utils";
import type { MutationExecutionOwner } from "../mutationExecution.types";

export interface MutationExecutionFixture {
  a: ReturnType<typeof createDeferred<string>>;
  b: ReturnType<typeof createDeferred<string>>;
  observer: MutationObserver<string, Error, string>;
  oldOwner: MutationExecutionOwner;
  currentOwner: MutationExecutionOwner;
  oldInfo: UIBlockingStore["getBlockingInfo"];
  currentInfo: UIBlockingStore["getBlockingInfo"];
  observeCurrent: UIBlockingStore["observeBlockingEvents"];
  refreshNative: VoidFunction;
  replace: VoidFunction;
  cleanup: VoidFunction;
}
