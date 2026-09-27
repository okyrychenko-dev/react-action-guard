import type { DefaultError, UseMutationOptions } from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

interface MutationBlockingConfigWithoutError extends BaseBlockingConfig {
  onError?: false;
  reason?: string;
  reasonOnPending?: string;
  reasonOnError?: never;
}

interface MutationBlockingConfigWithError extends BaseBlockingConfig {
  onError: true;
  reason?: string;
  reasonOnPending?: string;
  reasonOnError?: string;
}

export type MutationBlockingConfig =
  MutationBlockingConfigWithoutError | MutationBlockingConfigWithError;

export interface UseBlockingMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TOnMutateResult> {
  blockingConfig: MutationBlockingConfig;
}
