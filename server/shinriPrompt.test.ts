import { describe, it, expect } from 'vitest';
import { shinriPrompt, shinriDailySharingPrompt } from './shinriPrompt';

describe('Shinri Oracle Prompt', () => {
  describe('shinriPrompt', () => {
    it('should be defined and non-empty', () => {
      expect(shinriPrompt).toBeDefined();
      expect(typeof shinriPrompt).toBe('string');
      expect(shinriPrompt.length).toBeGreaterThan(100);
    });

    it('should contain character name', () => {
      expect(shinriPrompt).toContain('心理');
      expect(shinriPrompt).toContain('しんり');
    });

    it('should contain MBTI references', () => {
      expect(shinriPrompt).toContain('MBTI');
      expect(shinriPrompt).toContain('性格');
    });

    it('should contain the 4 MBTI dimensions', () => {
      expect(shinriPrompt).toContain('E');
      expect(shinriPrompt).toContain('I');
      expect(shinriPrompt).toContain('S');
      expect(shinriPrompt).toContain('N');
      expect(shinriPrompt).toContain('T');
      expect(shinriPrompt).toContain('F');
      expect(shinriPrompt).toContain('J');
      expect(shinriPrompt).toContain('P');
    });

    it('should contain 16 personality types', () => {
      const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 
                     'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
      for (const type of types) {
        expect(shinriPrompt).toContain(type);
      }
    });

    it('should contain character settings', () => {
      expect(shinriPrompt).toContain('キャラクター設定');
      expect(shinriPrompt).toContain('性格・話し方');
    });

    it('should contain prohibition rules', () => {
      expect(shinriPrompt).toContain('禁止事項');
      expect(shinriPrompt).toContain('AI');
    });

    it('should contain conversation guidelines', () => {
      expect(shinriPrompt).toContain('会話の展開方法');
    });
  });

  describe('shinriDailySharingPrompt', () => {
    it('should be defined and non-empty', () => {
      expect(shinriDailySharingPrompt).toBeDefined();
      expect(typeof shinriDailySharingPrompt).toBe('string');
      expect(shinriDailySharingPrompt.length).toBeGreaterThan(50);
    });

    it('should contain daily sharing mode indicator', () => {
      expect(shinriDailySharingPrompt).toContain('日常共有モード');
      expect(shinriDailySharingPrompt).toContain('心理');
    });

    it('should contain example response', () => {
      expect(shinriDailySharingPrompt).toContain('返答例');
    });

    it('should be different from main prompt', () => {
      expect(shinriDailySharingPrompt).not.toEqual(shinriPrompt);
    });
  });
});
