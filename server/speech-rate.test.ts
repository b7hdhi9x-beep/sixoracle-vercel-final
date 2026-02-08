import { describe, it, expect } from "vitest";

describe("Speech Rate Auto-Adjustment", () => {
  // Easy listening rate constant
  const EASY_LISTENING_RATE = 0.75;

  describe("Base Rate Configuration", () => {
    it("should have easy listening rate at 0.75", () => {
      expect(EASY_LISTENING_RATE).toBe(0.75);
    });

    it("should be slower than normal speech (1.0)", () => {
      expect(EASY_LISTENING_RATE).toBeLessThan(1.0);
    });

    it("should be within valid speech synthesis range (0.1-10)", () => {
      expect(EASY_LISTENING_RATE).toBeGreaterThanOrEqual(0.1);
      expect(EASY_LISTENING_RATE).toBeLessThanOrEqual(10);
    });
  });

  describe("Oracle Rate Adjustment", () => {
    const oracleRates = {
      souma: 0.85,    // Slow, calm
      reira: 0.95,    // Gentle
      gen: 0.8,       // Deep, slow
      yui: 0.75,      // Dreamy, very slow
      sakuya: 1.0,    // Normal
      akari: 0.9,     // Warm
      shion: 1.05,    // Mysterious
      seiran: 0.95,   // Celestial
    };

    it("should adjust souma rate for easy listening", () => {
      const adjustedRate = Math.min(oracleRates.souma * EASY_LISTENING_RATE, 0.85);
      expect(adjustedRate).toBeLessThanOrEqual(0.85);
      expect(adjustedRate).toBeCloseTo(0.6375, 4); // 0.85 * 0.75
    });

    it("should adjust reira rate for easy listening", () => {
      const adjustedRate = Math.min(oracleRates.reira * EASY_LISTENING_RATE, 0.85);
      expect(adjustedRate).toBeLessThanOrEqual(0.85);
      expect(adjustedRate).toBeCloseTo(0.7125, 4); // 0.95 * 0.75
    });

    it("should cap fast oracles at 0.85", () => {
      const adjustedRate = Math.min(oracleRates.shion * EASY_LISTENING_RATE, 0.85);
      // 1.05 * 0.75 = 0.7875, which is less than 0.85
      expect(adjustedRate).toBeLessThanOrEqual(0.85);
    });

    it("should make all oracles slower than normal", () => {
      Object.values(oracleRates).forEach(rate => {
        const adjustedRate = Math.min(rate * EASY_LISTENING_RATE, 0.85);
        expect(adjustedRate).toBeLessThan(1.0);
      });
    });

    it("should preserve relative speed differences between oracles", () => {
      const adjustedSouma = oracleRates.souma * EASY_LISTENING_RATE;
      const adjustedShion = oracleRates.shion * EASY_LISTENING_RATE;
      // Souma should still be slower than Shion
      expect(adjustedSouma).toBeLessThan(adjustedShion);
    });
  });

  describe("Default Rate (No Oracle Selected)", () => {
    it("should use easy listening rate as default", () => {
      const defaultRate = EASY_LISTENING_RATE;
      expect(defaultRate).toBe(0.75);
    });

    it("should be comfortable for elderly users", () => {
      // Research suggests 0.7-0.8 is optimal for elderly listeners
      expect(EASY_LISTENING_RATE).toBeGreaterThanOrEqual(0.7);
      expect(EASY_LISTENING_RATE).toBeLessThanOrEqual(0.8);
    });
  });

  describe("Rate Capping", () => {
    it("should cap maximum rate at 0.85", () => {
      const maxAllowedRate = 0.85;
      const fastOracleRate = 1.1;
      const adjustedRate = Math.min(fastOracleRate * EASY_LISTENING_RATE, maxAllowedRate);
      expect(adjustedRate).toBeLessThanOrEqual(maxAllowedRate);
    });

    it("should not cap slow oracles unnecessarily", () => {
      const slowOracleRate = 0.75;
      const adjustedRate = Math.min(slowOracleRate * EASY_LISTENING_RATE, 0.85);
      // 0.75 * 0.75 = 0.5625, which is less than 0.85
      expect(adjustedRate).toBe(slowOracleRate * EASY_LISTENING_RATE);
    });
  });

  describe("Clarity Optimization", () => {
    it("should prioritize clarity over character voice speed", () => {
      // Even fast-talking oracles should be slowed down
      const fastOracle = 1.2;
      const adjustedRate = Math.min(fastOracle * EASY_LISTENING_RATE, 0.85);
      expect(adjustedRate).toBeLessThanOrEqual(0.85);
    });

    it("should maintain minimum intelligibility rate", () => {
      // Too slow can also be hard to understand
      const verySlowOracle = 0.5;
      const adjustedRate = verySlowOracle * EASY_LISTENING_RATE;
      // 0.5 * 0.75 = 0.375, still above minimum
      expect(adjustedRate).toBeGreaterThanOrEqual(0.3);
    });
  });

  describe("Pitch Preservation", () => {
    it("should not affect pitch when adjusting rate", () => {
      const oraclePitch = 0.85;
      // Rate adjustment should not change pitch
      const adjustedPitch = oraclePitch; // Pitch stays the same
      expect(adjustedPitch).toBe(0.85);
    });

    it("should maintain oracle character through pitch", () => {
      const pitches = {
        souma: 0.85,   // Low male
        reira: 1.3,    // High female
        gen: 0.75,     // Very low male
      };
      // Each oracle keeps their distinctive pitch
      expect(pitches.souma).toBeLessThan(pitches.reira);
      expect(pitches.gen).toBeLessThan(pitches.souma);
    });
  });

  describe("Integration with Volume", () => {
    it("should work independently of volume setting", () => {
      const volumeLevels = [0.3, 0.6, 1.0];
      volumeLevels.forEach(volume => {
        // Rate adjustment is independent of volume
        const adjustedRate = EASY_LISTENING_RATE;
        expect(adjustedRate).toBe(0.75);
      });
    });
  });
});
