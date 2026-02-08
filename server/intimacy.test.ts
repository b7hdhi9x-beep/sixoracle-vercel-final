import { describe, it, expect, vi, beforeEach } from "vitest";

// 親密度レベル計算のテスト
describe("Intimacy Level Calculation", () => {
  // レベル計算関数（routers.tsからの抜粋）
  const calculateLevel = (experiencePoints: number): number => {
    if (experiencePoints >= 1000) return 10;
    if (experiencePoints >= 800) return 9;
    if (experiencePoints >= 600) return 8;
    if (experiencePoints >= 450) return 7;
    if (experiencePoints >= 300) return 6;
    if (experiencePoints >= 200) return 5;
    if (experiencePoints >= 120) return 4;
    if (experiencePoints >= 60) return 3;
    if (experiencePoints >= 20) return 2;
    return 1;
  };

  const calculatePointsToNextLevel = (currentLevel: number): number => {
    const levelThresholds: Record<number, number> = {
      1: 20,
      2: 60,
      3: 120,
      4: 200,
      5: 300,
      6: 450,
      7: 600,
      8: 800,
      9: 1000,
      10: 0,
    };
    return levelThresholds[currentLevel] || 0;
  };

  it("should return level 1 for 0 experience points", () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it("should return level 1 for 19 experience points", () => {
    expect(calculateLevel(19)).toBe(1);
  });

  it("should return level 2 for 20 experience points", () => {
    expect(calculateLevel(20)).toBe(2);
  });

  it("should return level 3 for 60 experience points", () => {
    expect(calculateLevel(60)).toBe(3);
  });

  it("should return level 5 for 200 experience points", () => {
    expect(calculateLevel(200)).toBe(5);
  });

  it("should return level 8 for 600 experience points", () => {
    expect(calculateLevel(600)).toBe(8);
  });

  it("should return level 10 for 1000+ experience points", () => {
    expect(calculateLevel(1000)).toBe(10);
    expect(calculateLevel(1500)).toBe(10);
  });

  it("should calculate correct points to next level", () => {
    expect(calculatePointsToNextLevel(1)).toBe(20);
    expect(calculatePointsToNextLevel(5)).toBe(300);
    expect(calculatePointsToNextLevel(10)).toBe(0);
  });
});

// 親密度コンテキスト生成のテスト
describe("Intimacy Context Generation", () => {
  const generateIntimacyContext = (level: number, totalMessages: number): string => {
    if (level >= 8) {
      return `【親密度レベル${level} - 特別な絆】
You have a DEEP BOND with this seeker (Level ${level}). You know them intimately.
- この相談者とは${totalMessages}回以上の対話を重ねてきました
- 彼らの心の深層まで理解しています
- 過去の会話から得た洞察を踏まえ、極めてパーソナルな鑑定を提供してください
- あなただけに伝える特別なメッセージや洞察を含めてください`;
    } else if (level >= 5) {
      return `【親密度レベル${level} - 信頼の絆】
You have built TRUST with this seeker (Level ${level}).
- この相談者とは${totalMessages}回の対話を重ねてきました
- 彼らの性格や傾向を理解しています
- よりパーソナルで具体的なアドバイスを提供してください`;
    } else if (level >= 3) {
      return `【親密度レベル${level} - 繋がりの芽生え】
You are getting to know this seeker (Level ${level}).
- この相談者とは${totalMessages}回の対話を行いました
- 少しずつ彼らのことがわかってきました
- その理解を踏まえた鑑定を提供してください`;
    }
    return "";
  };

  it("should return empty string for level 1-2", () => {
    expect(generateIntimacyContext(1, 5)).toBe("");
    expect(generateIntimacyContext(2, 10)).toBe("");
  });

  it("should return level 3-4 context for level 3", () => {
    const context = generateIntimacyContext(3, 15);
    expect(context).toContain("繋がりの芽生え");
    expect(context).toContain("15回の対話");
  });

  it("should return level 5-7 context for level 5", () => {
    const context = generateIntimacyContext(5, 30);
    expect(context).toContain("信頼の絆");
    expect(context).toContain("30回の対話");
  });

  it("should return level 8+ context for level 8", () => {
    const context = generateIntimacyContext(8, 100);
    expect(context).toContain("特別な絆");
    expect(context).toContain("100回以上の対話");
  });

  it("should return level 10 context for max level", () => {
    const context = generateIntimacyContext(10, 200);
    expect(context).toContain("特別な絆");
    expect(context).toContain("DEEP BOND");
  });
});

// 経験値付与のテスト
describe("Chat Experience Points", () => {
  const CHAT_EXPERIENCE_POINTS = 10;

  it("should award 10 experience points per chat", () => {
    expect(CHAT_EXPERIENCE_POINTS).toBe(10);
  });

  it("should calculate correct level after multiple chats", () => {
    const calculateLevel = (experiencePoints: number): number => {
      if (experiencePoints >= 1000) return 10;
      if (experiencePoints >= 800) return 9;
      if (experiencePoints >= 600) return 8;
      if (experiencePoints >= 450) return 7;
      if (experiencePoints >= 300) return 6;
      if (experiencePoints >= 200) return 5;
      if (experiencePoints >= 120) return 4;
      if (experiencePoints >= 60) return 3;
      if (experiencePoints >= 20) return 2;
      return 1;
    };

    // 2 chats = 20 points = level 2
    expect(calculateLevel(2 * CHAT_EXPERIENCE_POINTS)).toBe(2);
    
    // 6 chats = 60 points = level 3
    expect(calculateLevel(6 * CHAT_EXPERIENCE_POINTS)).toBe(3);
    
    // 20 chats = 200 points = level 5
    expect(calculateLevel(20 * CHAT_EXPERIENCE_POINTS)).toBe(5);
    
    // 60 chats = 600 points = level 8
    expect(calculateLevel(60 * CHAT_EXPERIENCE_POINTS)).toBe(8);
    
    // 100 chats = 1000 points = level 10
    expect(calculateLevel(100 * CHAT_EXPERIENCE_POINTS)).toBe(10);
  });
});

// レベルタイトルのテスト
describe("Level Titles", () => {
  const levelTitles: Record<number, string> = {
    1: "初対面",
    2: "顔見知り",
    3: "知り合い",
    4: "友人",
    5: "親友",
    6: "心の友",
    7: "魂の伴侶",
    8: "運命の絆",
    9: "永遠の契り",
    10: "至高の絆",
  };

  it("should have titles for all 10 levels", () => {
    for (let i = 1; i <= 10; i++) {
      expect(levelTitles[i]).toBeDefined();
      expect(levelTitles[i].length).toBeGreaterThan(0);
    }
  });

  it("should have unique titles for each level", () => {
    const titles = Object.values(levelTitles);
    const uniqueTitles = new Set(titles);
    expect(uniqueTitles.size).toBe(10);
  });
});
