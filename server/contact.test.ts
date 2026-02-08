import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({}),
    orderBy: vi.fn().mockReturnThis(),
  }),
}));

// Mock the LLM for translation
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "これは翻訳されたメッセージです。",
        },
      },
    ],
  }),
}));

// Mock the notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
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

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
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

function createAdminContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
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

describe("contact.submit", () => {
  it("submits inquiry in Japanese without translation", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "山田太郎",
      email: "yamada@example.com",
      category: "general",
      message: "サービスについて質問があります。",
      language: "ja",
    });

    expect(result).toEqual({ success: true });
  });

  it("submits inquiry in English with translation", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "John Doe",
      email: "john@example.com",
      category: "payment",
      message: "I have a question about payment.",
      language: "en",
    });

    expect(result).toEqual({ success: true });
  });

  it("accepts all category types", async () => {
    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const categories = ["general", "payment", "subscription", "technical", "feedback", "other"] as const;

    for (const category of categories) {
      const result = await caller.contact.submit({
        name: "Test User",
        email: "test@example.com",
        category,
        message: "Test message",
        language: "ja",
      });

      expect(result).toEqual({ success: true });
    }
  });

  it("works for authenticated users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.submit({
      name: "Test User",
      email: "test@example.com",
      category: "feedback",
      message: "Great service!",
      language: "en",
    });

    expect(result).toEqual({ success: true });
  });
});

describe("contact.getAll", () => {
  it("returns inquiries for admin users", async () => {
    const { ctx } = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contact.getAll();

    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.getAll()).rejects.toThrow("Admin access required");
  });
});

describe("contact.updateStatus", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.updateStatus({ id: 1, status: "resolved" })).rejects.toThrow("Admin access required");
  });
});

describe("contact.reply", () => {
  it("rejects non-admin users", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.contact.reply({ inquiryId: 1, message: "Test reply" })).rejects.toThrow("Admin access required");
  });
});
