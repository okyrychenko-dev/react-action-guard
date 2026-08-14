export interface PerformanceConfig {
  slowBlockThreshold?: number;
  onSlowBlock?: (blockerId: string, duration: number) => void;
}
