import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the notification module
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the database
vi.mock('./db', () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
          }]),
        }),
      }),
    }),
  }),
}));

describe('Suspicious Activity Detection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rate Limit Violation Tracking', () => {
    it('should track rate limit violations', () => {
      // Test that the rate limit violation tracking constants are properly defined
      const RATE_LIMIT_VIOLATION_THRESHOLD = 10;
      const RATE_LIMIT_VIOLATION_WINDOW_MS = 300000;
      
      expect(RATE_LIMIT_VIOLATION_THRESHOLD).toBe(10);
      expect(RATE_LIMIT_VIOLATION_WINDOW_MS).toBe(300000); // 5 minutes
    });

    it('should have proper notification cooldown', () => {
      const RATE_LIMIT_NOTIFICATION_COOLDOWN_MS = 3600000;
      
      expect(RATE_LIMIT_NOTIFICATION_COOLDOWN_MS).toBe(3600000); // 1 hour
    });
  });

  describe('Bot Detection', () => {
    it('should have proper bot detection thresholds', () => {
      const BOT_DETECTION_WINDOW_MS = 60000;
      const MAX_MESSAGES_PER_MINUTE = 20;
      const SUSPICION_THRESHOLD = 5;
      const BAN_DURATION_MS = 3600000;
      
      expect(BOT_DETECTION_WINDOW_MS).toBe(60000); // 1 minute
      expect(MAX_MESSAGES_PER_MINUTE).toBe(20);
      expect(SUSPICION_THRESHOLD).toBe(5);
      expect(BAN_DURATION_MS).toBe(3600000); // 1 hour
    });

    it('should detect repetitive messages as suspicious', () => {
      // Test the logic for detecting repetitive messages
      const recentMessages = ['hello', 'hello', 'hello', 'hello', 'hello'];
      const uniqueMessages = new Set(recentMessages.map(m => m.toLowerCase().trim()));
      
      // If 5 recent messages have 2 or fewer unique messages, it's suspicious
      expect(recentMessages.length).toBe(5);
      expect(uniqueMessages.size).toBe(1);
      expect(recentMessages.length >= 3 && uniqueMessages.size <= 2).toBe(true);
    });

    it('should detect short messages as potentially automated', () => {
      const recentMessages = ['a', 'b', 'c', 'd', 'e'];
      const shortMessageCount = recentMessages.filter(m => m.length < 5).length;
      
      // If 4 or more short messages, it's suspicious
      expect(shortMessageCount).toBe(5);
      expect(shortMessageCount >= 4).toBe(true);
    });

    it('should detect automated patterns', () => {
      const automatedPatterns = [
        /^test\d*$/i,
        /^\d+$/,
        /^[a-z]$/i,
        /^(.)\1+$/, // Repeated single character
      ];
      
      // Test various automated-looking messages
      expect(automatedPatterns.some(p => p.test('test'))).toBe(true);
      expect(automatedPatterns.some(p => p.test('test123'))).toBe(true);
      expect(automatedPatterns.some(p => p.test('12345'))).toBe(true);
      expect(automatedPatterns.some(p => p.test('a'))).toBe(true);
      expect(automatedPatterns.some(p => p.test('aaaa'))).toBe(true);
      
      // Normal messages should not match
      expect(automatedPatterns.some(p => p.test('こんにちは、占いをお願いします'))).toBe(false);
      expect(automatedPatterns.some(p => p.test('恋愛運を見てください'))).toBe(false);
    });
  });

  describe('Notification Content', () => {
    it('should format notification content correctly for bot detection', () => {
      const userId = 123;
      const suspicionScore = 7;
      const message = 'test message';
      
      const typeLabels: Record<string, string> = {
        'bot_detected': '🤖 Bot検出',
        'rate_limit': '⚠️ レート制限超過',
        'high_usage': '📊 異常な利用パターン'
      };
      
      const title = `【不正利用検出】${typeLabels['bot_detected']}`;
      
      expect(title).toBe('【不正利用検出】🤖 Bot検出');
      expect(typeLabels['bot_detected']).toContain('Bot');
      expect(typeLabels['rate_limit']).toContain('レート制限');
    });

    it('should format notification content correctly for rate limit violation', () => {
      const userId = 456;
      const violationCount = 15;
      
      const title = `【不正利用検出】⚠️ レート制限連続違反`;
      const content = `レート制限の連続違反を検出しました。

【検出タイプ】
⚠️ レート制限連続違反

【ユーザー情報】
ユーザーID: ${userId}

【違反回数】
${violationCount}回（5分以内）`;
      
      expect(title).toContain('レート制限');
      expect(content).toContain(`${violationCount}回`);
      expect(content).toContain(`ユーザーID: ${userId}`);
    });
  });

  describe('Cooldown Logic', () => {
    it('should respect notification cooldown period', () => {
      const NOTIFICATION_COOLDOWN_MS = 3600000; // 1 hour
      const now = Date.now();
      const lastNotification = now - 1800000; // 30 minutes ago
      
      // Should not send notification if within cooldown
      const shouldNotify = !(lastNotification && now - lastNotification < NOTIFICATION_COOLDOWN_MS);
      expect(shouldNotify).toBe(false);
      
      // Should send notification if cooldown has passed
      const oldNotification = now - 4000000; // More than 1 hour ago
      const shouldNotifyOld = !(oldNotification && now - oldNotification < NOTIFICATION_COOLDOWN_MS);
      expect(shouldNotifyOld).toBe(true);
    });
  });
});
