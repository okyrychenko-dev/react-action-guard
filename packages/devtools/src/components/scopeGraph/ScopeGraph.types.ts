import type { BlockerInfo } from "@okyrychenko-dev/react-action-guard";
import type { DevtoolsInspection } from "../actionGuardDevtools";

export interface ScopeGraphProps {
  blockers: ReadonlyArray<BlockerInfo>;
  inspection?: DevtoolsInspection;
}

export interface InspectedScope {
  scope: string;
  blockers: ReadonlyArray<BlockerInfo>;
  actions: ReadonlyArray<string>;
}

export interface ScopeGraphEdge {
  blockerId: string;
  scope: string;
  blockerIndex: number;
  scopeIndex: number;
}
