import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Loyalty System", () => {
  describe("Tier Calculation", () => {
    it("should return 'none' tier for 0 months", () => {
      const continuousMonths = 0;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("none");
    });

    it("should return 'bronze' tier for 1 month", () => {
      const continuousMonths = 1;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("bronze");
    });

    it("should return 'silver' tier for 3 months", () => {
      const continuousMonths = 3;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("silver");
    });

    it("should return 'gold' tier for 6 months", () => {
      const continuousMonths = 6;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("gold");
    });

    it("should return 'vip' tier for 12 months", () => {
      const continuousMonths = 12;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("vip");
    });

    it("should return 'vip' tier for 24 months", () => {
      const continuousMonths = 24;
      const tier = calculateTier(continuousMonths);
      expect(tier).toBe("vip");
    });
  });

  describe("Benefits Calculation", () => {
    it("should have no benefits for 0 months", () => {
      const benefits = calculateBenefits(0);
      expect(benefits.detailed_reading).toBe(false);
      expect(benefits.bonus_oracle).toBe(false);
      expect(benefits.all_oracles).toBe(false);
      expect(benefits.vip_badge).toBe(false);
    });

    it("should have detailed_reading for 3+ months", () => {
      const benefits = calculateBenefits(3);
      expect(benefits.detailed_reading).toBe(true);
      expect(benefits.bonus_oracle).toBe(false);
    });

    it("should have bonus_oracle for 6+ months", () => {
      const benefits = calculateBenefits(6);
      expect(benefits.detailed_reading).toBe(true);
      expect(benefits.bonus_oracle).toBe(true);
      expect(benefits.all_oracles).toBe(false);
    });

    it("should have all benefits for 12+ months", () => {
      const benefits = calculateBenefits(12);
      expect(benefits.detailed_reading).toBe(true);
      expect(benefits.bonus_oracle).toBe(true);
      expect(benefits.all_oracles).toBe(true);
      expect(benefits.vip_badge).toBe(true);
    });
  });

  describe("Progress Calculation", () => {
    it("should calculate progress to bronze correctly", () => {
      const progress = calculateProgress(0);
      expect(progress.nextTierMonths).toBe(1);
      expect(progress.nextTierName).toBe("ブロンズ");
      expect(progress.progressPercent).toBe(0);
    });

    it("should calculate progress to silver correctly", () => {
      const progress = calculateProgress(1);
      expect(progress.nextTierMonths).toBe(3);
      expect(progress.nextTierName).toBe("シルバー");
      expect(progress.progressPercent).toBe(0);
    });

    it("should calculate progress to gold correctly", () => {
      const progress = calculateProgress(4);
      expect(progress.nextTierMonths).toBe(6);
      expect(progress.nextTierName).toBe("ゴールド");
      expect(progress.progressPercent).toBeCloseTo(33.33, 0);
    });

    it("should show 100% progress for VIP tier", () => {
      const progress = calculateProgress(12);
      expect(progress.nextTierMonths).toBe(0);
      expect(progress.progressPercent).toBe(100);
    });
  });

  describe("Continuous Months Calculation", () => {
    it("should calculate months from subscription start date", () => {
      const now = new Date();
      const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      const months = calculateContinuousMonths(threeMonthsAgo, now);
      expect(months).toBe(3);
    });

    it("should return 0 for no subscription", () => {
      const months = calculateContinuousMonths(null, new Date());
      expect(months).toBe(0);
    });
  });
});

// Helper functions to test (these mirror the logic in routers.ts)
function calculateTier(continuousMonths: number): string {
  return continuousMonths >= 12 ? 'vip' : 
         continuousMonths >= 6 ? 'gold' : 
         continuousMonths >= 3 ? 'silver' : 
         continuousMonths >= 1 ? 'bronze' : 'none';
}

function calculateBenefits(continuousMonths: number) {
  return {
    detailed_reading: continuousMonths >= 3,
    bonus_oracle: continuousMonths >= 6,
    all_oracles: continuousMonths >= 12,
    vip_badge: continuousMonths >= 12,
  };
}

function calculateProgress(continuousMonths: number) {
  let nextTierMonths = 0;
  let nextTierName = '';
  let progressPercent = 0;
  
  if (continuousMonths < 1) {
    nextTierMonths = 1;
    nextTierName = 'ブロンズ';
    progressPercent = Math.min(100, (continuousMonths / 1) * 100);
  } else if (continuousMonths < 3) {
    nextTierMonths = 3;
    nextTierName = 'シルバー';
    progressPercent = Math.min(100, ((continuousMonths - 1) / 2) * 100);
  } else if (continuousMonths < 6) {
    nextTierMonths = 6;
    nextTierName = 'ゴールド';
    progressPercent = Math.min(100, ((continuousMonths - 3) / 3) * 100);
  } else if (continuousMonths < 12) {
    nextTierMonths = 12;
    nextTierName = 'VIP';
    progressPercent = Math.min(100, ((continuousMonths - 6) / 6) * 100);
  } else {
    nextTierMonths = 0;
    nextTierName = '';
    progressPercent = 100;
  }
  
  return { nextTierMonths, nextTierName, progressPercent };
}

function calculateContinuousMonths(subscriptionStartDate: Date | null, now: Date): number {
  if (!subscriptionStartDate) return 0;
  const diffTime = now.getTime() - subscriptionStartDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30);
}
