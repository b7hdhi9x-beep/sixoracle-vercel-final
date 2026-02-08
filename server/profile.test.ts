import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([{
      id: 1,
      name: "Test User",
      email: "test@example.com",
      displayName: "テストユーザー",
      birthDate: new Date("1990-01-15"),
      zodiacSign: "山羊座",
      bio: "テスト自己紹介",
      avatarUrl: "https://example.com/avatar.jpg",
      isPremium: true,
      createdAt: new Date(),
    }]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
  }),
}));

// Mock the storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({
    key: "avatars/1-123456-abc123.jpg",
    url: "https://storage.example.com/avatars/1-123456-abc123.jpg",
  }),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };

  return { ctx };
}

describe("profile.get", () => {
  it("returns profile data for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.getProfile();

    expect(result).toHaveProperty("id");
    expect(result).toHaveProperty("email");
    expect(result).toHaveProperty("displayName");
    expect(result).toHaveProperty("birthDate");
    expect(result).toHaveProperty("zodiacSign");
    expect(result).toHaveProperty("bio");
    expect(result).toHaveProperty("avatarUrl");
    expect(result).toHaveProperty("isPremium");
    expect(result).toHaveProperty("createdAt");
  });
});

describe("profile.update", () => {
  it("updates profile with display name", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      displayName: "新しい名前",
    });

    expect(result).toEqual({ success: true });
  });

  it("updates profile with birth date and calculates zodiac", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      birthDate: "1990-07-15",
    });

    expect(result).toEqual({ success: true });
  });

  it("updates profile with bio", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      bio: "これは新しい自己紹介です。",
    });

    expect(result).toEqual({ success: true });
  });

  it("updates multiple fields at once", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      displayName: "新しい名前",
      birthDate: "1995-03-25",
      zodiacSign: "牡羊座",
      bio: "複数フィールドの更新テスト",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("profile.uploadAvatar", () => {
  it("uploads avatar image successfully", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a small valid base64 image (1x1 pixel JPEG)
    const base64Image = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQCEAwEPwAB//9k=";

    const result = await caller.user.uploadAvatar({
      imageData: base64Image,
      mimeType: "image/jpeg",
    });

    expect(result).toHaveProperty("avatarUrl");
    expect(typeof result.avatarUrl).toBe("string");
  });

  it("rejects invalid mime type", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.user.uploadAvatar({
        imageData: "data:text/plain;base64,SGVsbG8gV29ybGQ=",
        mimeType: "text/plain",
      })
    ).rejects.toThrow("Invalid image type");
  });
});
