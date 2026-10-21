/** Executes an async callback while preserving its inferred result and optional hook result bound. */
export type UseAsyncActionReturn<T = unknown> = <TResult extends T>(
  asyncFn: () => Promise<TResult>
) => Promise<TResult>;
