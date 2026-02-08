/**
 * ChatGPT差別化機能のテスト
 * ① 占術データの非公開プロンプト化
 * ② 連続性と記憶の演出
 * ③ 占い専用の出力・演出
 */

import { describe, it, expect } from "vitest";
import {
  getTodayFortune,
  LIU_SHEN_MEANINGS,
  LIU_SHEN,
} from "./fortuneCalculations";
import { generateCertificatePreview, ORACLE_INFO } from "./pdfGeneration";

describe("① 占術データの非公開プロンプト化", () => {
  describe("getTodayFortune", () => {
    it("今日の運勢データを正しく返す", () => {
      const fortune = getTodayFortune();

      expect(fortune).toHaveProperty("date");
      expect(fortune).toHaveProperty("ganZhi");
      expect(fortune).toHaveProperty("mainLiuShen");
      expect(fortune).toHaveProperty("liuShenMeaning");
      expect(fortune).toHaveProperty("luckyColor");
      expect(fortune).toHaveProperty("luckyNumber");
      expect(fortune).toHaveProperty("luckyDirection");
    });

    it("六神は6種類のいずれかである", () => {
      const fortune = getTodayFortune();
      const validLiuShen = ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"];
      expect(validLiuShen).toContain(fortune.mainLiuShen);
    });

    it("六神の意味が定義されている", () => {
      const fortune = getTodayFortune();
      expect(fortune.liuShenMeaning).toBeDefined();
      expect(fortune.liuShenMeaning.meaning).toBeTruthy();
      expect(fortune.liuShenMeaning.element).toBeTruthy();
    });

    it("ラッキーナンバーは1-9の範囲内", () => {
      const fortune = getTodayFortune();
      expect(fortune.luckyNumber).toBeGreaterThanOrEqual(1);
      expect(fortune.luckyNumber).toBeLessThanOrEqual(9);
    });

    it("ラッキーカラーが定義されている", () => {
      const fortune = getTodayFortune();
      expect(fortune.luckyColor).toBeTruthy();
      expect(typeof fortune.luckyColor).toBe("string");
    });
  });

  describe("LIU_SHEN", () => {
    it("六神の定数が定義されている", () => {
      expect(LIU_SHEN).toBeDefined();
      expect(LIU_SHEN.length).toBe(6);
      expect(LIU_SHEN).toContain("青龍");
      expect(LIU_SHEN).toContain("朱雀");
      expect(LIU_SHEN).toContain("勾陳");
      expect(LIU_SHEN).toContain("螣蛇");
      expect(LIU_SHEN).toContain("白虎");
      expect(LIU_SHEN).toContain("玄武");
    });
  });

  describe("getTodayFortune with birthDate", () => {
    it("生年月日を渡すと個人分析が含まれる", () => {
      const birthDate = new Date("1990-05-15");
      const fortune = getTodayFortune(birthDate);

      expect(fortune.personalAnalysis).toBeDefined();
      expect(fortune.personalAnalysis?.mainElement).toBeTruthy();
      expect(fortune.personalAnalysis?.personality).toBeTruthy();
      expect(fortune.personalAnalysis?.todayCompatibility).toBeTruthy();
    });

    it("生年月日なしでも基本情報は返る", () => {
      const fortune = getTodayFortune();

      expect(fortune.date).toBeTruthy();
      expect(fortune.ganZhi).toBeTruthy();
      expect(fortune.mainLiuShen).toBeTruthy();
      expect(fortune.personalAnalysis).toBeUndefined();
    });
  });
});

describe("③ 占い専用の出力・演出", () => {
  describe("ORACLE_INFO", () => {
    it("全10人の占い師情報が定義されている", () => {
      const expectedOracles = [
        "souma", "reira", "sakuya", "akari", "yui",
        "gen", "shion", "seiran", "hizuki", "juga"
      ];

      for (const oracleId of expectedOracles) {
        expect(ORACLE_INFO[oracleId]).toBeDefined();
        expect(ORACLE_INFO[oracleId].name).toBeTruthy();
        expect(ORACLE_INFO[oracleId].englishName).toBeTruthy();
        expect(ORACLE_INFO[oracleId].title).toBeTruthy();
        expect(ORACLE_INFO[oracleId].specialty).toBeTruthy();
        expect(ORACLE_INFO[oracleId].color).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  });

  describe("generateCertificatePreview", () => {
    it("HTML形式の鑑定書を生成できる", () => {
      const html = generateCertificatePreview({
        userName: "テストユーザー",
        oracleId: "souma",
        oracleName: "蒼真",
        readingDate: new Date(),
        question: "仕事運について教えてください",
        answer: "あなたの仕事運は上昇傾向にあります。特に今月は新しいプロジェクトに挑戦する良い時期です。",
      });

      expect(html).toContain("<!DOCTYPE html>");
      expect(html).toContain("鑑定書");
      expect(html).toContain("蒼真");
      expect(html).toContain("テストユーザー");
      expect(html).toContain("仕事運について教えてください");
    });

    it("六神情報が含まれている", () => {
      const html = generateCertificatePreview({
        userName: "テストユーザー",
        oracleId: "reira",
        oracleName: "玲蘭",
        readingDate: new Date(),
        question: "恋愛運について",
        answer: "素敵な出会いが待っています。",
      });

      // 六神のいずれかが含まれているはず
      const hasLiuShen = ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"].some(
        (ls) => html.includes(ls)
      );
      expect(hasLiuShen).toBe(true);
    });

    it("開運情報が含まれている", () => {
      const html = generateCertificatePreview({
        userName: "テストユーザー",
        oracleId: "akari",
        oracleName: "灯",
        readingDate: new Date(),
        question: "今日の運勢は？",
        answer: "良い一日になるでしょう。",
      });

      expect(html).toContain("ラッキーカラー");
      expect(html).toContain("ラッキーナンバー");
      expect(html).toContain("ラッキー方位");
    });
  });
});

describe("LIU_SHEN_MEANINGS", () => {
  it("全6種類の六神の意味が定義されている", () => {
    const liuShenNames = ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"];

    for (const name of liuShenNames) {
      expect(LIU_SHEN_MEANINGS[name]).toBeDefined();
      expect(LIU_SHEN_MEANINGS[name].meaning).toBeTruthy();
      expect(LIU_SHEN_MEANINGS[name].element).toBeTruthy();
      expect(LIU_SHEN_MEANINGS[name].direction).toBeTruthy();
      expect(LIU_SHEN_MEANINGS[name].fortune).toBeTruthy();
      expect(LIU_SHEN_MEANINGS[name].advice).toBeTruthy();
    }
  });
});
