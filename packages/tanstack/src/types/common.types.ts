import type { Optional } from "@okyrychenko-dev/type-utils";

/** Shared blocking options. */
export interface BaseBlockingConfig {
  scope?: string | ReadonlyArray<string>;
  priority?: number;
  reason?: string;
  timeout?: number;
  onTimeout?: (blockerId: string) => void;
}

export interface ReasonConfig {
  defaultReason: string;
  stateReasons: ReadonlyArray<{
    condition: boolean;
    reason: Optional<string>;
  }>;
}
