import { describe, it, expect } from "vitest";

// Test the topic analysis function logic
describe("Topic Analysis", () => {
  // Topic keywords mapping (same as in routers.ts)
  const topicKeywords: Record<string, string[]> = {
    "love": ["恋愛", "彼氏", "彼女", "好きな人", "片思い", "告白", "デート", "恋", "love", "boyfriend", "girlfriend", "crush", "dating", "出会い", "マッチング"],
    "marriage": ["結婚", "婚活", "婚約", "プロポーズ", "入籍", "嫁", "marriage", "wedding", "proposal", "夫婦", "酎婚"],
    "work": ["仕事", "職場", "上司", "同僚", "残業", "パワハラ", "work", "job", "office", "boss", "colleague", "会社", "業務"],
    "career": ["キャリア", "転職", "就職", "昇進", "独立", "起業", "career", "job change", "promotion", "退職", "復職"],
    "money": ["お金", "金運", "収入", "財運", "投資", "借金", "money", "finance", "income", "investment", "貯金", "給料"],
    "health": ["健康", "病気", "体調", "ダイエット", "運動", "疲れ", "health", "illness", "diet", "exercise", "メンタル", "精神"],
    "family": ["家族", "親", "子供", "兄弟", "姉妹", "介護", "family", "parents", "children", "siblings", "祖父母", "親子"],
    "relationships": ["人間関係", "友人", "付き合い", "トラブル", "喧嘩", "relationship", "friend", "conflict", "近所", "ママ友"],
    "future": ["将来", "未来", "進路", "人生", "運命", "future", "destiny", "life path", "これから", "先行き"],
    "decision": ["決断", "選択", "迷って", "どうすれば", "悩んで", "decision", "choice", "should I", "迷い", "決められない"],
    "spiritual": ["スピリチュアル", "魂", "前世", "守護霊", "オーラ", "spiritual", "soul", "past life", "エネルギー", "波動"],
  };

  function analyzeMessageTopic(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          return topic;
        }
      }
    }
    
    return "other";
  }

  it("should detect love topic from Japanese keywords", () => {
    expect(analyzeMessageTopic("彼氏との関係について相談したいです")).toBe("love");
    expect(analyzeMessageTopic("片思いの人がいます")).toBe("love");
    expect(analyzeMessageTopic("恋愛運を見てください")).toBe("love");
  });

  it("should detect love topic from English keywords", () => {
    expect(analyzeMessageTopic("I want to ask about my boyfriend")).toBe("love");
    expect(analyzeMessageTopic("Dating advice please")).toBe("love");
  });

  it("should detect work topic", () => {
    expect(analyzeMessageTopic("仕事の悩みがあります")).toBe("work");
    expect(analyzeMessageTopic("上司との関係が難しい")).toBe("work");
    expect(analyzeMessageTopic("職場でのストレス")).toBe("work");
  });

  it("should detect career topic", () => {
    expect(analyzeMessageTopic("転職を考えています")).toBe("career");
    expect(analyzeMessageTopic("キャリアアップしたい")).toBe("career");
    expect(analyzeMessageTopic("起業について相談")).toBe("career");
  });

  it("should detect money topic", () => {
    expect(analyzeMessageTopic("金運を上げたい")).toBe("money");
    expect(analyzeMessageTopic("投資について相談")).toBe("money");
    expect(analyzeMessageTopic("お金の悩み")).toBe("money");
  });

  it("should detect health topic", () => {
    expect(analyzeMessageTopic("健康運を見てください")).toBe("health");
    expect(analyzeMessageTopic("体調が優れません")).toBe("health");
    expect(analyzeMessageTopic("ダイエットについて")).toBe("health");
  });

  it("should detect family topic", () => {
    expect(analyzeMessageTopic("家族との関係")).toBe("family");
    expect(analyzeMessageTopic("親との問題")).toBe("family");
    expect(analyzeMessageTopic("子供の将来")).toBe("family");
  });

  it("should detect relationships topic", () => {
    expect(analyzeMessageTopic("人間関係の悩み")).toBe("relationships");
    expect(analyzeMessageTopic("友人とのトラブル")).toBe("relationships");
  });

  it("should detect future topic", () => {
    expect(analyzeMessageTopic("将来が不安")).toBe("future");
    expect(analyzeMessageTopic("運命を知りたい")).toBe("future");
    expect(analyzeMessageTopic("人生の方向性")).toBe("future");
  });

  it("should detect decision topic", () => {
    expect(analyzeMessageTopic("決断できません")).toBe("decision");
    expect(analyzeMessageTopic("どうすればいいですか")).toBe("decision");
    expect(analyzeMessageTopic("選択に迷っています")).toBe("decision");
  });

  it("should detect spiritual topic", () => {
    expect(analyzeMessageTopic("前世について知りたい")).toBe("spiritual");
    expect(analyzeMessageTopic("オーラを見てください")).toBe("spiritual");
    expect(analyzeMessageTopic("スピリチュアルな相談")).toBe("spiritual");
  });

  it("should return other for unmatched messages", () => {
    expect(analyzeMessageTopic("こんにちは")).toBe("other");
    expect(analyzeMessageTopic("ありがとうございます")).toBe("other");
    expect(analyzeMessageTopic("Hello")).toBe("other");
  });
});

