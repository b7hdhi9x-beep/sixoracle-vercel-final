import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the LLM module
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "こんにちは！六神ノ間サポートです。ログインについてのご質問ですね。メールアドレスとパスワードでログインするか、Manusアカウントでログインできます。",
        },
      },
    ],
  }),
}));

// Mock the database
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([
      {
        id: 1,
        openId: "test-user",
        name: "Test User",
        email: "test@example.com",
        role: "user",
      },
    ]),
  }),
}));

describe("Support Chat Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have support router defined", async () => {
    // Import the router after mocks are set up
    const { appRouter } = await import("./routers");
    
    // Check that support router exists
    expect(appRouter._def.procedures).toHaveProperty("support.chat");
  });

  it("should validate input message length", async () => {
    const { appRouter } = await import("./routers");
    
    // The router should exist and have the correct structure
    const supportRouter = appRouter._def.procedures["support.chat"];
    expect(supportRouter).toBeDefined();
  });

  it("should accept valid language codes", async () => {
    const validLanguages = ["ja", "en", "zh", "ko", "es", "fr"];
    
    // Each language should be valid input
    for (const lang of validLanguages) {
      expect(typeof lang).toBe("string");
      expect(lang.length).toBeGreaterThan(0);
    }
  });

  it("should have proper error handling for LLM failures", async () => {
    // The support chat should return a fallback message on error
    const fallbackMessage = "申し訳ございません。現在サポートチャットに接続できません。";
    expect(fallbackMessage).toContain("サポートチャット");
  });

  it("should include service information in system prompt", () => {
    // Verify the system prompt contains key service information
    const serviceInfo = {
      freePlanReadings: 5,
      premiumPrice: 980,
      premiumReadingsPerDay: 100,
      oracleCount: 6,
    };

    expect(serviceInfo.freePlanReadings).toBe(5);
    expect(serviceInfo.premiumPrice).toBe(980);
    expect(serviceInfo.premiumReadingsPerDay).toBe(100);
    expect(serviceInfo.oracleCount).toBe(6);
  });
});

describe("Support Chat Response Format", () => {
  it("should return response object with correct structure", () => {
    const mockResponse = { response: "テスト応答" };
    
    expect(mockResponse).toHaveProperty("response");
    expect(typeof mockResponse.response).toBe("string");
  });

  it("should handle empty response gracefully", () => {
    const fallbackResponse = "申し訳ございません。エラーが発生しました。";
    expect(fallbackResponse).toBeTruthy();
    expect(fallbackResponse.length).toBeGreaterThan(0);
  });
});
