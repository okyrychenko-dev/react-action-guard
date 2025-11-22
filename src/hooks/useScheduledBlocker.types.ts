import type { BlockerConfig } from "../store";

/**
 * Schedule configuration for time-based blocking.
 *
 * You can specify the blocking period in two ways:
 * 1. start + duration: Block for a specific duration after start time
 * 2. start + end: Block between start and end times
 *
 * Note: If both duration and end are provided, duration takes precedence.
 */
export interface BlockingSchedule {
  /** Start time as ISO string, Date object, or timestamp */
  start: string | Date | number;
  /** Optional end time as ISO string, Date object, or timestamp */
  end?: string | Date | number;
  /** Duration in milliseconds (takes precedence over end if both provided) */
  duration?: number;
}

/**
 * Configuration for scheduled blocker hook
 */
export interface ScheduledBlockerConfig extends BlockerConfig {
  /** Schedule defining when blocking should be active */
  schedule: BlockingSchedule;
  /** Optional callback to execute when the blocking schedule starts */
  onScheduleStart?: VoidFunction;
  /** Optional callback to execute when the blocking schedule ends */
  onScheduleEnd?: VoidFunction;
}
