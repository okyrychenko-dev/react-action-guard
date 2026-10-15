import type { BlockerConfig } from "../../store";

/**
 * Schedule configuration for time-based blocking.
 *
 * You can specify the blocking period in two ways:
 * 1. start + duration: Block for a specific duration after start time
 * 2. start + end: Block between start and end times
 *
 * Windows are half-open [start, end). Omit both duration and end for indefinite blocking.
 * Zero duration or equal bounds are empty and emit no schedule notifications.
 * Every supplied bound must be valid, even when duration takes precedence over end.
 * Negative/nonfinite duration, invalid dates, end before start and calculated end
 * outside the JavaScript Date range cancel the schedule with a development warning.
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
