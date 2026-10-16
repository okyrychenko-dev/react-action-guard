import type { Scope } from "../store/scope";

export interface PerformanceConfig {
  slowBlockThreshold?: number;
  onSlowBlock?: (blockerId: string, duration: number) => void;
}

export interface TrackedPerformanceBlock {
  registration?: object;
  timestamp: number;
  scope: Scope;
}
