/**
 * 占術計算エンジン
 * 六獣・干支・五行の計算を行う
 */

// ============================================================
// 定数定義
// ============================================================

/** 十天干 */
const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

/** 十二地支 */
const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;

/** 六獣 */
const SIX_BEASTS = [
  "青龍",
  "朱雀",
  "勾陳",
  "螣蛇",
  "白虎",
  "玄武",
] as const;

/** 五行 */
const FIVE_ELEMENTS = ["木", "火", "土", "金", "水"] as const;

/** 天干→五行マッピング */
const STEM_TO_ELEMENT: Record<string, string> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

/** 地支→五行マッピング */
const BRANCH_TO_ELEMENT: Record<string, string> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

/** 五行相生関係 */
const ELEMENT_GENERATES: Record<string, string> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

/** 五行相剋関係 */
const ELEMENT_OVERCOMES: Record<string, string> = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火",
};

/** 天干→六獣の起始位置 (日干から六獣の配置を決定) */
const STEM_TO_BEAST_START: Record<string, number> = {
  甲: 0, // 青龍
  乙: 0, // 青龍
  丙: 1, // 朱雀
  丁: 1, // 朱雀
  戊: 2, // 勾陳
  己: 2, // 勾陳
  庚: 4, // 白虎
  辛: 4, // 白虎
  壬: 5, // 玄武
  癸: 5, // 玄武
};

/** 五行の性格特性 */
const ELEMENT_PERSONALITY: Record<string, string> = {
  木: "成長と向上心に溢れ、正義感が強い。リーダーシップがあり、新しいことに挑戦する気概がある。やや頑固な一面もあるが、まっすぐな性格。",
  火: "情熱的で明るく、社交的。周囲を照らす太陽のような存在。直感が鋭く、行動力がある。感情の起伏が激しい面もあるが、愛情深い。",
  土: "穏やかで信頼感があり、面倒見が良い。安定を重んじ、周囲に安心感を与える。忍耐強く実直だが、変化を恐れる傾向がある。",
  金: "意志が強く、決断力がある。正確さと美しさを追求する完璧主義者。繊細な感性を持つが、時に融通が利かないことも。",
  水: "知性と適応力に優れ、柔軟な発想ができる。洞察力が深く、人の心を読むのが得意。優しいが、流されやすい面もある。",
};

// ============================================================
// 干支計算
// ============================================================

/**
 * 年柱の天干地支を算出
 * 基準: 西暦4年 = 甲子年
 */
export function getYearPillar(year: number) {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const stem =
    HEAVENLY_STEMS[((stemIndex % 10) + 10) % 10];
  const branch =
    EARTHLY_BRANCHES[((branchIndex % 12) + 12) % 12];
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    element: STEM_TO_ELEMENT[stem],
  };
}

/**
 * 月柱の天干地支を算出（簡易版）
 * 月の地支は固定（寅月=1月, 卯月=2月, ...）
 * 月の天干は年干から算出
 */
export function getMonthPillar(year: number, month: number) {
  // 旧暦では1月=寅月なので、monthに+2のオフセット
  const branchIndex = (month + 1) % 12;
  const branch = EARTHLY_BRANCHES[branchIndex];

  // 年干から月干を算出する五虎遁法
  const yearStemIndex = (year - 4) % 10;
  const adjustedYearStem = ((yearStemIndex % 10) + 10) % 10;
  const monthStemStart = (adjustedYearStem % 5) * 2;
  const stemIndex = (monthStemStart + month - 1) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];

  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    element: STEM_TO_ELEMENT[stem],
  };
}

/**
 * 日柱の天干地支を算出（簡易版）
 * 基準日: 1900年1月1日 = 甲戌日 (天干0, 地支10 → 干支番号10)
 */
export function getDayPillar(year: number, month: number, day: number) {
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor(
    (targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // 1900/1/1 = 甲戌 → 干支序数10 (甲=0, 戌=10 mod 12 = 10)
  const stemIndex = ((diffDays % 10) + 10) % 10;
  const branchIndex = (((diffDays + 10) % 12) + 12) % 12;

  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];

  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    element: STEM_TO_ELEMENT[stem],
  };
}

// ============================================================
// 六獣計算
// ============================================================

/**
 * 日干から六獣を算出
 */
export function getSixBeast(dayStem: string): string {
  const startIndex = STEM_TO_BEAST_START[dayStem] ?? 0;
  return SIX_BEASTS[startIndex];
}

// ============================================================
// 五行計算
// ============================================================

/**
 * 四柱の五行バランスを算出
 */
