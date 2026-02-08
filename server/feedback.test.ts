import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn(() => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockResolvedValue({}),
      update: vi.fn(() => ({
        set: vi.fn(() => ({
          where: vi.fn().mockResolvedValue({}),
        })),
      })),
      delete: vi.fn(() => ({
        where: vi.fn().mockResolvedValue({}),
      })),
    };
    // Make select().from() return an empty array for block list queries
    mockDb.from.mockImplementation(() => ({
      where: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
      then: (resolve: (value: any[]) => void) => resolve([]),
    }));
    return mockDb;
  }),
}));

// Mock the LLM
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "翻訳されたメッセージ" } }],
  }),
}));

// Mock the notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Feedback Router", () => {
  const mockUser = {
    id: 1,
    name: "Test User",
    displayName: "テストユーザー",
    email: "test@example.com",
    role: "user" as const,
    isPremium: false,
    openId: "test-open-id",
    avatarUrl: null,
  };

  const mockAdminUser = {
    ...mockUser,
    id: 2,
    name: "Admin User",
    role: "admin" as const,
  };

  const caller = appRouter.createCaller({
    user: mockUser,
  });

  const adminCaller = appRouter.createCaller({
    user: mockAdminUser,
  });

  const publicCaller = appRouter.createCaller({
    user: null,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("feedback.submit", () => {
    it("should submit feedback successfully", async () => {
      const result = await caller.feedback.submit({
        category: "suggestion",
        message: "Great service!",
        rating: 5,
        language: "en",
        isPublic: true,
      });

      expect(result).toEqual({ success: true });
    });

    it("should submit feedback with Japanese message without translation", async () => {
      const result = await caller.feedback.submit({
        category: "praise",
        message: "素晴らしいサービスです！",
        rating: 5,
        language: "ja",
        isPublic: true,
      });

      expect(result).toEqual({ success: true });
    });

    it("should submit feedback without rating", async () => {
      const result = await caller.feedback.submit({
        category: "bug_report",
        message: "Found a bug",
        language: "en",
        isPublic: false,
      });

      expect(result).toEqual({ success: true });
    });

    it("should handle all category types", async () => {
      const categories = ["praise", "suggestion", "bug_report", "feature_request", "other"] as const;
      
      for (const category of categories) {
        const result = await caller.feedback.submit({
          category,
          message: `Test message for ${category}`,
          language: "ja",
          isPublic: true,
        });
        expect(result).toEqual({ success: true });
      }
    });

    it("should handle all supported languages", async () => {
      const languages = ["ja", "en", "zh", "ko", "es", "fr"] as const;
      
      for (const language of languages) {
        const result = await caller.feedback.submit({
          category: "suggestion",
          message: `Test message in ${language}`,
          language,
          isPublic: true,
        });
        expect(result).toEqual({ success: true });
      }
    });
  });

  describe("feedback.getPublic", () => {
    it("should return public feedback for unauthenticated users", async () => {
      const result = await publicCaller.feedback.getPublic();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return public feedback for authenticated users", async () => {
      const result = await caller.feedback.getPublic();
      
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("feedback.getAll (admin only)", () => {
    it("should return all feedback for admin users", async () => {
      const result = await adminCaller.feedback.getAll();
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should throw error for non-admin users", async () => {
      await expect(caller.feedback.getAll()).rejects.toThrow("Admin access required");
    });
  });

  describe("feedback.updateStatus (admin only)", () => {
    it("should update feedback status for admin users", async () => {
      const result = await adminCaller.feedback.updateStatus({
        id: 1,
        status: "approved",
        isApproved: true,
      });

      expect(result).toEqual({ success: true });
    });

    it("should update feedback with admin note", async () => {
      const result = await adminCaller.feedback.updateStatus({
        id: 1,
        status: "rejected",
        isApproved: false,
        adminNote: "Inappropriate content",
      });

      expect(result).toEqual({ success: true });
    });

    it("should flag feedback", async () => {
      const result = await adminCaller.feedback.updateStatus({
        id: 1,
        status: "hidden",
        isFlagged: true,
      });

      expect(result).toEqual({ success: true });
    });

    it("should throw error for non-admin users", async () => {
      await expect(
        caller.feedback.updateStatus({
          id: 1,
          status: "approved",
        })
      ).rejects.toThrow("Admin access required");
    });
  });
});
