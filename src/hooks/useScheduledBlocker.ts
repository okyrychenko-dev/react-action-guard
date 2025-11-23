import { useEffect, useRef, useCallback } from "react";
import { useUIBlockingStore } from "../store";
import { ScheduledBlockerConfig } from "./useScheduledBlocker.types";
import { useConfigRef } from "./useConfigRef";
import { createBlockerConfig } from "./useBlocker.utils";
import {
  parseDate,
  isValidTimestamp,
  calculateEndTime,
  isSafeTimeout,
  isInBlockingPeriod,
  isScheduleInPast,
  MAX_TIMEOUT_MS,
} from "./useScheduledBlocker.utils";

/**
 * Hook for scheduling UI blocking for a specific time period.
 *
 * Blocks UI during a scheduled maintenance window or time period.
 * Supports start/end times as Date objects, ISO strings, or timestamps.
 * If both duration and end are provided, duration takes precedence.
 *
 * @param blockerId - Unique identifier for this blocker
 * @param config - Configuration including schedule and callbacks
 *
 */
export const useScheduledBlocker = (blockerId: string, config: ScheduledBlockerConfig): void => {
  const { addBlocker, removeBlocker } = useUIBlockingStore();
  const timeoutsRef = useRef<{
    start?: ReturnType<typeof setTimeout>;
    end?: ReturnType<typeof setTimeout>;
  }>({});
  const configRef = useConfigRef(config);

  const cleanup = useCallback(() => {
    if (timeoutsRef.current.start) {
      clearTimeout(timeoutsRef.current.start);
      timeoutsRef.current.start = undefined;
    }
    if (timeoutsRef.current.end) {
      clearTimeout(timeoutsRef.current.end);
      timeoutsRef.current.end = undefined;
    }
  }, []);

  useEffect(() => {
    const currentConfig = configRef.current;
    const startTime = parseDate(currentConfig.schedule.start);
    const now = Date.now();

    // Validate start time
    if (!isValidTimestamp(startTime)) {
      console.error(`[UIBlocking] Invalid start time for blocker "${blockerId}"`);
      return;
    }

    const scheduleEnd = (): void => {
      const endTime = calculateEndTime(currentConfig.schedule, startTime);
      if (!endTime) {
        return;
      }

      const remainingTime = endTime - Date.now();
      if (remainingTime > 0) {
        timeoutsRef.current.end = setTimeout(() => {
          configRef.current.onScheduleEnd?.();
          removeBlocker(blockerId);
        }, remainingTime);
      }
    };

    const startBlocking = (): void => {
      const cfg = configRef.current;
      addBlocker(blockerId, createBlockerConfig(cfg));
      cfg.onScheduleStart?.();
      scheduleEnd();
    };

    // If start time hasn't arrived yet
    if (startTime > now) {
      const delay = startTime - now;

      if (!isSafeTimeout(delay)) {
        console.warn(
          `[UIBlocking] Schedule delay exceeds maximum timeout (${MAX_TIMEOUT_MS.toString()}ms) for blocker "${blockerId}"`
        );
        return;
      }

      timeoutsRef.current.start = setTimeout(startBlocking, delay);
    }
    // If already in blocking period or should start immediately
    else {
      const endTime = calculateEndTime(currentConfig.schedule, startTime);

      if (isInBlockingPeriod(startTime, endTime, now)) {
        startBlocking();
      } else if (isScheduleInPast(startTime, endTime, now)) {
        console.warn(`[UIBlocking] Schedule is in the past for blocker "${blockerId}"`);
      }
    }

    return (): void => {
      cleanup();
      removeBlocker(blockerId);
    };
    // configRef is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockerId, addBlocker, removeBlocker, cleanup]);
};
