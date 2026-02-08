import { describe, it, expect } from 'vitest';
import { 
  analyzeEmotion, 
  getEmotionVoiceModifier, 
  adjustVoiceSettingsForEmotion,
  EmotionType 
} from './emotionAnalysis';

describe('emotionAnalysis', () => {
  describe('analyzeEmotion', () => {
    it('should detect positive emotion from positive keywords', () => {
      const result = analyzeEmotion('あなたには幸運が訪れます。成功への道が開かれています。希望に満ちた未来が待っています。');
      expect(result.emotion).toBe('positive');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should detect negative emotion from negative keywords', () => {
      const result = analyzeEmotion('困難な時期が続きます。不安を感じることもあるでしょう。悩みが深まる可能性があります。');
      expect(result.emotion).toBe('negative');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should detect mystical emotion from mystical keywords', () => {
      const result = analyzeEmotion('星々があなたの運命を示しています。月の光があなたを導きます。神秘的なエネルギーが流れています。');
      expect(result.emotion).toBe('mystical');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should detect warning emotion from warning keywords', () => {
      const result = analyzeEmotion('注意が必要です。慎重に行動してください。今は待つ時期です。焦らずに進みましょう。');
      expect(result.emotion).toBe('warning');
      expect(result.confidence).toBeGreaterThan(0.5);
      expect(result.keywords.length).toBeGreaterThan(0);
    });

    it('should return neutral for text without clear emotion', () => {
      const result = analyzeEmotion('今日は普通の一日になりそうです。');
      expect(result.emotion).toBe('neutral');
    });

    it('should return neutral for empty text', () => {
      const result = analyzeEmotion('');
      expect(result.emotion).toBe('neutral');
      expect(result.confidence).toBe(0.5);
    });

    it('should handle mixed emotions by selecting dominant one', () => {
      // More positive than negative
      const result = analyzeEmotion('幸運が訪れますが、少し困難もあるかもしれません。しかし成功と希望が待っています。');
      expect(['positive', 'neutral']).toContain(result.emotion);
    });
  });

  describe('getEmotionVoiceModifier', () => {
    it('should return positive modifiers for positive emotion', () => {
      const modifier = getEmotionVoiceModifier('positive', 1.0);
      expect(modifier.pitchModifier).toBeGreaterThan(0);
      expect(modifier.rateModifier).toBeGreaterThan(0);
    });

    it('should return negative modifiers for negative emotion', () => {
      const modifier = getEmotionVoiceModifier('negative', 1.0);
      expect(modifier.pitchModifier).toBeLessThan(0);
      expect(modifier.rateModifier).toBeLessThan(0);
    });

    it('should return mystical modifiers for mystical emotion', () => {
      const modifier = getEmotionVoiceModifier('mystical', 1.0);
      expect(modifier.pitchModifier).toBeLessThan(0);
      expect(modifier.rateModifier).toBeLessThan(0);
    });

    it('should return warning modifiers for warning emotion', () => {
      const modifier = getEmotionVoiceModifier('warning', 1.0);
      expect(modifier.pitchModifier).toBeLessThan(0);
      expect(modifier.rateModifier).toBeLessThan(0);
      expect(modifier.volumeModifier).toBeGreaterThan(0);
    });

    it('should return zero modifiers for neutral emotion', () => {
      const modifier = getEmotionVoiceModifier('neutral', 1.0);
      expect(modifier.pitchModifier).toBe(0);
      expect(modifier.rateModifier).toBe(0);
      expect(modifier.volumeModifier).toBe(0);
    });

    it('should scale modifiers by confidence', () => {
      const fullConfidence = getEmotionVoiceModifier('positive', 1.0);
      const halfConfidence = getEmotionVoiceModifier('positive', 0.5);
      
      expect(Math.abs(halfConfidence.pitchModifier)).toBeLessThan(Math.abs(fullConfidence.pitchModifier));
    });
  });

  describe('adjustVoiceSettingsForEmotion', () => {
    it('should adjust voice settings based on text emotion', () => {
      const result = adjustVoiceSettingsForEmotion(1.0, 1.0, 1.0, '幸運が訪れます。成功への道が開かれています。');
      
      expect(result.emotion).toBe('positive');
      expect(result.pitch).toBeGreaterThan(1.0);
      expect(result.rate).toBeGreaterThan(1.0);
    });

    it('should keep values within valid range', () => {
      // Test with extreme base values
      const result = adjustVoiceSettingsForEmotion(1.9, 1.9, 0.95, '幸運が訪れます。');
      
      expect(result.pitch).toBeLessThanOrEqual(2.0);
      expect(result.pitch).toBeGreaterThanOrEqual(0.5);
      expect(result.rate).toBeLessThanOrEqual(2.0);
      expect(result.rate).toBeGreaterThanOrEqual(0.5);
      expect(result.volume).toBeLessThanOrEqual(1.0);
      expect(result.volume).toBeGreaterThanOrEqual(0);
    });

    it('should not modify settings for neutral text', () => {
      const result = adjustVoiceSettingsForEmotion(1.0, 1.0, 1.0, '今日は普通の一日です。');
      
      expect(result.emotion).toBe('neutral');
      expect(result.pitch).toBe(1.0);
      expect(result.rate).toBe(1.0);
      expect(result.volume).toBe(1.0);
    });
  });
});
