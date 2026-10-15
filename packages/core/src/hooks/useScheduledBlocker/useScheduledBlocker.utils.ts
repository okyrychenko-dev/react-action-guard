import { type Optional, isUndefined } from "@okyrychenko-dev/type-utils";
import type { BlockingSchedule } from "./useScheduledBlocker.types";

/**
 * Maximum safe timeout value for setTimeout in JavaScript (~24.8 days).
 * Values larger than this will cause setTimeout to trigger immediately.
 */
export const MAX_TIMEOUT_MS = 2147483647;

/**
 * Validates a date value and converts it to timestamp.
 *
 * @param date - Date value as string, Date object, or number
 * @returns Timestamp in milliseconds, or NaN if invalid
 */
export function parseDate(date: string | Date | number): number {
  return new Date(date).getTime();
}

/**
 * Validates if a timestamp is valid (not NaN).
 *
 * @param timestamp - Timestamp to validate
 * @returns True if valid, false otherwise
 */
export function isValidTimestamp(timestamp: number): boolean {
  return Number.isFinite(timestamp) && Math.abs(timestamp) <= 8_640_000_000_000_000;
}

/**
 * Calculates the end time based on schedule configuration.
 * Duration takes precedence over end time if both are provided.
 *
 * @param schedule - Blocking schedule configuration
 * @param startTime - Start time in milliseconds
 * @returns End time in milliseconds, or undefined if not specified
 */
export function calculateEndTime(schedule: BlockingSchedule, startTime: number): Optional<number> {
  if (!isUndefined(schedule.duration)) {
    return startTime + schedule.duration;
  }

  if (!isUndefined(schedule.end)) {
    const endTime = parseDate(schedule.end);

    return isValidTimestamp(endTime) ? endTime : undefined;
  }

  return undefined;
}

/**
 * Validates if a delay is within the safe setTimeout range.
 *
 * @param delay - Delay in milliseconds
 * @returns True if delay is safe to use with setTimeout
 */
export function isSafeTimeout(delay: number): boolean {
  return delay > 0 && delay <= MAX_TIMEOUT_MS;
}

/**
 * Determines if the current time is within a blocking schedule.
 *
 * @param startTime - Schedule start time in milliseconds
 * @param endTime - Schedule end time in milliseconds (optional)
 * @param now - Current time in milliseconds
 * @returns True if currently in the blocking period
 */
export function isInBlockingPeriod(
  startTime: number,
  endTime: Optional<number>,
  now: number
): boolean {
  if (startTime > now) {
    return false; // Not started yet
  }

  if (isUndefined(endTime)) {
    return true; // No end time means block indefinitely
  }

  return endTime > now; // Check if end time hasn't passed
}

/** Validate every supplied bound, including an end overridden by duration. */
export function isValidSchedule(schedule: BlockingSchedule, startTime: number): boolean {
  const { duration, end } = schedule;

  if (!isValidTimestamp(startTime)) {
    return false;
  }

  if (!isUndefined(end)) {
    const suppliedEnd = parseDate(end);

    if (!isValidTimestamp(suppliedEnd) || suppliedEnd < startTime) {
      return false;
    }
  }

  if (!isUndefined(duration)) {
    if (!Number.isFinite(duration) || duration < 0) {
      return false;
    }

    return isValidTimestamp(startTime + duration);
  }

  return true;
}
