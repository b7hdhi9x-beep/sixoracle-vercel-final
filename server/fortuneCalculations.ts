/**
 * 占術データの非公開プロンプト化
 * ChatGPTでは再現できない、サーバー側で計算する占術ロジック
 * 
 * 六神（六獣）：青龍・朱雀・勾陳・螣蛇・白虎・玄武
 * 干支：十干（甲乙丙丁戊己庚辛壬癸）と十二支（子丑寅卯辰巳午未申酉戌亥）
 */

// 十干（天干）
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
type TianGan = typeof TIAN_GAN[number];

// 十二支（地支）
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;
type DiZhi = typeof DI_ZHI[number];

// 六神（六獣）
const LIU_SHEN = ['青龍', '朱雀', '勾陳', '螣蛇', '白虎', '玄武'] as const;
type LiuShen = typeof LIU_SHEN[number];

// 五行
const WU_XING = ['木', '火', '土', '金', '水'] as const;
type WuXing = typeof WU_XING[number];

// 十干と五行の対応
const TIAN_GAN_WU_XING: Record<TianGan, WuXing> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 十二支と五行の対応
const DI_ZHI_WU_XING: Record<DiZhi, WuXing> = {
  '寅': '木', '卯': '木',
  '巳': '火', '午': '火',
  '辰': '土', '戌': '土', '丑': '土', '未': '土',
  '申': '金', '酉': '金',
  '亥': '水', '子': '水',
};

// 六神の意味と吉凶
const LIU_SHEN_MEANINGS: Record<LiuShen, {
  meaning: string;
  element: WuXing;
  direction: string;
  fortune: string;
  advice: string;
}> = {
  '青龍': {
    meaning: '吉祥・繁栄・成功',
    element: '木',
    direction: '東',
    fortune: '大吉。新しい始まりに最適。仕事運・金運が上昇。',
    advice: '積極的に行動すべき時。チャンスを逃さず、前に進みましょう。',
  },
  '朱雀': {
    meaning: '文書・口舌・情報',
    element: '火',
    direction: '南',
    fortune: '吉凶混合。言葉に注意が必要。コミュニケーションが鍵。',
    advice: '言葉を慎重に選びましょう。誤解を招きやすい時期です。',
  },
  '勾陳': {
    meaning: '停滞・遅延・慎重',
    element: '土',
    direction: '中央',
    fortune: '小凶。物事が思うように進まない。忍耐が必要。',
    advice: '焦らず待つことが大切。今は準備期間と考えましょう。',
  },
  '螣蛇': {
    meaning: '変化・驚き・不安定',
    element: '土',
    direction: '中央',
    fortune: '凶。予期せぬ変化や驚きがある。精神的な不安定さ。',
    advice: '心を落ち着けて。変化を恐れず、柔軟に対応しましょう。',
  },
  '白虎': {
    meaning: '闘争・損失・別離',
    element: '金',
    direction: '西',
    fortune: '凶。争いや損失に注意。血縁関係にも影響。',
    advice: '争いを避け、穏やかに過ごすことを心がけましょう。',
  },
  '玄武': {
    meaning: '陰謀・秘密・盗難',
    element: '水',
    direction: '北',
    fortune: '凶。秘密や裏切りに注意。信頼できる人を見極めて。',
    advice: '人を信じすぎないこと。大切なものは守りましょう。',
  },
};

// 基準日（1900年1月31日は庚子の日）
const BASE_DATE = new Date(1900, 0, 31);
const BASE_TIAN_GAN_INDEX = 6; // 庚
const BASE_DI_ZHI_INDEX = 0; // 子

/**
 * 日付から日干支を計算
 */
export function getDailyGanZhi(date: Date): { tianGan: TianGan; diZhi: DiZhi; ganZhi: string } {
  const diffDays = Math.floor((date.getTime() - BASE_DATE.getTime()) / (1000 * 60 * 60 * 24));
  
  const tianGanIndex = (BASE_TIAN_GAN_INDEX + diffDays) % 10;
  const diZhiIndex = (BASE_DI_ZHI_INDEX + diffDays) % 12;
  
  // 負の数の場合の処理
  const adjustedTianGanIndex = tianGanIndex < 0 ? tianGanIndex + 10 : tianGanIndex;
  const adjustedDiZhiIndex = diZhiIndex < 0 ? diZhiIndex + 12 : diZhiIndex;
  
  const tianGan = TIAN_GAN[adjustedTianGanIndex];
  const diZhi = DI_ZHI[adjustedDiZhiIndex];
  
  return {
    tianGan,
    diZhi,
    ganZhi: `${tianGan}${diZhi}`,
  };
}

