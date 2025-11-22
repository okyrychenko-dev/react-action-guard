import { BlockerConfig } from "../store";

export type BlockingAction = "add" | "remove" | "update" | "cancel" | "timeout";

export type MiddlewareBlockerConfig = BlockerConfig;

export interface MiddlewareContext {
  action: BlockingAction;
  blockerId: string;
  config?: MiddlewareBlockerConfig;
  timestamp: number;
  prevState?: MiddlewareBlockerConfig;
}

export type Middleware = (context: MiddlewareContext) => void | Promise<void>;

export interface MiddlewareConfig {
  name: string;
  middleware: Middleware;
  enabled?: boolean;
}
