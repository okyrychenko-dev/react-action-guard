/** Shared blocking options. */
export interface BaseBlockingConfig {
  scope?: string | ReadonlyArray<string>;
  priority?: number;
  reason?: string;
  timeout?: number;
  onTimeout?: (blockerId: string) => void;
}
