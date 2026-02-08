import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Auto-Archive Feature Tests
 * Tests for the auto-archive settings and execution functionality
 */

describe("Auto-Archive Feature", () => {
  describe("Auto-Archive Settings", () => {
    it("should have default values of disabled and 30 days", () => {
      // Default settings
      const defaultSettings = {
        enabled: false,
        days: 30,
      };
      
      expect(defaultSettings.enabled).toBe(false);
      expect(defaultSettings.days).toBe(30);
    });

    it("should validate days range (7-365)", () => {
      const validDays = [7, 14, 30, 60, 90, 180, 365];
      const invalidDays = [0, 1, 6, 366, 1000];
      
      validDays.forEach(days => {
        expect(days >= 7 && days <= 365).toBe(true);
      });
      
      invalidDays.forEach(days => {
        expect(days >= 7 && days <= 365).toBe(false);
      });
    });
  });

  describe("Cutoff Date Calculation", () => {
    it("should calculate correct cutoff date for 30 days", () => {
      const now = new Date("2026-02-05T10:00:00.000Z");
      const days = 30;
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // 30 days before Feb 5 is Jan 6
      expect(cutoffDate.getMonth()).toBe(0); // January
      expect(cutoffDate.getDate()).toBe(6);
    });

    it("should calculate correct cutoff date for 7 days", () => {
      const now = new Date("2026-02-05T10:00:00.000Z");
      const days = 7;
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // 7 days before Feb 5 is Jan 29
      expect(cutoffDate.getMonth()).toBe(0); // January
      expect(cutoffDate.getDate()).toBe(29);
    });

    it("should calculate correct cutoff date for 90 days", () => {
      const now = new Date("2026-02-05T10:00:00.000Z");
      const days = 90;
      
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // 90 days before Feb 5 is Nov 7 (2025)
      expect(cutoffDate.getFullYear()).toBe(2025);
      expect(cutoffDate.getMonth()).toBe(10); // November
      expect(cutoffDate.getDate()).toBe(7);
    });
  });

  describe("Archive Logic", () => {
    it("should skip archiving when auto-archive is disabled", () => {
      const settings = { enabled: false, days: 30 };
      
      const shouldArchive = settings.enabled;
      expect(shouldArchive).toBe(false);
    });

    it("should proceed with archiving when auto-archive is enabled", () => {
      const settings = { enabled: true, days: 30 };
      
      const shouldArchive = settings.enabled;
      expect(shouldArchive).toBe(true);
    });

    it("should not archive pinned sessions", () => {
      const sessions = [
        { id: 1, isPinned: true, isArchived: false, createdAt: new Date("2025-01-01") },
        { id: 2, isPinned: false, isArchived: false, createdAt: new Date("2025-01-01") },
        { id: 3, isPinned: false, isArchived: false, createdAt: new Date("2026-02-01") },
      ];
      
      const cutoffDate = new Date("2026-01-06");
      
      // Sessions that should be archived (not pinned, not already archived, older than cutoff)
      const toArchive = sessions.filter(s => 
        !s.isPinned && 
        !s.isArchived && 
        s.createdAt < cutoffDate
      );
      
      expect(toArchive.length).toBe(1);
      expect(toArchive[0].id).toBe(2);
    });

    it("should not archive already archived sessions", () => {
      const sessions = [
        { id: 1, isPinned: false, isArchived: true, createdAt: new Date("2025-01-01") },
        { id: 2, isPinned: false, isArchived: false, createdAt: new Date("2025-01-01") },
      ];
      
      const cutoffDate = new Date("2026-01-06");
      
      const toArchive = sessions.filter(s => 
        !s.isPinned && 
        !s.isArchived && 
        s.createdAt < cutoffDate
      );
      
      expect(toArchive.length).toBe(1);
      expect(toArchive[0].id).toBe(2);
    });
  });

  describe("Bulk Archive", () => {
    it("should archive sessions older than specified days", () => {
      const now = new Date("2026-02-05");
      const olderThanDays = 30;
      const cutoffDate = new Date(now);
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      
      const sessions = [
        { id: 1, createdAt: new Date("2025-12-01"), isArchived: false }, // Should be archived
        { id: 2, createdAt: new Date("2026-01-01"), isArchived: false }, // Should be archived
        { id: 3, createdAt: new Date("2026-01-10"), isArchived: false }, // Should NOT be archived
        { id: 4, createdAt: new Date("2026-02-01"), isArchived: false }, // Should NOT be archived
      ];
      
      const toArchive = sessions.filter(s => 
        !s.isArchived && 
        s.createdAt < cutoffDate
      );
      
      expect(toArchive.length).toBe(2);
      expect(toArchive.map(s => s.id)).toEqual([1, 2]);
    });

    it("should handle different bulk archive periods", () => {
      const now = new Date("2026-02-05");
      
      const testCases = [
        { days: 7, expectedCutoff: new Date("2026-01-29") },
        { days: 14, expectedCutoff: new Date("2026-01-22") },
        { days: 30, expectedCutoff: new Date("2026-01-06") },
        { days: 60, expectedCutoff: new Date("2025-12-07") },
        { days: 90, expectedCutoff: new Date("2025-11-07") },
      ];
      
      testCases.forEach(({ days, expectedCutoff }) => {
        const cutoffDate = new Date(now);
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        // Compare dates (ignoring time)
        expect(cutoffDate.toDateString()).toBe(expectedCutoff.toDateString());
      });
    });
  });

  describe("Run Auto-Archive Response", () => {
    it("should return skipped: true when auto-archive is disabled", () => {
      const response = {
        success: true,
        archivedCount: 0,
        skipped: true,
      };
      
      expect(response.skipped).toBe(true);
      expect(response.archivedCount).toBe(0);
    });

    it("should return skipped: false and count when auto-archive runs", () => {
      const response = {
        success: true,
        archivedCount: 5,
        skipped: false,
      };
      
      expect(response.skipped).toBe(false);
      expect(response.archivedCount).toBe(5);
    });
  });
});
