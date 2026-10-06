import {
  assertDefined,
  isArray,
  isDefined,
  isInstanceOf,
  isNonEmptyArray,
  isString,
  isUndefined,
} from "@okyrychenko-dev/type-utils";
import { createShallowStore } from "@okyrychenko-dev/react-zustand-toolkit";
import { subscribeWithSelector } from "zustand/middleware";

// Compile against the installed tarball consumer's dependency declarations.
export function narrowScope(value: unknown): string | ReadonlyArray<unknown> {
  if (isString(value)) return value;
  if (isArray(value)) return value;
  return "global";
}

export function firstReason(values: Array<string>): string {
  if (isNonEmptyArray(values)) {
    const first: string = values[0];
    return first;
  }
  return "fallback";
}

export function optionalReason(value: string | undefined): string {
  if (isUndefined(value)) return "fallback";
  const reason: string = value;
  return reason;
}

export function definedReason(value: string | null | undefined): string {
  if (isDefined(value)) {
    const reason: string = value;
    return reason;
  }
  return "fallback";
}

export function assertedReason(value: string | null | undefined): string {
  assertDefined(value);
  return value;
}

export function errorMessage(value: unknown): string {
  if (isInstanceOf(value, Error)) return value.message;
  return "unknown";
}

interface BenchmarkState {
  active: boolean;
}

const { store } = createShallowStore<BenchmarkState, [["zustand/subscribeWithSelector", never]]>(
  subscribeWithSelector<BenchmarkState>(() => ({ active: false }))
);

// A plain StoreApi would reject the middleware selector/listener overload.
store.subscribe(
  (state) => state.active,
  (active) => {
    const narrowed: boolean = active;
    return narrowed;
  }
);
