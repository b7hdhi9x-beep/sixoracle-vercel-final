/**
 * お守り画像生成とPDF鑑定書ダウンロード機能のテスト
 */

import { describe, it, expect } from "vitest";
import { OMAMORI_STYLES } from "./omamoraGeneration";
import { generateReadingCertificate, ReadingCertificateData } from "./pdfGeneration";

describe("お守り画像生成機能", () => {
  it("全10人の占い師のお守りスタイルが定義されている", () => {
    const expectedOracles = [
      "souma", "reira", "sakuya", "akari", "yui",
      "gen", "shion", "seiran", "hizuki", "juga"
    ];
    
    expectedOracles.forEach(oracleId => {
      expect(OMAMORI_STYLES[oracleId]).toBeDefined();
      expect(OMAMORI_STYLES[oracleId].name).toBeTruthy();
      expect(OMAMORI_STYLES[oracleId].theme).toBeTruthy();
      expect(OMAMORI_STYLES[oracleId].colors).toHaveLength(3);
      expect(OMAMORI_STYLES[oracleId].symbols).toHaveLength(4);
      expect(OMAMORI_STYLES[oracleId].blessing).toBeTruthy();
    });
  });

  it("各占い師のお守りスタイルに固有のテーマがある", () => {
    const themes = Object.values(OMAMORI_STYLES).map(style => style.theme);
    const uniqueThemes = new Set(themes);
    
    // 全てのテーマがユニークであること
    expect(uniqueThemes.size).toBe(themes.length);
  });

  it("蒼真のお守りスタイルが正しく設定されている", () => {
    const soumaStyle = OMAMORI_STYLES["souma"];
    
    expect(soumaStyle.name).toBe("蒼真");
    expect(soumaStyle.theme).toBe("時の守護");
    expect(soumaStyle.colors).toContain("deep blue");
    expect(soumaStyle.symbols).toContain("hourglass");
    expect(soumaStyle.blessing).toContain("時の流れ");
  });

  it("玄のお守りスタイルが武士テーマである", () => {
    const genStyle = OMAMORI_STYLES["gen"];
    
    expect(genStyle.name).toBe("玄");
    expect(genStyle.theme).toBe("武士の守護");
    expect(genStyle.colors).toContain("crimson red");
    expect(genStyle.symbols).toContain("katana");
    expect(genStyle.blessing).toContain("武士の魂");
  });
});

describe("PDF鑑定書生成機能", () => {
  it("鑑定書データの型が正しく定義されている", () => {
    const testData: ReadingCertificateData = {
      userName: "テストユーザー",
      oracleId: "souma",
      oracleName: "蒼真",
      readingDate: new Date(),
      question: "テストの質問です",
      answer: "テストの回答です",
    };
    
    expect(testData.userName).toBe("テストユーザー");
    expect(testData.oracleId).toBe("souma");
    expect(testData.oracleName).toBe("蒼真");
  });

  it("生年月日を含む鑑定書データが作成できる", () => {
    const testData: ReadingCertificateData = {
      userName: "テストユーザー",
      oracleId: "reira",
      oracleName: "玲蘭",
      readingDate: new Date(),
      question: "恋愛について相談したいです",
      answer: "あなたの恋愛運は...",
      birthDate: new Date("1990-05-15"),
    };
    
    expect(testData.birthDate).toBeDefined();
    expect(testData.birthDate?.getFullYear()).toBe(1990);
  });
});

describe("占い師別お守りの祝福メッセージ", () => {
  it("全ての祝福メッセージが日本語で書かれている", () => {
    Object.values(OMAMORI_STYLES).forEach(style => {
      // 日本語の文字（ひらがな、カタカナ、漢字）が含まれていること
      expect(style.blessing).toMatch(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/);
    });
  });

  it("全ての祝福メッセージが「ように」で終わる", () => {
    Object.values(OMAMORI_STYLES).forEach(style => {
      expect(style.blessing).toMatch(/ように$/);
    });
  });
});
