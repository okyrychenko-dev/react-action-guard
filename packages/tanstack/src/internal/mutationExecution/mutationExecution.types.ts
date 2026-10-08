import type { BlockerConfig, UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { StoreApi } from "zustand";
import type { MutationBlockingConfig } from "../../hooks/useBlockingMutation.types";

export interface MutationExecutionOwner {
  begin: () => symbol;
  markLatest: (token: symbol) => void;
  finish: (token: symbol, failed: boolean) => void;
  refresh: VoidFunction;
  configure: (config: MutationBlockingConfig) => void;
  reset: VoidFunction;
  attach: VoidFunction;
  detach: VoidFunction;
}

export interface MutationExecutionOptions {
  store: StoreApi<UIBlockingStore>;
  id: string;
}

export interface IdleMutationEpisode {
  kind: "idle";
}

export interface ActiveMutationEpisode {
  kind: "active";
  config: BlockerConfig;
}

export interface ExpiredMutationEpisode {
  kind: "expired";
}

export type MutationRegistrationEpisode =
  IdleMutationEpisode | ActiveMutationEpisode | ExpiredMutationEpisode;