/**
 * 日干から今日の六神を計算
 * 六神は日干によって配置が変わる
 */
export function getDailyLiuShen(date: Date): {
  mainLiuShen: LiuShen;
  allLiuShen: { position: number; liuShen: LiuShen; meaning: typeof LIU_SHEN_MEANINGS[LiuShen] }[];
} {
  const { tianGan } = getDailyGanZhi(date);
  
  // 日干による六神の起点
  // 甲乙日：青龍から始まる
  // 丙丁日：朱雀から始まる
  // 戊日：勾陳から始まる
  // 己日：螣蛇から始まる
  // 庚辛日：白虎から始まる
  // 壬癸日：玄武から始まる
  
  let startIndex: number;
  switch (tianGan) {
    case '甲':
    case '乙':
      startIndex = 0; // 青龍
      break;
    case '丙':
    case '丁':
      startIndex = 1; // 朱雀
      break;
    case '戊':
      startIndex = 2; // 勾陳
      break;
    case '己':
      startIndex = 3; // 螣蛇
      break;
    case '庚':
    case '辛':
      startIndex = 4; // 白虎
      break;
    case '壬':
    case '癸':
      startIndex = 5; // 玄武
      break;
    default:
      startIndex = 0;
  }
  
  const mainLiuShen = LIU_SHEN[startIndex];
  
  const allLiuShen = LIU_SHEN.map((_, i) => {
    const liuShenIndex = (startIndex + i) % 6;
    const liuShen = LIU_SHEN[liuShenIndex];
    return {
      position: i + 1,
      liuShen,
      meaning: LIU_SHEN_MEANINGS[liuShen],
    };
  });
  
  return {
    mainLiuShen,
    allLiuShen,
  };
}

/**
 * 生年月日から命式（四柱）を計算
 */
export function getBirthChart(birthDate: Date): {
  yearPillar: { tianGan: TianGan; diZhi: DiZhi };
  monthPillar: { tianGan: TianGan; diZhi: DiZhi };
  dayPillar: { tianGan: TianGan; diZhi: DiZhi };
  mainElement: WuXing;
  personality: string;
  strengths: string[];
  weaknesses: string[];
} {
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  
  // 年柱の計算（1984年は甲子年を基準）
  const yearDiff = year - 1984;
  const yearTianGanIndex = (yearDiff % 10 + 10) % 10;
  const yearDiZhiIndex = (yearDiff % 12 + 12) % 12;
  
  // 月柱の計算（簡略化）
  const monthDiZhiIndex = (month + 1) % 12; // 寅月（2月）から始まる
  const monthTianGanIndex = (yearTianGanIndex * 2 + month) % 10;
  
  // 日柱の計算
  const { tianGan: dayTianGan, diZhi: dayDiZhi } = getDailyGanZhi(birthDate);
  
  const yearPillar = {
    tianGan: TIAN_GAN[yearTianGanIndex],
    diZhi: DI_ZHI[yearDiZhiIndex],
  };
  
  const monthPillar = {
    tianGan: TIAN_GAN[monthTianGanIndex],
    diZhi: DI_ZHI[monthDiZhiIndex],
  };
  
  const dayPillar = {
    tianGan: dayTianGan,
    diZhi: dayDiZhi,
  };
  
  // 日干から主要な五行を決定
  const mainElement = TIAN_GAN_WU_XING[dayTianGan];
  
  // 五行による性格分析
  const personalityByElement: Record<WuXing, {
    personality: string;
    strengths: string[];
    weaknesses: string[];
  }> = {
    '木': {
      personality: '成長と発展を象徴する木の気質。創造性と向上心に溢れ、常に新しいことに挑戦する精神を持つ。',
      strengths: ['創造力', '向上心', '優しさ', '柔軟性'],
      weaknesses: ['優柔不断', '感情的になりやすい', '頑固な一面'],
    },
    '火': {
      personality: '情熱と活力を象徴する火の気質。明るく社交的で、人を惹きつけるカリスマ性を持つ。',
      strengths: ['情熱', 'リーダーシップ', '社交性', '決断力'],
      weaknesses: ['短気', '衝動的', '飽きっぽい'],
    },
    '土': {
      personality: '安定と信頼を象徴する土の気質。堅実で誠実、周囲から頼られる存在。',
      strengths: ['誠実さ', '忍耐力', '信頼性', '包容力'],
      weaknesses: ['頑固', '変化を嫌う', '心配性'],
    },
    '金': {
      personality: '正義と決断を象徴する金の気質。意志が強く、目標に向かって突き進む力を持つ。',
      strengths: ['決断力', '正義感', '集中力', '実行力'],
      weaknesses: ['融通が利かない', '冷たく見られる', '完璧主義'],
    },
    '水': {
      personality: '知恵と適応を象徴する水の気質。聡明で洞察力があり、どんな状況にも適応できる。',
      strengths: ['知性', '適応力', '直感力', '冷静さ'],
      weaknesses: ['優柔不断', '心配性', '秘密主義'],
    },
  };
  
  const elementData = personalityByElement[mainElement];
  
  return {
    yearPillar,
    monthPillar,
    dayPillar,
    mainElement,
    personality: elementData.personality,
    strengths: elementData.strengths,
    weaknesses: elementData.weaknesses,
  };
}

