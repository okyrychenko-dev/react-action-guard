import { type UseAsyncActionOptions, useAsyncAction } from "./hooks/useAsyncAction";
import { useBlocker } from "./hooks/useBlocker";
import { useBlockingInfo } from "./hooks/useBlockingInfo";
import { useIsBlocked } from "./hooks/useIsBlocked";
import type { BlockerConfigTyped, ScopeValue } from "./types";

/**
 * Return type for createTypedHooks factory
 */
export interface TypedHooks<TScope extends string> {
  /**
   * Type-safe version of useBlocker hook
   */
  useBlocker: (blockerId: string, config: BlockerConfigTyped<TScope>, isActive?: boolean) => void;

  /**
   * Type-safe version of useIsBlocked hook
   */
  useIsBlocked: (scope?: ScopeValue<TScope>) => boolean;

  /**
   * Type-safe version of useAsyncAction hook
   */
  useAsyncAction: <T = unknown>(
    actionId: string,
    scope?: ScopeValue<TScope>,
    options?: UseAsyncActionOptions
  ) => (asyncFn: () => Promise<T>) => Promise<T>;

  /**
   * Type-safe version of useBlockingInfo hook
   */
  useBlockingInfo: (scope: TScope) => ReturnType<typeof useBlockingInfo>;
}

/**
 * Creates type-safe versions of all blocking hooks with your custom scope types
 *
 * @template TScope - Union type of allowed scope strings
 * @returns Object with type-safe hook functions
 *
 * @example
 * ```typescript
 * // Define your app's scopes
 * type AppScopes = "global" | "form" | "navigation" | "checkout";
 *
 * // Create typed hooks
 * const { useBlocker, useIsBlocked, useAsyncAction } = createTypedHooks<AppScopes>();
 *
 * // Now TypeScript will catch typos
 * useBlocker("id", { scope: "form" }); // ✓ OK
 * useBlocker("id", { scope: "typo" }); // ✗ Type error!
 * ```
 */
export function createTypedHooks<TScope extends string>(): TypedHooks<TScope> {
  // TScope extends string, so all typed scopes are assignable to string | ReadonlyArray<string>
  // This allows us to pass typed values directly without casting
  return {
    useBlocker: (blockerId, config, isActive) => {
      // BlockerConfigTyped<TScope> is structurally compatible with BlockerConfig
      // because TScope extends string
      useBlocker(blockerId, config, isActive);
    },

    useIsBlocked: (scope) => {
      // ScopeValue<TScope> = TScope | ReadonlyArray<TScope>
      // Since TScope extends string, this is assignable to string | ReadonlyArray<string>
      return useIsBlocked(scope);
    },

    useAsyncAction: <T = unknown>(
      actionId: string,
      scope?: ScopeValue<TScope>,
      options?: UseAsyncActionOptions
    ) => {
      return useAsyncAction<T>(actionId, scope, options);
    },

    useBlockingInfo: (scope) => useBlockingInfo(scope),
  };
}
