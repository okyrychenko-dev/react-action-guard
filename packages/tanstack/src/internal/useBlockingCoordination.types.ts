import type { QueryKey } from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

export interface BlockingState {
  loading: boolean;
  fetching: boolean;
  error: boolean;
}

export interface BlockingPolicy extends BaseBlockingConfig {
  onLoading?: boolean;
  onFetching?: boolean;
  onError?: boolean;
  reasonOnLoading?: string;
  reasonOnFetching?: string;
  reasonOnError?: string;
}

export interface BlockingCoordinationOptions {
  kind: "query" | "infinite-query" | "mutation" | "queries";
  key?: QueryKey;
  state: BlockingState;
  config: BlockingPolicy;
  defaultReason: string;
  defaultPriority: number;
}
