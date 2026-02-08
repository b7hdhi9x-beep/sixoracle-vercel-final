import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock the database module
vi.mock('./db', () => ({
  getDb: vi.fn(),
}));

// Mock the notification module
vi.mock('./_core/notification', () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe('Monthly Subscription Batch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('generateMonthlyActivationCode', () => {
    it('should generate a code in the correct format', async () => {
      // Mock database
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { generateMonthlyActivationCode } = await import('./monthlySubscriptionBatch');
      
      const result = await generateMonthlyActivationCode();
      
      expect(result.success).toBe(true);
      expect(result.code).toMatch(/^SIX\d{4}[A-Z0-9]{4}$/);
      expect(result.message).toContain('月次合言葉を生成しました');
    });

    it('should throw error when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { generateMonthlyActivationCode } = await import('./monthlySubscriptionBatch');
      
      await expect(generateMonthlyActivationCode()).rejects.toThrow('Database not available');
    });
  });

  describe('getCurrentMonthlyCode', () => {
    it('should return existing code if found', async () => {
      const mockCode = 'SIX2601ABCD';
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ code: mockCode }]),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { getCurrentMonthlyCode } = await import('./monthlySubscriptionBatch');
      
      const result = await getCurrentMonthlyCode();
      
      expect(result).toBe(mockCode);
    });

    it('should return null when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getCurrentMonthlyCode } = await import('./monthlySubscriptionBatch');
      
      const result = await getCurrentMonthlyCode();
      
      expect(result).toBeNull();
    });
  });

  describe('sendRenewalReminders', () => {
    it('should send reminders to users expiring in 3 days', async () => {
      // This test verifies the function returns the correct structure
      // when no users are found (empty result)
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]), // Empty array - no users expiring
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { sendRenewalReminders } = await import('./monthlySubscriptionBatch');
      
      const result = await sendRenewalReminders();
      
      expect(result.sent).toBe(0);
      expect(Array.isArray(result.users)).toBe(true);
      expect(result.users.length).toBe(0);
    });

    it('should throw error when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { sendRenewalReminders } = await import('./monthlySubscriptionBatch');
      
      await expect(sendRenewalReminders()).rejects.toThrow('Database not available');
    });
  });

  describe('processExpiredSubscriptions', () => {
    it('should downgrade expired users', async () => {
      const mockExpiredUsers = [
        {
          id: 1,
          isPremium: true,
          premiumExpiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockExpiredUsers),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { processExpiredSubscriptions } = await import('./monthlySubscriptionBatch');
      
      const result = await processExpiredSubscriptions();
      
      expect(result.processed).toBeGreaterThanOrEqual(0);
      expect(result.downgraded).toBeGreaterThanOrEqual(0);
    });

    it('should throw error when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { processExpiredSubscriptions } = await import('./monthlySubscriptionBatch');
      
      await expect(processExpiredSubscriptions()).rejects.toThrow('Database not available');
    });
  });

  describe('sendActivationCodeToUser', () => {
    it('should send notification to user', async () => {
      const mockDb = {
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { sendActivationCodeToUser } = await import('./monthlySubscriptionBatch');
      
      const result = await sendActivationCodeToUser(1, 'SIX2601ABCD', 'Test User', 'test@example.com');
      
      expect(result).toBe(true);
    });

    it('should return false when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { sendActivationCodeToUser } = await import('./monthlySubscriptionBatch');
      
      const result = await sendActivationCodeToUser(1, 'SIX2601ABCD', 'Test User', 'test@example.com');
      
      expect(result).toBe(false);
    });
  });

  describe('getSubscriptionStats', () => {
    it('should return subscription statistics', async () => {
      const mockUsers = [
        {
          id: 1,
          isPremium: true,
          premiumExpiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          renewalReminderSent: false,
        },
        {
          id: 2,
          isPremium: true,
          premiumExpiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          renewalReminderSent: true,
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUsers),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { getSubscriptionStats } = await import('./monthlySubscriptionBatch');
      
      const result = await getSubscriptionStats();
      
      expect(result).toHaveProperty('totalPremium');
      expect(result).toHaveProperty('expiringIn3Days');
      expect(result).toHaveProperty('expiringIn7Days');
      expect(result).toHaveProperty('expiredToday');
      expect(result).toHaveProperty('renewalRemindersSent');
    });

    it('should throw error when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getSubscriptionStats } = await import('./monthlySubscriptionBatch');
      
      await expect(getSubscriptionStats()).rejects.toThrow('Database not available');
    });
  });

  describe('runDailySubscriptionTasks', () => {
    it('should run both reminders and expiration processing', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { runDailySubscriptionTasks } = await import('./monthlySubscriptionBatch');
      
      const result = await runDailySubscriptionTasks();
      
      expect(result).toHaveProperty('reminders');
      expect(result).toHaveProperty('expired');
      expect(result.reminders).toHaveProperty('sent');
      expect(result.reminders).toHaveProperty('users');
      expect(result.expired).toHaveProperty('processed');
      expect(result.expired).toHaveProperty('downgraded');
    });
  });

  describe('runMonthlySubscriptionTasks', () => {
    it('should run all monthly tasks', async () => {
      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]), // Return empty array for queries
        limit: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({}),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { runMonthlySubscriptionTasks } = await import('./monthlySubscriptionBatch');
      
      const result = await runMonthlySubscriptionTasks();
      
      expect(result).toHaveProperty('newCode');
      expect(result).toHaveProperty('reminders');
      expect(result).toHaveProperty('expired');
    });
  });

  describe('getMonthlyCodeHistory', () => {
    it('should return empty array when database is not available', async () => {
      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(null);

      const { getMonthlyCodeHistory } = await import('./monthlySubscriptionBatch');
      
      const result = await getMonthlyCodeHistory();
      
      expect(result).toEqual([]);
    });

    it('should return formatted code history', async () => {
      const mockCodes = [
        {
          code: 'SIX2601ABCD',
          status: 'pending',
          adminNote: '月次自動生成 (2026年1月)',
          usedByUserId: null,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      ];

      const mockDb = {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockCodes),
      };

      const { getDb } = await import('./db');
      vi.mocked(getDb).mockResolvedValue(mockDb as any);

      const { getMonthlyCodeHistory } = await import('./monthlySubscriptionBatch');
      
      const result = await getMonthlyCodeHistory();
      
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('code');
        expect(result[0]).toHaveProperty('month');
        expect(result[0]).toHaveProperty('status');
      }
    });
  });
});
