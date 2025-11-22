import { useEffect, useRef, useCallback } from "react";
import { useUIBlockingStore } from "../store";
import { ScheduledBlockerConfig } from "./useScheduledBlocker.types";
import { useConfigRef } from "./useConfigRef";
import { createBlockerConfig } from "./useBlocker.utils";

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
    const startTime = new Date(currentConfig.schedule.start).getTime();
    const now = Date.now();

    let endTime: number | undefined;
    if (currentConfig.schedule.duration) {
      endTime = startTime + currentConfig.schedule.duration;
    } else if (currentConfig.schedule.end) {
      endTime = new Date(currentConfig.schedule.end).getTime();
    }

    const scheduleEnd = (end: number): void => {
      const remainingTime = end - Date.now();
      if (remainingTime > 0) {
        timeoutsRef.current.end = setTimeout(() => {
          removeBlocker(blockerId);
          configRef.current.onScheduleEnd?.();
        }, remainingTime);
      }
    };

    // If start time hasn't arrived yet
    if (startTime > now) {
      timeoutsRef.current.start = setTimeout(() => {
        const cfg = configRef.current;
        addBlocker(blockerId, createBlockerConfig(cfg));
        cfg.onScheduleStart?.();

        if (endTime) {
          scheduleEnd(endTime);
        }
      }, startTime - now);
    }
    // If already in blocking period
    else if (endTime && endTime > now) {
      addBlocker(blockerId, createBlockerConfig(currentConfig));
      currentConfig.onScheduleStart?.();
      scheduleEnd(endTime);
    }
    // If schedule without end/duration
    else if (!endTime && startTime <= now) {
      addBlocker(blockerId, createBlockerConfig(currentConfig));
      currentConfig.onScheduleStart?.();
    } else {
      console.warn(`[UIBlocking] Schedule is in the past for blocker "${blockerId}"`);
    }

    return (): void => {
      cleanup();
      removeBlocker(blockerId);
    };
    // configRef is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockerId, addBlocker, removeBlocker, cleanup]);
};
