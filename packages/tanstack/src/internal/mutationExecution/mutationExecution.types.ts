import type { BlockerConfig, UIBlockingStore } from "@okyrychenko-dev/react-action-guard";
import type { StoreApi } from "zustand";
import type { MutationBlockingConfig } from "../../hooks/useBlockingMutation.types";

export interface MutationExecutionOwner {
  begin: () => symbol;
  finish: (token: symbol) => void;
  refresh: VoidFunction;
  configure: (config: MutationBlockingConfig) => void;
  reset: VoidFunction;
  attach: VoidFunction;
  detach: VoidFunction;
}

export interface MutationExecutionOptions {
  store: StoreApi<UIBlockingStore>;
  id: string;
  observation: MutationObservation;
}

export interface MutationObservation {
  refresh: VoidFunction;
  isError: () => boolean;
  subscribe: (listener: VoidFunction) => VoidFunction;
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