/**
 * 今日の運勢を総合的に計算
 */
export function getTodayFortune(birthDate?: Date): {
  date: string;
  ganZhi: string;
  mainLiuShen: LiuShen;
  liuShenMeaning: typeof LIU_SHEN_MEANINGS[LiuShen];
  overallFortune: string;
  loveAdvice: string;
  workAdvice: string;
  healthAdvice: string;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  personalAnalysis?: {
    mainElement: WuXing;
    personality: string;
    todayCompatibility: string;
  };
} {
  const today = new Date();
  const { ganZhi, tianGan } = getDailyGanZhi(today);
  const { mainLiuShen, allLiuShen } = getDailyLiuShen(today);
  const liuShenMeaning = LIU_SHEN_MEANINGS[mainLiuShen];
  
  // 日干から今日のラッキーカラーを決定
  const luckyColors: Record<WuXing, string> = {
    '木': '緑・青',
    '火': '赤・オレンジ',
    '土': '黄・茶',
    '金': '白・金',
    '水': '黒・紺',
  };
  
  const todayElement = TIAN_GAN_WU_XING[tianGan];
  const luckyColor = luckyColors[todayElement];
  
  // ラッキーナンバー（日干のインデックス + 1）
  const luckyNumber = (TIAN_GAN.indexOf(tianGan) + 1);
  
  // ラッキー方位
  const luckyDirection = liuShenMeaning.direction;
  
  // 六神に基づくアドバイス
  const adviceByLiuShen: Record<LiuShen, {
    love: string;
    work: string;
    health: string;
  }> = {
    '青龍': {
      love: '恋愛運上昇中。積極的なアプローチが吉。新しい出会いにも期待。',
      work: '仕事運好調。新規プロジェクトの開始に最適。上司からの評価も上がる。',
      health: '活力に満ちた一日。運動を取り入れると更に良い。',
    },
    '朱雀': {
      love: 'コミュニケーションが鍵。言葉を慎重に選んで。誤解に注意。',
      work: '会議やプレゼンに注意。言葉の選び方で結果が変わる。',
      health: '喉や口内のケアを。水分補給を忘れずに。',
    },
    '勾陳': {
      love: '焦らず待つ時期。相手のペースに合わせて。',
      work: '物事が遅れがち。忍耐を持って取り組むこと。',
      health: '消化器系に注意。食事はゆっくりと。',
    },
    '螣蛇': {
      love: '予期せぬ展開あり。柔軟に対応を。',
      work: '突発的な変更に備えて。計画は余裕を持って。',
      health: '精神的なストレスに注意。リラックスを心がけて。',
    },
    '白虎': {
      love: '争いを避けて。冷静さを保つことが大切。',
      work: '競争や対立に注意。協調を心がけて。',
      health: '怪我に注意。激しい運動は控えめに。',
    },
    '玄武': {
      love: '秘密や隠し事に注意。誠実さが大切。',
      work: '情報管理を徹底。信頼できる人を見極めて。',
      health: '腎臓・膀胱系に注意。水分バランスを。',
    },
  };
  
  const advice = adviceByLiuShen[mainLiuShen];
  
  let personalAnalysis;
  if (birthDate) {
    const birthChart = getBirthChart(birthDate);
    
    // 今日の五行と生まれの五行の相性
    const compatibilityMap: Record<WuXing, Record<WuXing, string>> = {
      '木': {
        '木': '同じ木の気。共感しやすい一日。',
        '火': '木は火を生む。エネルギーが高まる。',
        '土': '木は土を剋す。積極的に行動できる。',
        '金': '金は木を剋す。少し抑圧を感じるかも。',
        '水': '水は木を生む。サポートを受けやすい。',
      },
      '火': {
        '木': '木は火を生む。情熱が増す。',
        '火': '同じ火の気。活力に満ちる。',
        '土': '火は土を生む。安定感が増す。',
        '金': '火は金を剋す。意志が強くなる。',
        '水': '水は火を剋す。冷静さが必要。',
      },
      '土': {
        '木': '木は土を剋す。変化を受け入れて。',
        '火': '火は土を生む。温かさを感じる。',
        '土': '同じ土の気。安定した一日。',
        '金': '土は金を生む。成果が出やすい。',
        '水': '土は水を剋す。コントロール力が増す。',
      },
      '金': {
        '木': '金は木を剋す。決断力が増す。',
        '火': '火は金を剋す。柔軟性が必要。',
        '土': '土は金を生む。サポートを受ける。',
        '金': '同じ金の気。意志が強まる。',
        '水': '金は水を生む。知恵が冴える。',
      },
      '水': {
        '木': '水は木を生む。成長を感じる。',
        '火': '水は火を剋す。冷静に対処できる。',
        '土': '土は水を剋す。制約を感じるかも。',
        '金': '金は水を生む。インスピレーションが湧く。',
        '水': '同じ水の気。直感が冴える。',
      },
    };
    
    personalAnalysis = {
      mainElement: birthChart.mainElement,
      personality: birthChart.personality,
      todayCompatibility: compatibilityMap[birthChart.mainElement][todayElement],
    };
  }
  
  return {
    date: today.toLocaleDateString('ja-JP'),
    ganZhi,
    mainLiuShen,
    liuShenMeaning,
    overallFortune: liuShenMeaning.fortune,
    loveAdvice: advice.love,
    workAdvice: advice.work,
    healthAdvice: advice.health,
    luckyColor,
    luckyNumber,
    luckyDirection,
    personalAnalysis,
  };
}

