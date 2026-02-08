import { describe, it, expect } from 'vitest';
import { oraclePrompts, commonConversationRules } from './oraclePrompts';

describe('Oracle Prompts', () => {
  // 全ての占い師のプロンプトが存在することを確認
  const expectedOracles = ['souma', 'reira', 'sakuya', 'akari', 'yui', 'gen', 'shion', 'seiran', 'hizuki', 'juga'];
  
  it('should have prompts for all oracles', () => {
    for (const oracleId of expectedOracles) {
      expect(oraclePrompts[oracleId]).toBeDefined();
      expect(typeof oraclePrompts[oracleId]).toBe('string');
      expect(oraclePrompts[oracleId].length).toBeGreaterThan(100);
    }
  });

  // 各占い師のプロンプトに必要な要素が含まれていることを確認
  describe('Oracle prompt content requirements', () => {
    it('souma should have time-related keywords', () => {
      const prompt = oraclePrompts.souma;
      expect(prompt).toContain('蒼真');
      expect(prompt).toContain('時');
      expect(prompt).toContain('300年');
    });

    it('reira should have heart/love-related keywords', () => {
      const prompt = oraclePrompts.reira;
      expect(prompt).toContain('玲蘭');
      expect(prompt).toContain('心');
      expect(prompt).toContain('癒し');
    });

    it('sakuya should have numerology-related keywords', () => {
      const prompt = oraclePrompts.sakuya;
      expect(prompt).toContain('朔夜');
      expect(prompt).toContain('数');
      expect(prompt).toContain('運命数');
    });

    it('akari should have tarot-related keywords', () => {
      const prompt = oraclePrompts.akari;
      expect(prompt).toContain('灯');
      expect(prompt).toContain('タロット');
      expect(prompt).toContain('カード');
    });

    it('yui should have dream-related keywords', () => {
      const prompt = oraclePrompts.yui;
      expect(prompt).toContain('結衣');
      expect(prompt).toContain('夢');
      expect(prompt).toContain('無意識');
    });

    it('gen should have guardian/action-related keywords', () => {
      const prompt = oraclePrompts.gen;
      expect(prompt).toContain('玄');
      expect(prompt).toContain('守');
      expect(prompt).toContain('行動');
    });

    it('shion should have palm reading-related keywords', () => {
      const prompt = oraclePrompts.shion;
      expect(prompt).toContain('紫苑');
      expect(prompt).toContain('手相');
      expect(prompt).toContain('線');
    });

    it('shion should have image requirement instruction', () => {
      const prompt = oraclePrompts.shion;
      expect(prompt).toContain('画像が必要');
      expect(prompt).toContain('手相鑑定');
      expect(prompt).toContain('アップロード');
    });

    it('seiran should have astrology-related keywords', () => {
      const prompt = oraclePrompts.seiran;
      expect(prompt).toContain('星蘭');
      expect(prompt).toContain('星');
      expect(prompt).toContain('星座');
    });

    it('hizuki should have blood type-related keywords', () => {
      const prompt = oraclePrompts.hizuki;
      expect(prompt).toContain('緋月');
      expect(prompt).toContain('血液型');
    });

    it('juga should have animal-related keywords', () => {
      const prompt = oraclePrompts.juga;
      expect(prompt).toContain('獣牙');
      expect(prompt).toContain('動物');
      expect(prompt).toContain('本能');
    });
  });

  // AIっぽさを排除するための禁止事項が含まれていることを確認
  describe('Anti-AI patterns', () => {
    it('each oracle prompt should contain prohibition rules', () => {
      for (const oracleId of expectedOracles) {
        const prompt = oraclePrompts[oracleId];
        expect(prompt).toContain('禁止');
        expect(prompt).toContain('AI');
      }
    });

    it('each oracle prompt should have unique character traits', () => {
      for (const oracleId of expectedOracles) {
        const prompt = oraclePrompts[oracleId];
        expect(prompt).toContain('キャラクター設定');
        expect(prompt).toContain('性格');
        expect(prompt).toContain('口癖');
      }
    });
  });

  // 共通会話ルールのテスト
  describe('Common conversation rules', () => {
    it('should contain conversation guidelines', () => {
      expect(commonConversationRules).toContain('共通ルール');
      expect(commonConversationRules).toContain('禁止事項');
    });

    it('should prohibit AI-like responses', () => {
      expect(commonConversationRules).toContain('私はAI');
      expect(commonConversationRules).toContain('箇条書き');
    });

    it('should encourage natural conversation', () => {
      expect(commonConversationRules).toContain('会話');
      expect(commonConversationRules).toContain('相槌');
    });
  });

  // 各占い師の一人称が設定されていることを確認
  describe('First person pronouns', () => {
    it('souma should use 私', () => {
      expect(oraclePrompts.souma).toContain('一人称は「私」');
    });

    it('gen should use 俺 or 私', () => {
      expect(oraclePrompts.gen).toContain('一人称は「俺」');
    });

    it('juga should use 俺', () => {
      expect(oraclePrompts.juga).toContain('一人称は「俺」');
    });
  });
});