// Test the oracle recommendation detection logic
describe("Oracle Recommendation Detection", () => {
  const oraclePatterns: Record<string, RegExp[]> = {
    "soma": [/蒼真/g, /souma/gi, /時の読み手/g],
    "reiran": [/玖蘭/g, /reiran/gi, /恋愛の専門/g],
    "sakuya": [/朔夜/g, /sakuya/gi, /数秘術/g, /タロット/g],
    "akari": [/灯/g, /akari/gi, /ポジティブ/g],
    "yui": [/結衣/g, /yui/gi, /夢/g, /インスピレーション/g],
    "gen": [/玄/g, /gen/gi, /哲学/g, /古代の知恵/g],
    "shion": [/紫苑/g, /shion/gi, /手相/g],
    "seiran": [/星蘭/g, /seiran/gi, /西洋占星術/g, /星の配置/g],
  };

  const recommendationPhrases = [
    /おすすめ/g,
    /相談してみて/g,
    /得意です/g,
    /専門/g,
    /話を聞いてもら/g,
    /訪ねてみて/g,
  ];

  function detectOracleRecommendation(response: string): string | null {
    const hasRecommendation = recommendationPhrases.some(pattern => pattern.test(response));
    if (!hasRecommendation) return null;
    
    for (const [oracleId, patterns] of Object.entries(oraclePatterns)) {
      for (const pattern of patterns) {
        if (pattern.test(response)) {
          return oracleId;
        }
      }
    }
    
    return null;
  }

  it("should detect recommendation to Reiran for love topics", () => {
    const response = "恋愛の相談は玖蘭先生がおすすめです";
    expect(detectOracleRecommendation(response)).toBe("reiran");
  });

  it("should detect recommendation to Shion for palm reading", () => {
    const response = "手相を見てもらうなら紫苑先生に相談してみてください";
    expect(detectOracleRecommendation(response)).toBe("shion");
  });

  it("should detect recommendation to Sakuya for tarot", () => {
    const response = "タロットで詳しく見るなら朔夜先生が得意です";
    expect(detectOracleRecommendation(response)).toBe("sakuya");
  });

  it("should detect recommendation to Seiran for astrology", () => {
    const response = "西洋占星術の専門家である星蘭先生に訪ねてみてください";
    expect(detectOracleRecommendation(response)).toBe("seiran");
  });

  it("should return null when no recommendation phrase is present", () => {
    const response = "あなたの運勢は良好です。玖蘭先生も同じ意見でしょう。";
    expect(detectOracleRecommendation(response)).toBe(null);
  });

  it("should return null when no oracle is mentioned", () => {
    const response = "他の占い師にも相談してみてください";
    expect(detectOracleRecommendation(response)).toBe(null);
  });
});

// Test the recommendation reason generation logic
describe("Recommendation Reason Generation", () => {
  const oracleSpecialties: Record<string, string[]> = {
    "soma": ["timing", "future", "decision"],
    "reiran": ["love", "marriage", "relationships"],
    "sakuya": ["decision", "career", "money"],
    "akari": ["spiritual", "health", "relationships"],
    "yui": ["future", "spiritual", "career"],
    "gen": ["spiritual", "future", "decision"],
    "shion": ["health", "future", "spiritual"],
    "seiran": ["future", "love", "career"],
  };

  function getRecommendationReason(oracleId: string, topic: string): string {
    const specialties = oracleSpecialties[oracleId] || [];
    
    if (specialties.includes(topic)) {
      const topicLabels: Record<string, string> = {
        love: "恋愛",
        marriage: "結婚",
        work: "仕事",
        career: "キャリア",
        money: "金運",
        health: "健康",
        family: "家族",
        relationships: "人間関係",
        future: "将来",
        decision: "決断",
        spiritual: "スピリチュアル",
      };
      return `${topicLabels[topic] || topic}の相談に強い占い師です`;
    }
    
    return "あなたにおすすめの占い師です";
  }

  it("should generate reason for matching specialty", () => {
    expect(getRecommendationReason("reiran", "love")).toBe("恋愛の相談に強い占い師です");
    expect(getRecommendationReason("sakuya", "career")).toBe("キャリアの相談に強い占い師です");
    expect(getRecommendationReason("shion", "health")).toBe("健康の相談に強い占い師です");
  });

  it("should generate default reason for non-matching specialty", () => {
    expect(getRecommendationReason("soma", "love")).toBe("あなたにおすすめの占い師です");
    expect(getRecommendationReason("gen", "money")).toBe("あなたにおすすめの占い師です");
  });
});
