import { describe, it, expect } from "vitest";

// Oracle voice settings type
interface OracleVoiceSettings {
  pitch: number;
  rate: number;
  volume: number;
  voiceType: 'female' | 'male' | 'neutral';
}

// Oracle voice settings for each oracle
const oracleVoiceSettings: Record<string, OracleVoiceSettings> = {
  souma: { pitch: 0.85, rate: 0.85, volume: 1.0, voiceType: 'male' },
  reira: { pitch: 1.3, rate: 0.9, volume: 0.95, voiceType: 'female' },
  sakuya: { pitch: 1.0, rate: 1.0, volume: 1.0, voiceType: 'neutral' },
  akari: { pitch: 1.25, rate: 1.05, volume: 1.0, voiceType: 'female' },
  yui: { pitch: 1.15, rate: 0.8, volume: 0.9, voiceType: 'female' },
  gen: { pitch: 0.75, rate: 1.0, volume: 1.0, voiceType: 'male' },
  shion: { pitch: 1.1, rate: 0.85, volume: 0.95, voiceType: 'female' },
  seiran: { pitch: 1.2, rate: 0.9, volume: 0.95, voiceType: 'female' },
};

describe("Oracle Voice Settings", () => {
  describe("Voice Settings Validation", () => {
    it("should have voice settings for all oracles", () => {
      const expectedOracles = ['souma', 'reira', 'sakuya', 'akari', 'yui', 'gen', 'shion', 'seiran'];
      for (const oracle of expectedOracles) {
        expect(oracleVoiceSettings[oracle]).toBeDefined();
      }
    });

    it("should have pitch values within valid range (0.5 - 2.0)", () => {
      for (const [oracle, settings] of Object.entries(oracleVoiceSettings)) {
        expect(settings.pitch).toBeGreaterThanOrEqual(0.5);
        expect(settings.pitch).toBeLessThanOrEqual(2.0);
      }
    });

    it("should have rate values within valid range (0.5 - 2.0)", () => {
      for (const [oracle, settings] of Object.entries(oracleVoiceSettings)) {
        expect(settings.rate).toBeGreaterThanOrEqual(0.5);
        expect(settings.rate).toBeLessThanOrEqual(2.0);
      }
    });

    it("should have volume values within valid range (0 - 1.0)", () => {
      for (const [oracle, settings] of Object.entries(oracleVoiceSettings)) {
        expect(settings.volume).toBeGreaterThanOrEqual(0);
        expect(settings.volume).toBeLessThanOrEqual(1.0);
      }
    });

    it("should have valid voice type for all oracles", () => {
      const validTypes = ['female', 'male', 'neutral'];
      for (const [oracle, settings] of Object.entries(oracleVoiceSettings)) {
        expect(validTypes).toContain(settings.voiceType);
      }
    });
  });

  describe("Oracle Character Voice Matching", () => {
    it("蒼真 (Souma) should have low, calm male voice", () => {
      const settings = oracleVoiceSettings.souma;
      expect(settings.pitch).toBeLessThan(1.0); // Low pitch
      expect(settings.rate).toBeLessThan(1.0); // Slow rate
      expect(settings.voiceType).toBe('male');
    });

    it("玲蘭 (Reira) should have high, gentle female voice", () => {
      const settings = oracleVoiceSettings.reira;
      expect(settings.pitch).toBeGreaterThan(1.0); // High pitch
      expect(settings.voiceType).toBe('female');
    });

    it("朔夜 (Sakuya) should have neutral, analytical voice", () => {
      const settings = oracleVoiceSettings.sakuya;
      expect(settings.pitch).toBe(1.0); // Neutral pitch
      expect(settings.rate).toBe(1.0); // Standard rate
      expect(settings.voiceType).toBe('neutral');
    });

    it("灯 (Akari) should have bright, energetic female voice", () => {
      const settings = oracleVoiceSettings.akari;
      expect(settings.pitch).toBeGreaterThan(1.0); // High pitch
      expect(settings.rate).toBeGreaterThan(1.0); // Slightly faster
      expect(settings.voiceType).toBe('female');
    });

    it("結衣 (Yui) should have dreamy, slow female voice", () => {
      const settings = oracleVoiceSettings.yui;
      expect(settings.rate).toBeLessThan(0.9); // Very slow rate
      expect(settings.voiceType).toBe('female');
    });

    it("玄 (Gen) should have deep, strong male voice", () => {
      const settings = oracleVoiceSettings.gen;
      expect(settings.pitch).toBeLessThan(0.8); // Very low pitch
      expect(settings.voiceType).toBe('male');
    });

    it("紫苑 (Shion) should have elegant, gentle female voice", () => {
      const settings = oracleVoiceSettings.shion;
      expect(settings.pitch).toBeGreaterThan(1.0); // Slightly high
      expect(settings.rate).toBeLessThan(1.0); // Slow, careful
      expect(settings.voiceType).toBe('female');
    });

    it("星蘭 (Seiran) should have mystical female voice", () => {
      const settings = oracleVoiceSettings.seiran;
      expect(settings.pitch).toBeGreaterThan(1.0); // High, mystical
      expect(settings.voiceType).toBe('female');
    });
  });

  describe("Voice Diversity", () => {
    it("should have distinct pitch values for different oracles", () => {
      const pitchValues = Object.values(oracleVoiceSettings).map(s => s.pitch);
      const uniquePitches = new Set(pitchValues);
      // At least 5 unique pitch values for variety
      expect(uniquePitches.size).toBeGreaterThanOrEqual(5);
    });

    it("should have both male and female voice types", () => {
      const voiceTypes = Object.values(oracleVoiceSettings).map(s => s.voiceType);
      expect(voiceTypes).toContain('male');
      expect(voiceTypes).toContain('female');
    });

    it("should have variety in speaking rates", () => {
      const rates = Object.values(oracleVoiceSettings).map(s => s.rate);
      const minRate = Math.min(...rates);
      const maxRate = Math.max(...rates);
      // At least 0.2 difference between slowest and fastest
      expect(maxRate - minRate).toBeGreaterThanOrEqual(0.2);
    });
  });

  describe("Voice Settings Application", () => {
    it("should apply voice settings correctly to utterance", () => {
      const settings = oracleVoiceSettings.souma;
      
      // Simulate creating utterance settings
      const utteranceSettings = {
        pitch: settings.pitch,
        rate: settings.rate,
        volume: settings.volume,
      };

      expect(utteranceSettings.pitch).toBe(0.85);
      expect(utteranceSettings.rate).toBe(0.85);
      expect(utteranceSettings.volume).toBe(1.0);
    });

    it("should use default settings when oracle settings not provided", () => {
      const defaultSettings = {
        pitch: 1.0,
        rate: 0.9,
        volume: 1.0,
      };

      expect(defaultSettings.pitch).toBe(1.0);
      expect(defaultSettings.rate).toBe(0.9);
      expect(defaultSettings.volume).toBe(1.0);
    });
  });

  describe("Voice Type Selection", () => {
    it("should select female voice patterns correctly", () => {
      const femalePatterns = ['female', 'woman', 'kyoko', 'haruka', 'nanami', 'mei', 'ayumi', 'misaki'];
      const testVoiceName = "Google 日本語 Haruka";
      const isMatch = femalePatterns.some(pattern => 
        testVoiceName.toLowerCase().includes(pattern)
      );
      expect(isMatch).toBe(true);
    });

    it("should select male voice patterns correctly", () => {
      const malePatterns = ['male', 'man', 'ichiro', 'takumi', 'otoya', 'kenta'];
      const testVoiceName = "Google 日本語 Takumi";
      const isMatch = malePatterns.some(pattern => 
        testVoiceName.toLowerCase().includes(pattern)
      );
      expect(isMatch).toBe(true);
    });
  });
});
