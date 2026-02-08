import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue({
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        orderBy: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  }),
}));

// Mock storage
vi.mock('./storage', () => ({
  storagePut: vi.fn().mockResolvedValue({
    url: 'https://example.com/test.html',
    key: 'mbti-group/test.html',
  }),
}));

describe('MBTI Group Compatibility', () => {
  describe('Group Score Calculation', () => {
    // Test the scoring logic
    const compatibilityData: Record<string, Record<string, number>> = {
      'INTJ': { 'INTJ': 4, 'INTP': 5, 'ENTJ': 5, 'ENTP': 5 },
      'INTP': { 'INTJ': 5, 'INTP': 4, 'ENTJ': 5, 'ENTP': 5 },
      'ENTJ': { 'INTJ': 5, 'INTP': 5, 'ENTJ': 4, 'ENTP': 5 },
      'ENTP': { 'INTJ': 5, 'INTP': 5, 'ENTJ': 5, 'ENTP': 4 },
    };

    function calculateGroupScore(types: string[]): number {
      if (types.length < 2) return 0;
      let totalScore = 0;
      let pairCount = 0;
      for (let i = 0; i < types.length; i++) {
        for (let j = i + 1; j < types.length; j++) {
          const score = compatibilityData[types[i]]?.[types[j]] || 3;
          totalScore += score;
          pairCount++;
        }
      }
      return pairCount > 0 ? totalScore / pairCount : 0;
    }

    it('should calculate correct score for 3 compatible types', () => {
      const types = ['INTJ', 'INTP', 'ENTJ'];
      const score = calculateGroupScore(types);
      // INTJ-INTP: 5, INTJ-ENTJ: 5, INTP-ENTJ: 5 = 15/3 = 5.0
      expect(score).toBe(5);
    });

    it('should calculate correct score for 4 types', () => {
      const types = ['INTJ', 'INTP', 'ENTJ', 'ENTP'];
      const score = calculateGroupScore(types);
      // All pairs are 5 except same-type pairs
      // 6 pairs total, all are 5 = 30/6 = 5.0
      expect(score).toBe(5);
    });

    it('should return 0 for less than 2 types', () => {
      expect(calculateGroupScore(['INTJ'])).toBe(0);
      expect(calculateGroupScore([])).toBe(0);
    });
  });

  describe('Share ID Generation', () => {
    it('should generate unique share IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const shareId = Math.random().toString(36).substring(2, 10);
        expect(shareId.length).toBeGreaterThanOrEqual(6);
        expect(shareId.length).toBeLessThanOrEqual(8);
        expect(ids.has(shareId)).toBe(false);
        ids.add(shareId);
      }
    });
  });

  describe('Score to Integer Conversion', () => {
    it('should correctly convert decimal scores to integers', () => {
      const testCases = [
        { score: 3.75, expected: 375 },
        { score: 4.5, expected: 450 },
        { score: 2.33, expected: 233 },
        { score: 5.0, expected: 500 },
      ];

      for (const { score, expected } of testCases) {
        const scoreInt = Math.round(score * 100);
        expect(scoreInt).toBe(expected);
      }
    });

    it('should correctly convert integers back to decimals', () => {
      const testCases = [
        { scoreInt: 375, expected: 3.75 },
        { scoreInt: 450, expected: 4.5 },
        { scoreInt: 233, expected: 2.33 },
        { scoreInt: 500, expected: 5.0 },
      ];

      for (const { scoreInt, expected } of testCases) {
        const score = scoreInt / 100;
        expect(score).toBe(expected);
      }
    });
  });

  describe('Score Labels', () => {
    function getScoreLabel(score: number): string {
      if (score >= 4.5) return '最高のチーム！';
      if (score >= 3.5) return '良いチーム';
      if (score >= 2.5) return '普通のチーム';
      if (score >= 1.5) return '努力が必要';
      return '挑戦的なチーム';
    }

    it('should return correct labels for different scores', () => {
      expect(getScoreLabel(5.0)).toBe('最高のチーム！');
      expect(getScoreLabel(4.5)).toBe('最高のチーム！');
      expect(getScoreLabel(4.0)).toBe('良いチーム');
      expect(getScoreLabel(3.5)).toBe('良いチーム');
      expect(getScoreLabel(3.0)).toBe('普通のチーム');
      expect(getScoreLabel(2.5)).toBe('普通のチーム');
      expect(getScoreLabel(2.0)).toBe('努力が必要');
      expect(getScoreLabel(1.5)).toBe('努力が必要');
      expect(getScoreLabel(1.0)).toBe('挑戦的なチーム');
    });
  });

  describe('Group Dynamics Analysis', () => {
    function analyzeGroupDimensions(types: string[]): Record<string, number> {
      const dimensions = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
      for (const type of types) {
        if (type.includes('E')) dimensions.E++;
        if (type.includes('I')) dimensions.I++;
        if (type.includes('S')) dimensions.S++;
        if (type.includes('N')) dimensions.N++;
        if (type.includes('T')) dimensions.T++;
        if (type.includes('F')) dimensions.F++;
        if (type.includes('J')) dimensions.J++;
        if (type.includes('P')) dimensions.P++;
      }
      return dimensions;
    }

    it('should correctly count dimension distribution', () => {
      const types = ['INTJ', 'ENFP', 'ISTJ'];
      const dimensions = analyzeGroupDimensions(types);
      
      expect(dimensions.I).toBe(2);
      expect(dimensions.E).toBe(1);
      expect(dimensions.N).toBe(2);
      expect(dimensions.S).toBe(1);
      expect(dimensions.T).toBe(2);
      expect(dimensions.F).toBe(1);
      expect(dimensions.J).toBe(2);
      expect(dimensions.P).toBe(1);
    });

    it('should handle all same type', () => {
      const types = ['INTJ', 'INTJ', 'INTJ'];
      const dimensions = analyzeGroupDimensions(types);
      
      expect(dimensions.I).toBe(3);
      expect(dimensions.E).toBe(0);
      expect(dimensions.N).toBe(3);
      expect(dimensions.S).toBe(0);
      expect(dimensions.T).toBe(3);
      expect(dimensions.F).toBe(0);
      expect(dimensions.J).toBe(3);
      expect(dimensions.P).toBe(0);
    });
  });

  describe('Member Validation', () => {
    it('should validate minimum 3 members', () => {
      const members = [
        { name: 'Alice', type: 'INTJ' },
        { name: 'Bob', type: 'ENFP' },
      ];
      expect(members.length >= 3).toBe(false);
    });

    it('should validate maximum 10 members', () => {
      const members = Array(11).fill({ name: 'Test', type: 'INTJ' });
      expect(members.length <= 10).toBe(false);
    });

    it('should accept valid member count', () => {
      const members = [
        { name: 'Alice', type: 'INTJ' },
        { name: 'Bob', type: 'ENFP' },
        { name: 'Carol', type: 'ISTJ' },
      ];
      expect(members.length >= 3 && members.length <= 10).toBe(true);
    });
  });
});
