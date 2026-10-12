import type { Optional } from "@okyrychenko-dev/type-utils";

export type OperationSource = "agent" | "user";

export interface PendingOperation {
  source: OperationSource;
  proposedValue: string;
}

export interface CoordinationWorkflow {
  value: string;
  revision: number;
  savedRevision: number;
  pending: Optional<PendingOperation>;
  message: string;
  start: (source: OperationSource) => void;
  complete: VoidFunction;
  fail: VoidFunction;
  cancel: VoidFunction;
  edit: (value: string) => void;
  save: VoidFunction;
}
