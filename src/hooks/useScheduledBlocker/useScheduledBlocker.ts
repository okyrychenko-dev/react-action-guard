import { useCallback, useEffect, useRef } from "react";
import { useResolvedStoreWithSelector } from "../../context";
import { createBlockerConfig } from "../useBlocker";
import { useConfigRef } from "../useConfigRef";
import { ScheduledBlockerConfig } from "./useScheduledBlocker.types";
import {
  MAX_TIMEOUT_MS,
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
 * Automatically blocks UI between specified start and end times. Useful for
 * scheduled maintenance, planned downtime, or time-based feature restrictions.
 * Supports callbacks when the blocking period starts and ends.
 * 
 * Time specifications support:
 * - Date objects
 * - ISO 8601 strings (e.g., "2024-01-15T10:00:00Z")
 * - Unix timestamps (milliseconds since epoch)
 * 
 * You can specify the end time either as an absolute time or as a duration
 * from the start time. If both are provided, duration takes precedence.
 * 
 * Works with both the global store and isolated provider instances (via UIBlockingProvider).
 * 
 * @param blockerId - Unique identifier for this scheduled blocker
 * @param config - Schedule configuration
 * @param config.schedule - Schedule timing configuration
 * @param config.schedule.start - When to start blocking (Date, ISO string, or timestamp)
 * @param config.schedule.end - Optional absolute end time (Date, ISO string, or timestamp)
 * @param config.schedule.duration - Optional duration in milliseconds from start time
 * @param config.scope - Scope(s) to block during the scheduled period
 * @param config.reason - Reason for blocking (displayed to users)
 * @param config.priority - Optional blocker priority (0-100)
 * @param config.onScheduleStart - Optional callback when blocking period starts
 * @param config.onScheduleEnd - Optional callback when blocking period ends
 * 
 * @example
 * Maintenance window with absolute times
 * ```tsx
 * function MaintenanceWarning() {
 *   useScheduledBlocker('maintenance', {
 *     schedule: {
 *       start: new Date('2024-01-15T02:00:00Z'),
 *       end: new Date('2024-01-15T04:00:00Z'),
 *     },
 *     scope: 'global',
 *     reason: 'System maintenance in progress',
 *     priority: 95,
 *     onScheduleStart: () => {
 *       console.log('Maintenance started');
 *       showNotification('System is now in maintenance mode');
 *     },
 *     onScheduleEnd: () => {
 *       console.log('Maintenance completed');
 *       showNotification('System is back online');
 *     }
 *   });
 *   
 *   return <div>...</div>;
 * }
 * ```
 * 
 * @example
 * Short maintenance with duration
 * ```tsx
 * useScheduledBlocker('quick-maintenance', {
 *   schedule: {
 *     start: new Date('2024-01-15T03:00:00'),
 *     duration: 15 * 60 * 1000, // 15 minutes
 *   },
 *   scope: ['api', 'forms'],
 *   reason: 'Brief system update',
 *   priority: 90
 * });
 * ```
 * 
 * @example
 * Business hours enforcement
 * ```tsx
 * function BusinessHoursBlocker() {
 *   const now = new Date();
 *   const tomorrow9AM = new Date(now);
 *   tomorrow9AM.setDate(now.getDate() + 1);
 *   tomorrow9AM.setHours(9, 0, 0, 0);
 *   
 *   useScheduledBlocker('after-hours', {
 *     schedule: {
 *       start: new Date(now.getTime() + 1000), // Start immediately
 *       end: tomorrow9AM,
 *     },
 *     scope: 'trading',
 *     reason: 'Trading is only available during business hours (9 AM - 5 PM)',
 *     priority: 85
 *   });
 *   
 *   return <TradingDashboard />;
 * }
 * ```
 * 
 * @example
 * Using ISO strings for scheduling
 * ```tsx
 * useScheduledBlocker('deployment', {
 *   schedule: {
 *     start: '2024-01-20T00:00:00Z',
 *     duration: 2 * 60 * 60 * 1000, // 2 hours
 *   },
 *   scope: 'global',
 *   reason: 'Deploying new version',
 *   priority: 100,
 *   onScheduleStart: () => {
 *     analytics.track('deployment_started');
 *   },
 *   onScheduleEnd: () => {
 *     analytics.track('deployment_completed');
 *     window.location.reload(); // Reload to get new version
 *   }
 * });
 * ```
 * 
 * @see {@link useBlocker} for immediate blocking without scheduling
 * @see {@link useConditionalBlocker} for condition-based blocking
 * @see {@link ScheduledBlockerConfig} for configuration options
 * @see {@link BlockingSchedule} for schedule specification details
 * 
 * @public
 * @since 0.6.0
 */
export const useScheduledBlocker = (blockerId: string, config: ScheduledBlockerConfig): void => {
  const { addBlocker, removeBlocker } = useResolvedStoreWithSelector((state) => ({
    addBlocker: state.addBlocker,
    removeBlocker: state.removeBlocker,
  }));
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
