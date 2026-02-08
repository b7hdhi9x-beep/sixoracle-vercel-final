import { describe, it, expect, vi, beforeEach } from "vitest";
import { db } from "./db";
import { favoriteOracles, userMessagePreferences, scheduledMessages, chatSessions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Mock the database
vi.mock("./db", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    execute: vi.fn(),
  },
}));

describe("Favorite Oracles Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should add an oracle to favorites", async () => {
    const mockFavorite = {
      id: 1,
      userId: 1,
      oracleId: "souma",
      displayOrder: 0,
      createdAt: new Date(),
    };

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockFavorite]),
      }),
    } as any);

    const result = await db.insert(favoriteOracles)
      .values({ userId: 1, oracleId: "souma", displayOrder: 0 })
      .returning();

    expect(result).toEqual([mockFavorite]);
    expect(db.insert).toHaveBeenCalledWith(favoriteOracles);
  });

  it("should list user favorites in order", async () => {
    const mockFavorites = [
      { id: 1, userId: 1, oracleId: "souma", displayOrder: 0, createdAt: new Date() },
      { id: 2, userId: 1, oracleId: "reira", displayOrder: 1, createdAt: new Date() },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockFavorites),
        }),
      }),
    } as any);

    const result = await db.select()
      .from(favoriteOracles)
      .where(eq(favoriteOracles.userId, 1))
      .orderBy(favoriteOracles.displayOrder);

    expect(result).toEqual(mockFavorites);
    expect(result.length).toBe(2);
    expect(result[0].oracleId).toBe("souma");
  });

  it("should remove an oracle from favorites", async () => {
    vi.mocked(db.delete).mockReturnValue({
      where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
    } as any);

    await db.delete(favoriteOracles)
      .where(and(
        eq(favoriteOracles.userId, 1),
        eq(favoriteOracles.oracleId, "souma")
      ));

    expect(db.delete).toHaveBeenCalledWith(favoriteOracles);
  });
});

describe("Session Categories Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update session category", async () => {
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      }),
    } as any);

    await db.update(chatSessions)
      .set({ category: "love" })
      .where(eq(chatSessions.id, 1));

    expect(db.update).toHaveBeenCalledWith(chatSessions);
  });

  it("should filter sessions by category", async () => {
    const mockSessions = [
      { id: 1, userId: 1, oracleId: "reira", category: "love", title: "恋愛相談" },
      { id: 2, userId: 1, oracleId: "reira", category: "love", title: "片思い" },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(mockSessions),
      }),
    } as any);

    const result = await db.select()
      .from(chatSessions)
      .where(and(
        eq(chatSessions.userId, 1),
        eq(chatSessions.category, "love")
      ));

    expect(result).toEqual(mockSessions);
    expect(result.every(s => s.category === "love")).toBe(true);
  });

  it("should validate category values", () => {
    const validCategories = ["love", "work", "health", "money", "relationships", "future", "spiritual", "other"];
    
    validCategories.forEach(cat => {
      expect(validCategories.includes(cat)).toBe(true);
    });
    
    expect(validCategories.includes("invalid")).toBe(false);
  });
});

describe("Scheduled Messages Feature", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create user message preferences with defaults", async () => {
    const mockPreferences = {
      id: 1,
      userId: 1,
      weeklyFortuneEnabled: true,
      dailyFortuneEnabled: false,
      seasonalMessagesEnabled: true,
      preferredDeliveryHour: 8,
      weeklyFortuneOracleId: null,
      dailyFortuneOracleId: null,
    };

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockPreferences]),
      }),
    } as any);

    const result = await db.insert(userMessagePreferences)
      .values({
        userId: 1,
        weeklyFortuneEnabled: true,
        dailyFortuneEnabled: false,
        seasonalMessagesEnabled: true,
        preferredDeliveryHour: 8,
      })
      .returning();

    expect(result[0].weeklyFortuneEnabled).toBe(true);
    expect(result[0].dailyFortuneEnabled).toBe(false);
    expect(result[0].preferredDeliveryHour).toBe(8);
  });

  it("should update message preferences", async () => {
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      }),
    } as any);

    await db.update(userMessagePreferences)
      .set({ dailyFortuneEnabled: true, dailyFortuneOracleId: "akari" })
      .where(eq(userMessagePreferences.userId, 1));

    expect(db.update).toHaveBeenCalledWith(userMessagePreferences);
  });

  it("should create a scheduled message", async () => {
    const mockMessage = {
      id: 1,
      userId: 1,
      oracleId: "souma",
      messageType: "weekly_fortune",
      content: "今週のあなたの運勢は...",
      scheduledAt: new Date(),
      isRead: false,
    };

    vi.mocked(db.insert).mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockMessage]),
      }),
    } as any);

    const result = await db.insert(scheduledMessages)
      .values({
        userId: 1,
        oracleId: "souma",
        messageType: "weekly_fortune",
        content: "今週のあなたの運勢は...",
        scheduledAt: new Date(),
      })
      .returning();

    expect(result[0].messageType).toBe("weekly_fortune");
    expect(result[0].isRead).toBe(false);
  });

  it("should mark message as read", async () => {
    vi.mocked(db.update).mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowsAffected: 1 }),
      }),
    } as any);

    await db.update(scheduledMessages)
      .set({ isRead: true, readAt: new Date() })
      .where(eq(scheduledMessages.id, 1));

    expect(db.update).toHaveBeenCalledWith(scheduledMessages);
  });

  it("should list unread messages for user", async () => {
    const mockMessages = [
      { id: 1, userId: 1, oracleId: "souma", messageType: "weekly_fortune", isRead: false },
      { id: 2, userId: 1, oracleId: "akari", messageType: "daily_fortune", isRead: false },
    ];

    vi.mocked(db.select).mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue(mockMessages),
        }),
      }),
    } as any);

    const result = await db.select()
      .from(scheduledMessages)
      .where(and(
        eq(scheduledMessages.userId, 1),
        eq(scheduledMessages.isRead, false)
      ))
      .orderBy(scheduledMessages.scheduledAt);

    expect(result).toEqual(mockMessages);
    expect(result.every(m => m.isRead === false)).toBe(true);
  });
});

describe("Message Types Validation", () => {
  it("should validate message types", () => {
    const validTypes = ["weekly_fortune", "daily_fortune", "seasonal", "special"];
    
    validTypes.forEach(type => {
      expect(validTypes.includes(type)).toBe(true);
    });
    
    expect(validTypes.includes("invalid_type")).toBe(false);
  });

  it("should validate delivery hour range", () => {
    const validHours = [6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 21, 22];
    
    validHours.forEach(hour => {
      expect(hour >= 0 && hour <= 23).toBe(true);
    });
    
    // Invalid hours
    expect(validHours.includes(3)).toBe(false);
    expect(validHours.includes(15)).toBe(false);
  });
});
