import { isUndefined } from "@okyrychenko-dev/type-utils";
import { useCallback, useEffect, useRef } from "react";
import { useBlockerRegistration } from "../useActionBlocker";
import { useConfigRef } from "../useConfigRef";
import { ScheduledBlockerConfig } from "./useScheduledBlocker.types";
import {
  calculateEndTime,
  isInBlockingPeriod,
  isSafeTimeout,
  isScheduleInPast,
  isValidTimestamp,
  parseDate,
} from "./useScheduledBlocker.utils";

/**
 * Schedules UI blocking for a specific time period (e.g., maintenance windows).
 *
 * @public
 * @since 0.6.0
 * @see {@link useBlocker} for immediate blocking without scheduling
 * @see {@link useConditionalBlocker} for condition-based blocking
 * @see {@link ScheduledBlockerConfig} for configuration options
 * @see {@link BlockingSchedule} for schedule specification details
 */
export function useScheduledBlocker(blockerId: string, config: ScheduledBlockerConfig): void {
  const { activate, deactivate } = useBlockerRegistration({
    blockerId,
    config,
    endEpisodeOnTimeout: true,
  });
  const timeoutsRef = useRef<{
    start?: ReturnType<typeof setTimeout>;
    end?: ReturnType<typeof setTimeout>;
  }>({});
  const configRef = useConfigRef(config);

  const scheduleStart = parseDate(config.schedule.start);
  const scheduleEnd = isUndefined(config.schedule.end) ? undefined : parseDate(config.schedule.end);
  const scheduleDuration = config.schedule.duration;

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
          deactivate();
        }, remainingTime);
      }
    };

    const startBlocking = (): void => {
      const cfg = configRef.current;

      activate();
      cfg.onScheduleStart?.();
      scheduleEnd();
    };

    // If start time hasn't arrived yet
    if (startTime > now) {
      const delay = startTime - now;

      if (!isSafeTimeout(delay)) {
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
        return;
      }
    }

    return (): void => {
      cleanup();
      deactivate();
    };
  }, [activate, deactivate, cleanup, scheduleStart, scheduleEnd, scheduleDuration, configRef]);
}