export function calculateFiveElements(
  yearPillar: { heavenlyStem: string; earthlyBranch: string },
  monthPillar: { heavenlyStem: string; earthlyBranch: string },
  dayPillar: { heavenlyStem: string; earthlyBranch: string }
): Record<string, number> {
  const counts: Record<string, number> = {
    木: 0,
    火: 0,
    土: 0,
    金: 0,
    水: 0,
  };

  const pillars = [yearPillar, monthPillar, dayPillar];
  for (const pillar of pillars) {
    const stemElement = STEM_TO_ELEMENT[pillar.heavenlyStem];
    const branchElement = BRANCH_TO_ELEMENT[pillar.earthlyBranch];
    if (stemElement) counts[stemElement]++;
    if (branchElement) counts[branchElement]++;
  }

  return counts;
}

/**
 * 最も強い五行を返す
 */
export function getDominantElement(
  elements: Record<string, number>
): string {
  let maxCount = 0;
  let dominant = "木";
  for (const [element, count] of Object.entries(elements)) {
    if (count > maxCount) {
      maxCount = count;
      dominant = element;
    }
  }
  return dominant;
}

// ============================================================
// 相性計算
// ============================================================

/**
 * 二人の五行相性を計算
 */
export function calculateCompatibility(
  element1: string,
  element2: string
): { score: number; relation: string; description: string } {
  if (element1 === element2) {
    return {
      score: 75,
      relation: "比和",
      description: `同じ「${element1}」の気を持つ二人。理解し合える反面、似すぎて刺激に欠けることも。互いの個性を尊重することで、穏やかで安定した関係を築けます。`,
    };
  }

  if (ELEMENT_GENERATES[element1] === element2) {
    return {
      score: 90,
      relation: "相生（生じる側）",
      description: `「${element1}」が「${element2}」を生み出す関係。あなたが相手を育て、支える相性です。自然な流れで相手を成長させる力があります。与えることを喜びに変えられる素晴らしい縁です。`,
    };
  }

  if (ELEMENT_GENERATES[element2] === element1) {
    return {
      score: 85,
      relation: "相生（生じられる側）",
      description: `「${element2}」が「${element1}」を生み出す関係。相手から多くのものを受け取れる相性です。感謝の気持ちを忘れずにいれば、互いに高め合える関係になります。`,
    };
  }

  if (ELEMENT_OVERCOMES[element1] === element2) {
    return {
      score: 55,
      relation: "相剋（剋す側）",
      description: `「${element1}」が「${element2}」を剋す関係。あなたが主導権を握りやすい反面、相手に圧を感じさせることも。適度な距離感と思いやりが大切です。`,
    };
  }

  if (ELEMENT_OVERCOMES[element2] === element1) {
    return {
      score: 50,
      relation: "相剋（剋される側）",
      description: `「${element2}」が「${element1}」を剋す関係。相手のペースに巻き込まれやすい面がありますが、それが成長の糧にもなります。自分の軸をしっかり持つことが開運の鍵です。`,
    };
  }

  return {
    score: 70,
    relation: "中庸",
    description: "穏やかな関係です。互いに無理なく付き合える相性と言えます。",
  };
}

// ============================================================
// 総合鑑定
// ============================================================

/**
 * 生年月日から総合的な鑑定結果を算出
 */
export function getFortuneReading(birthDate: Date) {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();

  const yearPillar = getYearPillar(year);
  const monthPillar = getMonthPillar(year, month);
  const dayPillar = getDayPillar(year, month, day);

  const fiveElements = calculateFiveElements(yearPillar, monthPillar, dayPillar);
  const dominantElement = getDominantElement(fiveElements);
  const sixBeast = getSixBeast(dayPillar.heavenlyStem);
  const personality = ELEMENT_PERSONALITY[dominantElement] ?? "";

  return {
    yearPillar,
    monthPillar,
    dayPillar,
    sixBeast,
    fiveElements,
    dominantElement,
    personality,
  };
}

/**
 * 占い用のコンテキスト文字列を生成（AIプロンプトに含める用）
 */
export function generateFortuneContext(birthDate: Date): string {
  const reading = getFortuneReading(birthDate);

  return `【鑑定対象者の命式情報】
年柱: ${reading.yearPillar.heavenlyStem}${reading.yearPillar.earthlyBranch}（${reading.yearPillar.element}）
月柱: ${reading.monthPillar.heavenlyStem}${reading.monthPillar.earthlyBranch}（${reading.monthPillar.element}）
日柱: ${reading.dayPillar.heavenlyStem}${reading.dayPillar.earthlyBranch}（${reading.dayPillar.element}）
六獣: ${reading.sixBeast}
五行バランス: 木${reading.fiveElements["木"]} 火${reading.fiveElements["火"]} 土${reading.fiveElements["土"]} 金${reading.fiveElements["金"]} 水${reading.fiveElements["水"]}
主要五行: ${reading.dominantElement}
性格傾向: ${reading.personality}`;
}

export { FIVE_ELEMENTS, SIX_BEASTS, HEAVENLY_STEMS, EARTHLY_BRANCHES };
