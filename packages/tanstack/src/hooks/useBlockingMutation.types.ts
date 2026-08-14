import type { DefaultError, UseMutationOptions } from "@tanstack/react-query";
import type { BaseBlockingConfig } from "../types";

/**
 * Configuration when onError is false (default).
 * Only blocks during pending state.
 * Uses single reason or reasonOnPending for the pending state.
 */
interface MutationBlockingConfigWithoutError extends BaseBlockingConfig {
  /**
   * Whether to block on error (default: false).
   * When false, UI unblocks immediately after mutation completes (success or error).
   */
  onError?: false;
  /**
   * Default message to show during mutation. Falls back to "Saving changes..." if not specified.
   * Can use reasonOnPending for more specificity.
   */
  reason?: string;
  /**
   * Message to show while mutation is pending.
   * Falls back to `reason` if not specified.
   */
  reasonOnPending?: string;
  /**
   * Not available when onError is false.
   * Type system prevents using this field.
   */
  reasonOnError?: never;
}

/**
 * Configuration when onError is true.
 * Blocks during both pending and error states.
 * Can use different reasons for each state.
 */
interface MutationBlockingConfigWithError extends BaseBlockingConfig {
  /**
   * Whether to block on error.
   * When true, UI remains blocked if mutation fails until user dismisses the error.
   */
  onError: true;
  /**
   * Default message for both pending and error states. Falls back to "Saving changes..." if not specified.
   * Can be overridden by reasonOnPending and reasonOnError.
   */
  reason?: string;
  /**
   * Message to show while mutation is pending.
   * Falls back to `reason` if not specified.
   */
  reasonOnPending?: string;
  /**
   * Message to show when mutation fails.
   * Falls back to `reason` if not specified.
   */
  reasonOnError?: string;
}

/**
 * Discriminated union for mutation blocking configuration.
 * Type-safe configuration that prevents using reasonOnError when onError is false.
 *
 * Use `onError: false` (or omit) to only block during mutation execution.
 * Use `onError: true` to also block when mutation fails.
 */
export type MutationBlockingConfig =
  | MutationBlockingConfigWithoutError
  | MutationBlockingConfigWithError;

/**
 * Options for useBlockingMutation hook.
 * Extends TanStack Query's UseMutationOptions with blocking configuration.
 *
 * @typeParam TData - The type of data returned by the mutation
 * @typeParam TError - The type of error that can be thrown
 * @typeParam TVariables - The type of variables passed to the mutation
 * @typeParam TContext - The type of context for optimistic updates
 */
export interface UseBlockingMutationOptions<
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TOnMutateResult = unknown,
> extends UseMutationOptions<TData, TError, TVariables, TOnMutateResult> {
  /**
   * Configuration for UI blocking behavior during mutation execution.
   */
  blockingConfig: MutationBlockingConfig;
}
