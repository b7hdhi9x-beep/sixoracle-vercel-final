import { describe, it, expect } from "vitest";

// 限定コンテンツ解放ロジックのテスト
describe("Exclusive Content Unlock Logic", () => {
  // レベルに基づく解放判定
  const isUnlocked = (currentLevel: number, requiredLevel: number): boolean => {
    return currentLevel >= requiredLevel;
  };

  it("should unlock content when level equals required level", () => {
    expect(isUnlocked(3, 3)).toBe(true);
  });

  it("should unlock content when level exceeds required level", () => {
    expect(isUnlocked(5, 3)).toBe(true);
  });

  it("should not unlock content when level is below required level", () => {
    expect(isUnlocked(2, 3)).toBe(false);
  });

  it("should unlock level 1 content for all users", () => {
    expect(isUnlocked(1, 1)).toBe(true);
  });

  it("should not unlock high level content for new users", () => {
    expect(isUnlocked(1, 10)).toBe(false);
  });
});

// 報酬タイプの分類テスト
describe("Reward Type Classification", () => {
  const rewardTypes = [
    "title",
    "image_style",
    "special_greeting",
    "exclusive_advice",
    "anniversary_message",
    "custom_avatar",
    "exclusive_menu",
    "deep_reading",
    "special_prompt",
  ];

  const usableTypes = ["exclusive_menu", "special_prompt"];
  const displayTypes = ["title", "special_greeting", "image_style"];

  it("should have all expected reward types", () => {
    expect(rewardTypes).toContain("exclusive_menu");
    expect(rewardTypes).toContain("deep_reading");
    expect(rewardTypes).toContain("special_prompt");
  });

  it("should identify usable reward types", () => {
    expect(usableTypes).toContain("exclusive_menu");
    expect(usableTypes).toContain("special_prompt");
    expect(usableTypes).not.toContain("title");
  });

  it("should identify display-only reward types", () => {
    expect(displayTypes).toContain("title");
    expect(displayTypes).toContain("special_greeting");
    expect(displayTypes).not.toContain("exclusive_menu");
  });
});

// オラクル別・ユニバーサル報酬の判定テスト
describe("Oracle-specific vs Universal Rewards", () => {
  interface Reward {
    id: number;
    oracleId: string | null;
    requiredLevel: number;
  }

  const rewards: Reward[] = [
    { id: 1, oracleId: null, requiredLevel: 3 }, // Universal
    { id: 2, oracleId: "souma", requiredLevel: 5 }, // Oracle-specific
    { id: 3, oracleId: "shion", requiredLevel: 5 }, // Oracle-specific
    { id: 4, oracleId: null, requiredLevel: 8 }, // Universal
  ];

  const getUnlockedRewards = (
    oracleId: string,
    oracleLevels: Record<string, number>,
    maxLevel: number
  ): Reward[] => {
    return rewards.filter((reward) => {
      if (reward.oracleId) {
        // Oracle-specific: check that oracle's level
        const level = oracleLevels[reward.oracleId] || 1;
        return level >= reward.requiredLevel;
      } else {
        // Universal: check max level across all oracles
        return maxLevel >= reward.requiredLevel;
      }
    });
  };

  it("should unlock universal rewards based on max level", () => {
    const oracleLevels = { souma: 3, shion: 2 };
    const maxLevel = 3;
    const unlocked = getUnlockedRewards("souma", oracleLevels, maxLevel);
    
    expect(unlocked.some(r => r.id === 1)).toBe(true); // Universal Lv3
    expect(unlocked.some(r => r.id === 4)).toBe(false); // Universal Lv8
  });

  it("should unlock oracle-specific rewards based on that oracle's level", () => {
    const oracleLevels = { souma: 5, shion: 2 };
    const maxLevel = 5;
    const unlocked = getUnlockedRewards("souma", oracleLevels, maxLevel);
    
    expect(unlocked.some(r => r.id === 2)).toBe(true); // souma Lv5
    expect(unlocked.some(r => r.id === 3)).toBe(false); // shion Lv5 (but shion is Lv2)
  });

  it("should not unlock rewards when no level is high enough", () => {
    const oracleLevels = { souma: 1, shion: 1 };
    const maxLevel = 1;
    const unlocked = getUnlockedRewards("souma", oracleLevels, maxLevel);
    
    expect(unlocked.length).toBe(0);
  });
});

// 報酬データのパースと検証テスト
describe("Reward Data Parsing", () => {
  const parseRewardData = (rewardData: string | null): any => {
    if (!rewardData) return null;
    try {
      return JSON.parse(rewardData);
    } catch {
      return null;
    }
  };

  it("should parse valid JSON reward data", () => {
    const data = '{"prompt": "特別な鑑定プロンプト", "style": "deep"}';
    const parsed = parseRewardData(data);
    expect(parsed).toEqual({ prompt: "特別な鑑定プロンプト", style: "deep" });
  });

  it("should return null for null reward data", () => {
    expect(parseRewardData(null)).toBeNull();
  });

  it("should return null for invalid JSON", () => {
    expect(parseRewardData("invalid json")).toBeNull();
  });

  it("should handle empty string", () => {
    expect(parseRewardData("")).toBeNull();
  });
});

// 進捗計算テスト
describe("Progress Calculation", () => {
  const calculateProgress = (currentLevel: number, targetLevel: number): number => {
    if (currentLevel >= targetLevel) return 100;
    return Math.round((currentLevel / targetLevel) * 100);
  };

  const getLevelsToNextUnlock = (currentLevel: number, nextRequiredLevel: number): number => {
    return Math.max(0, nextRequiredLevel - currentLevel);
  };

  it("should calculate progress percentage correctly", () => {
    expect(calculateProgress(3, 5)).toBe(60);
    expect(calculateProgress(5, 10)).toBe(50);
    expect(calculateProgress(1, 3)).toBe(33);
  });

  it("should return 100% when current level meets or exceeds target", () => {
    expect(calculateProgress(5, 5)).toBe(100);
    expect(calculateProgress(7, 5)).toBe(100);
  });

  it("should calculate levels to next unlock correctly", () => {
    expect(getLevelsToNextUnlock(3, 5)).toBe(2);
    expect(getLevelsToNextUnlock(5, 5)).toBe(0);
    expect(getLevelsToNextUnlock(7, 5)).toBe(0);
  });
});
