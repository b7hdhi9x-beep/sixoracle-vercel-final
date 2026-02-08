import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Mock the database module
vi.mock("./db", () => {
  const mockUsers: Record<number, any> = {};
  
  return {
    getDb: vi.fn(async () => {
      return {
        select: () => ({
          from: () => ({
            where: (condition: any) => ({
              limit: (n: number) => {
                // Return the mock user based on the stored data
                const userId = 1; // We always use userId 1 in tests
                const user = mockUsers[userId] || {
                  id: 1,
                  openId: "test-open-id",
                  name: "Test User",
                  email: "test@example.com",
                  displayName: null,
                  nickname: null,
                  memo: null,
                  birthDate: null,
                  zodiacSign: null,
                  bio: null,
                  avatarUrl: null,
                  isPremium: false,
                  loginMethod: "email",
                  createdAt: new Date("2025-01-01"),
                  updatedAt: new Date("2025-01-01"),
                  lastSignedIn: new Date("2025-01-01"),
                  role: "user",
                  planType: "free",
                  premiumExpiresAt: null,
                };
                return [user];
              },
            }),
          }),
        }),
        update: () => ({
          set: (data: any) => {
            // Store the update data
            if (!mockUsers[1]) {
              mockUsers[1] = {
                id: 1,
                openId: "test-open-id",
                name: "Test User",
                email: "test@example.com",
                displayName: null,
                nickname: null,
                memo: null,
                birthDate: null,
                zodiacSign: null,
                bio: null,
                avatarUrl: null,
                isPremium: false,
                loginMethod: "email",
                createdAt: new Date("2025-01-01"),
                updatedAt: new Date("2025-01-01"),
                lastSignedIn: new Date("2025-01-01"),
                role: "user",
              };
            }
            Object.assign(mockUsers[1], data);
            return {
              where: () => Promise.resolve(),
            };
          },
        }),
      };
    }),
    _mockUsers: mockUsers,
  };
});

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-open-id",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "email",
    role: "user",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    lastSignedIn: new Date("2025-01-01"),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("user.updateProfile - nickname and memo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("accepts nickname in updateProfile input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      nickname: "テスト太郎",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts memo in updateProfile input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      memo: "これはテストメモです。自由にメモを書けます。",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts both nickname and memo together", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.user.updateProfile({
      nickname: "ニックネーム",
      memo: "メモ内容",
      displayName: "表示名",
    });

    expect(result).toEqual({ success: true });
  });

  it("rejects nickname longer than 50 characters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.user.updateProfile({
        nickname: "a".repeat(51),
      })
    ).rejects.toThrow();
  });

  it("rejects memo longer than 1000 characters", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.user.updateProfile({
        memo: "a".repeat(1001),
      })
    ).rejects.toThrow();
  });

  it("getProfile returns nickname and memo fields", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.user.getProfile();

    // Verify the profile response includes nickname and memo
    expect(profile).toHaveProperty("nickname");
    expect(profile).toHaveProperty("memo");
    expect(profile).toHaveProperty("id");
    expect(profile).toHaveProperty("name");
    expect(profile).toHaveProperty("email");
    expect(profile).toHaveProperty("displayName");
  });
});
