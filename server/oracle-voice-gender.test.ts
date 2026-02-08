import { describe, it, expect } from 'vitest';
import { oracles, getOracleById } from '../client/src/lib/oracles';

describe('Oracle Voice Settings - Gender Configuration', () => {
  describe('Voice Type Configuration', () => {
    it('should have voice settings for all oracles', () => {
      for (const oracle of oracles) {
        expect(oracle.voiceSettings).toBeDefined();
        expect(oracle.voiceSettings.voiceType).toBeDefined();
        expect(['female', 'male', 'neutral']).toContain(oracle.voiceSettings.voiceType);
      }
    });

    it('should have correct voice type for male characters', () => {
      // 蒼真（そうま）- 男性
      const souma = getOracleById('souma');
      expect(souma?.voiceSettings.voiceType).toBe('male');
      expect(souma?.voiceSettings.pitch).toBeLessThan(1.0); // 低い声

      // 玄（げん）- 男性
      const gen = getOracleById('gen');
      expect(gen?.voiceSettings.voiceType).toBe('male');
      expect(gen?.voiceSettings.pitch).toBeLessThan(1.0); // 低い声
    });

    it('should have correct voice type for female characters', () => {
      // 玲蘭（れいら）- 女性
      const reira = getOracleById('reira');
      expect(reira?.voiceSettings.voiceType).toBe('female');
      expect(reira?.voiceSettings.pitch).toBeGreaterThan(1.0); // 高い声

      // 灯（あかり）- 女性
      const akari = getOracleById('akari');
      expect(akari?.voiceSettings.voiceType).toBe('female');
      expect(akari?.voiceSettings.pitch).toBeGreaterThan(1.0); // 高い声

      // 結衣（ゆい）- 女性
      const yui = getOracleById('yui');
      expect(yui?.voiceSettings.voiceType).toBe('female');
      expect(yui?.voiceSettings.pitch).toBeGreaterThan(1.0); // 高い声

      // 紫苑（しおん）- 女性
      const shion = getOracleById('shion');
      expect(shion?.voiceSettings.voiceType).toBe('female');
      expect(shion?.voiceSettings.pitch).toBeGreaterThan(1.0); // 高い声

      // 星蘭（せいらん）- 女性
      const seiran = getOracleById('seiran');
      expect(seiran?.voiceSettings.voiceType).toBe('female');
      expect(seiran?.voiceSettings.pitch).toBeGreaterThan(1.0); // 高い声
    });

    it('should have correct voice type for neutral characters', () => {
      // 朔夜（さくや）- 中性的
      const sakuya = getOracleById('sakuya');
      expect(sakuya?.voiceSettings.voiceType).toBe('neutral');
      expect(sakuya?.voiceSettings.pitch).toBe(1.0); // 標準的な声
    });
  });

  describe('Voice Settings Ranges', () => {
    it('should have pitch within valid range (0.5 - 2.0)', () => {
      for (const oracle of oracles) {
        expect(oracle.voiceSettings.pitch).toBeGreaterThanOrEqual(0.5);
        expect(oracle.voiceSettings.pitch).toBeLessThanOrEqual(2.0);
      }
    });

    it('should have rate within valid range (0.5 - 2.0)', () => {
      for (const oracle of oracles) {
        expect(oracle.voiceSettings.rate).toBeGreaterThanOrEqual(0.5);
        expect(oracle.voiceSettings.rate).toBeLessThanOrEqual(2.0);
      }
    });

    it('should have volume within valid range (0 - 1.0)', () => {
      for (const oracle of oracles) {
        expect(oracle.voiceSettings.volume).toBeGreaterThanOrEqual(0);
        expect(oracle.voiceSettings.volume).toBeLessThanOrEqual(1.0);
      }
    });
  });

  describe('Character Personality Voice Matching', () => {
    it('should have slower rate for calm characters', () => {
      // 蒼真は落ち着いた性格なのでゆっくり
      const souma = getOracleById('souma');
      expect(souma?.voiceSettings.rate).toBeLessThanOrEqual(0.9);

      // 結衣は夢見がちでゆっくり
      const yui = getOracleById('yui');
      expect(yui?.voiceSettings.rate).toBeLessThanOrEqual(0.9);
    });

    it('should have appropriate pitch for character personality', () => {
      // 玄は力強い男性キャラなので最も低い声
      const gen = getOracleById('gen');
      expect(gen?.voiceSettings.pitch).toBeLessThanOrEqual(0.8);

      // 灯は明るい女性キャラなので高めの声
      const akari = getOracleById('akari');
      expect(akari?.voiceSettings.pitch).toBeGreaterThanOrEqual(1.2);
    });
  });

  describe('Oracle Name Reading', () => {
    it('should have correct reading for Souma (蒼真)', () => {
      const souma = getOracleById('souma');
      expect(souma?.name).toBe('蒼真');
      expect(souma?.englishName).toBe('Souma');
      // システムプロンプトに正しい読み方が含まれていることを確認
      expect(souma?.systemPrompt).toContain('蒼真（そうま）');
    });
  });
});
