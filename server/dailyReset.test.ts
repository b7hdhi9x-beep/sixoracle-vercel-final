import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTodayJST,
  getCurrentMonthJST,
  getNextMidnightJST,
  getMillisecondsUntilMidnightJST,
  getTimeUntilResetFormatted,
  needsDailyReset,
  needsMonthlyReset,
  getResetInfo,
} from "./dailyReset";

describe("Daily Reset Utility", () => {
  describe("getTodayJST", () => {
    it("should return date in YYYY-MM-DD format", () => {
      const result = getTodayJST();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it("should return JST date (UTC+9)", () => {
      // Mock a specific UTC time: 2026-01-30 14:00:00 UTC = 2026-01-30 23:00:00 JST
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-30T14:00:00Z"));
      
      const result = getTodayJST();
      expect(result).toBe("2026-01-30");
      
      vi.useRealTimers();
    });

    it("should handle date boundary correctly (UTC 15:00 = JST next day 00:00)", () => {
      vi.useFakeTimers();
      // 2026-01-30 15:00:00 UTC = 2026-01-31 00:00:00 JST
      vi.setSystemTime(new Date("2026-01-30T15:00:00Z"));
      
      const result = getTodayJST();
      expect(result).toBe("2026-01-31");
      
      vi.useRealTimers();
    });
  });

  describe("getCurrentMonthJST", () => {
    it("should return month in YYYY-MM format", () => {
      const result = getCurrentMonthJST();
      expect(result).toMatch(/^\d{4}-\d{2}$/);
    });

    it("should return JST month", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-30T14:00:00Z"));
      
      const result = getCurrentMonthJST();
      expect(result).toBe("2026-01");
      
      vi.useRealTimers();
    });
  });

  describe("needsDailyReset", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set to 2026-01-30 10:00:00 JST (01:00:00 UTC)
      vi.setSystemTime(new Date("2026-01-30T01:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true if lastResetDate is null", () => {
      expect(needsDailyReset(null)).toBe(true);
    });

    it("should return true if lastResetDate is yesterday", () => {
      const yesterday = new Date("2026-01-29T00:00:00Z");
      expect(needsDailyReset(yesterday)).toBe(true);
    });

    it("should return false if lastResetDate is today (JST)", () => {
      // Today in JST is 2026-01-30
      const today = new Date("2026-01-30T00:00:00Z");
      expect(needsDailyReset(today)).toBe(false);
    });

    it("should handle string dates", () => {
      expect(needsDailyReset("2026-01-29")).toBe(true);
      expect(needsDailyReset("2026-01-30")).toBe(false);
    });
  });

  describe("needsMonthlyReset", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Set to 2026-02-15 10:00:00 JST
      vi.setSystemTime(new Date("2026-02-15T01:00:00Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return true if lastResetDate is null", () => {
      expect(needsMonthlyReset(null)).toBe(true);
    });

    it("should return true if lastResetDate is last month", () => {
      const lastMonth = new Date("2026-01-15T00:00:00Z");
      expect(needsMonthlyReset(lastMonth)).toBe(true);
    });

    it("should return false if lastResetDate is this month", () => {
      const thisMonth = new Date("2026-02-01T00:00:00Z");
      expect(needsMonthlyReset(thisMonth)).toBe(false);
    });

    it("should handle string dates", () => {
      expect(needsMonthlyReset("2026-01-15")).toBe(true);
      expect(needsMonthlyReset("2026-02-01")).toBe(false);
    });
  });

  describe("getNextMidnightJST", () => {
    it("should return a Date object", () => {
      const result = getNextMidnightJST();
      expect(result).toBeInstanceOf(Date);
    });

    it("should return next midnight JST", () => {
      vi.useFakeTimers();
      // 2026-01-30 10:00:00 JST (01:00:00 UTC)
      vi.setSystemTime(new Date("2026-01-30T01:00:00Z"));
      
      const result = getNextMidnightJST();
      // Next midnight JST is 2026-01-31 00:00:00 JST = 2026-01-30 15:00:00 UTC
      expect(result.toISOString()).toBe("2026-01-30T15:00:00.000Z");
      
      vi.useRealTimers();
    });
  });

  describe("getMillisecondsUntilMidnightJST", () => {
    it("should return positive number", () => {
      const result = getMillisecondsUntilMidnightJST();
      expect(result).toBeGreaterThan(0);
    });

    it("should return correct milliseconds", () => {
      vi.useFakeTimers();
      // 2026-01-30 23:00:00 JST (14:00:00 UTC) - 1 hour until midnight
      vi.setSystemTime(new Date("2026-01-30T14:00:00Z"));
      
      const result = getMillisecondsUntilMidnightJST();
      expect(result).toBe(1 * 60 * 60 * 1000); // 1 hour in ms
      
      vi.useRealTimers();
    });
  });

  describe("getTimeUntilResetFormatted", () => {
    it("should return formatted time string", () => {
      vi.useFakeTimers();
      // 2026-01-30 21:30:00 JST (12:30:00 UTC) - 2.5 hours until midnight
      vi.setSystemTime(new Date("2026-01-30T12:30:00Z"));
      
      const result = getTimeUntilResetFormatted();
      expect(result).toBe("2時間30分");
      
      vi.useRealTimers();
    });

    it("should show only minutes when less than 1 hour", () => {
      vi.useFakeTimers();
      // 2026-01-30 23:30:00 JST (14:30:00 UTC) - 30 minutes until midnight
      vi.setSystemTime(new Date("2026-01-30T14:30:00Z"));
      
      const result = getTimeUntilResetFormatted();
      expect(result).toBe("30分");
      
      vi.useRealTimers();
    });
  });

  describe("getResetInfo", () => {
    it("should return complete reset info object", () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-01-30T01:00:00Z"));
      
      const result = getResetInfo();
      
      expect(result).toHaveProperty("dailyResetsAt");
      expect(result).toHaveProperty("timeUntilDailyReset");
      expect(result).toHaveProperty("millisecondsUntilDailyReset");
      expect(result).toHaveProperty("monthlyResetsAt");
      expect(result).toHaveProperty("timeUntilMonthlyReset");
      expect(result).toHaveProperty("currentDateJST");
      expect(result).toHaveProperty("currentMonthJST");
      
      expect(result.currentDateJST).toBe("2026-01-30");
      expect(result.currentMonthJST).toBe("2026-01");
      
      vi.useRealTimers();
    });
  });
});
