import type { BlockingAction } from "@okyrychenko-dev/react-action-guard";

export const ACTION_ORDER: ReadonlyArray<BlockingAction> = [
  "add",
  "update",
  "remove",
  "timeout",
  "clear",
  "clear_scope",
];
