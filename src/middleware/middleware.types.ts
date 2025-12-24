import { BlockerConfig } from "../store";

export type BlockingAction = "add" | "update" | "remove" | "timeout" | "clear" | "clear_scope";

export type MiddlewareBlockerConfig = BlockerConfig;

export interface MiddlewareContext {
  action: BlockingAction;
  blockerId: string;
  config?: MiddlewareBlockerConfig;
  timestamp: number;
  prevState?: MiddlewareBlockerConfig;
  scope?: string;
  count?: number;
}

export type Middleware = (context: MiddlewareContext) => void | Promise<void>;

export interface MiddlewareConfig {
  name: string;
  middleware: Middleware;
  enabled?: boolean;
}
