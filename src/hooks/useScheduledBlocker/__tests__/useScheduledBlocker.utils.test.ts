import { describe, it, expect } from "vitest";
import {
  parseDate,
  isValidTimestamp,
  calculateEndTime,
  isSafeTimeout,
  isInBlockingPeriod,
  isScheduleInPast,
  MAX_TIMEOUT_MS,
} from "../useScheduledBlocker.utils";
import type { BlockingSchedule } from "../useScheduledBlocker.types";

describe("useScheduledBlocker.utils", () => {
  describe("parseDate", () => {
    it("should parse ISO string to timestamp", () => {
      const isoString = "2024-01-15T10:00:00Z";
      const result = parseDate(isoString);
      expect(result).toBe(new Date(isoString).getTime());
    });

    it("should parse Date object to timestamp", () => {
      const date = new Date("2024-01-15T10:00:00Z");
      const result = parseDate(date);
      expect(result).toBe(date.getTime());
    });

    it("should return timestamp as is", () => {
      const timestamp = 1705315200000;
      const result = parseDate(timestamp);
      expect(result).toBe(timestamp);
    });

    it("should return NaN for invalid date string", () => {
      const result = parseDate("invalid-date");
      expect(Number.isNaN(result)).toBe(true);
    });
  });

  describe("isValidTimestamp", () => {
    it("should return true for valid timestamp", () => {
      expect(isValidTimestamp(1705315200000)).toBe(true);
    });

    it("should return false for NaN", () => {
      expect(isValidTimestamp(Number.NaN)).toBe(false);
    });

    it("should return true for 0", () => {
      expect(isValidTimestamp(0)).toBe(true);
    });
  });

  describe("calculateEndTime", () => {
    const startTime = 1705315200000; // 2024-01-15T10:00:00Z

    it("should calculate end time using duration", () => {
      const schedule: BlockingSchedule = {
        start: startTime,
        duration: 3600000, // 1 hour
      };

      const result = calculateEndTime(schedule, startTime);
      expect(result).toBe(startTime + 3600000);
    });

    it("should calculate end time using end timestamp", () => {
      const endTime = startTime + 7200000; // 2 hours later
      const schedule: BlockingSchedule = {
        start: startTime,
        end: endTime,
      };

      const result = calculateEndTime(schedule, startTime);
      expect(result).toBe(endTime);
    });

    it("should prefer duration over end when both provided", () => {
      const schedule: BlockingSchedule = {
        start: startTime,
        duration: 3600000,
        end: startTime + 7200000,
      };

      const result = calculateEndTime(schedule, startTime);
      expect(result).toBe(startTime + 3600000);
    });

    it("should return undefined when neither duration nor end provided", () => {
      const schedule: BlockingSchedule = {
        start: startTime,
      };

      const result = calculateEndTime(schedule, startTime);
      expect(result).toBeUndefined();
    });

    it("should return undefined for invalid end date", () => {
      const schedule: BlockingSchedule = {
        start: startTime,
        end: "invalid-date",
      };

      const result = calculateEndTime(schedule, startTime);
      expect(result).toBeUndefined();
    });
  });

  describe("isSafeTimeout", () => {
    it("should return true for valid delay", () => {
      expect(isSafeTimeout(1000)).toBe(true);
      expect(isSafeTimeout(60000)).toBe(true);
      expect(isSafeTimeout(MAX_TIMEOUT_MS)).toBe(true);
    });

    it("should return false for delay exceeding max", () => {
      expect(isSafeTimeout(MAX_TIMEOUT_MS + 1)).toBe(false);
    });

    it("should return false for negative delay", () => {
      expect(isSafeTimeout(-1000)).toBe(false);
    });

    it("should return false for zero delay", () => {
      expect(isSafeTimeout(0)).toBe(false);
    });
  });

  describe("isInBlockingPeriod", () => {
    it("should return false if start time is in the future", () => {
      const startTime = Date.now() + 10000;
      const endTime = startTime + 20000;
      const now = Date.now();

      expect(isInBlockingPeriod(startTime, endTime, now)).toBe(false);
    });

    it("should return true if currently between start and end", () => {
      const now = Date.now();
      const startTime = now - 10000;
      const endTime = now + 10000;

      expect(isInBlockingPeriod(startTime, endTime, now)).toBe(true);
    });

    it("should return false if end time has passed", () => {
      const now = Date.now();
      const startTime = now - 20000;
      const endTime = now - 10000;

      expect(isInBlockingPeriod(startTime, endTime, now)).toBe(false);
    });

    it("should return true if no end time specified and started", () => {
      const now = Date.now();
      const startTime = now - 10000;

      expect(isInBlockingPeriod(startTime, undefined, now)).toBe(true);
    });

    it("should return false if no end time and not started", () => {
      const now = Date.now();
      const startTime = now + 10000;

      expect(isInBlockingPeriod(startTime, undefined, now)).toBe(false);
    });
  });

  describe("isScheduleInPast", () => {
    it("should return true if both start and end are in the past", () => {
      const now = Date.now();
      const startTime = now - 20000;
      const endTime = now - 10000;

      expect(isScheduleInPast(startTime, endTime, now)).toBe(true);
    });

    it("should return false if end is in the future", () => {
      const now = Date.now();
      const startTime = now - 10000;
      const endTime = now + 10000;

      expect(isScheduleInPast(startTime, endTime, now)).toBe(false);
    });

    it("should return false if no end time specified", () => {
      const now = Date.now();
      const startTime = now - 10000;

      expect(isScheduleInPast(startTime, undefined, now)).toBe(false);
    });

    it("should return false if start is in the future", () => {
      const now = Date.now();
      const startTime = now + 10000;
      const endTime = now + 20000;

      expect(isScheduleInPast(startTime, endTime, now)).toBe(false);
    });
  });

  describe("MAX_TIMEOUT_MS", () => {
    it("should be the correct maximum safe timeout value", () => {
      expect(MAX_TIMEOUT_MS).toBe(2147483647);
    });
  });
});