/**
 * 占い師に渡すための計算結果サマリーを生成
 * これがAIに渡される「非公開データ」
 */
export function getFortuneDataForOracle(birthDate?: Date): string {
  const fortune = getTodayFortune(birthDate);
  
  let summary = `【本日の占術データ（非公開計算結果）】
日付: ${fortune.date}
干支: ${fortune.ganZhi}
主宰六神: ${fortune.mainLiuShen}
六神の意味: ${fortune.liuShenMeaning.meaning}
五行: ${fortune.liuShenMeaning.element}
方位: ${fortune.liuShenMeaning.direction}

【本日の運勢】
総合運: ${fortune.overallFortune}
恋愛運: ${fortune.loveAdvice}
仕事運: ${fortune.workAdvice}
健康運: ${fortune.healthAdvice}

【ラッキーアイテム】
ラッキーカラー: ${fortune.luckyColor}
ラッキーナンバー: ${fortune.luckyNumber}
ラッキー方位: ${fortune.luckyDirection}
`;

  if (fortune.personalAnalysis) {
    summary += `
【相談者の命式分析】
主要五行: ${fortune.personalAnalysis.mainElement}
性格傾向: ${fortune.personalAnalysis.personality}
本日との相性: ${fortune.personalAnalysis.todayCompatibility}
`;
  }

  summary += `
【占い師への指示】
上記の計算結果を基に、相談者の質問に答えてください。
計算結果は占い師の「直感」や「霊視」として自然に伝えてください。
「計算」「データ」「システム」などの言葉は使わないでください。
`;

  return summary;
}

export { TIAN_GAN, DI_ZHI, LIU_SHEN, WU_XING, LIU_SHEN_MEANINGS };
