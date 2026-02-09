/**
 * 感情分析ユーティリティ
 * 占い結果のテキストから感情を分析し、音声読み上げのパラメータを調整
 */

export type EmotionType = 'positive' | 'negative' | 'neutral' | 'mystical' | 'warning';

export interface EmotionAnalysisResult {
  emotion: EmotionType;
  confidence: number; // 0-1
  keywords: string[];
}

export interface EmotionVoiceModifier {
  pitchModifier: number;  // -0.3 to +0.3
  rateModifier: number;   // -0.2 to +0.2
  volumeModifier: number; // -0.1 to +0.1
}

// ポジティブなキーワード
const POSITIVE_KEYWORDS = [
  // 幸運・成功
  '幸運', '幸せ', '成功', '達成', '実現', '叶う', '叶い', '良い', '素晴らしい',
  '輝く', '輝き', '光', '希望', '明るい', '前向き', 'チャンス', '好機', '吉',
  // 恋愛・人間関係
  '愛', '愛情', '出会い', '縁', '結ばれ', '絆', '信頼', '理解', '調和',
  // 成長・発展
  '成長', '発展', '向上', '進歩', '飛躍', '開花', '花開く', '実り',
  // 安心・安定
  '安心', '安定', '平和', '穏やか', '落ち着', '守られ', '祝福',
  // 感謝・喜び
  '感謝', '喜び', '嬉しい', '楽しい', '笑顔', '微笑み',
];

// ネガティブなキーワード
const NEGATIVE_KEYWORDS = [
  // 困難・障害
  '困難', '障害', '試練', '苦難', '苦しみ', '悩み', '不安', '心配',
  '問題', 'トラブル', '危険', 'リスク', '注意', '警戒', '凶',
  // 別れ・喪失
  '別れ', '離れ', '失う', '失い', '喪失', '終わり', '終焉',
  // 停滞・後退
  '停滞', '後退', '下降', '低迷', '衰退', '減少',
  // 感情的ネガティブ
  '悲しみ', '悲しい', '辛い', '苦い', '痛み', '傷', '涙',
  '孤独', '寂しい', '不満', '怒り', '焦り', '迷い',
];

// 神秘的なキーワード
const MYSTICAL_KEYWORDS = [
  // 占い・スピリチュアル
  '運命', '宿命', '星', '月', '太陽', '惑星', '星座', '天体',
  '神秘', '霊', 'オーラ', 'エネルギー', '波動', 'カルマ', '前世',
  // タロット・占術
  'タロット', 'カード', '数秘', '手相', '線', '夢', '無意識',
  // 時間・運命
  '時', '流れ', '転機', '分岐', '選択', '道', '扉',
  // 抽象的
  '見える', '感じる', '告げる', '囁く', '導く', '示す', '啓示',
];

// 警告のキーワード
const WARNING_KEYWORDS = [
  '注意', '警告', '気をつけ', '慎重', '用心', '控え', '避け',
  '待つ', '待ち', '今は', 'まだ', '時期尚早', '焦らず', '急がず',
];

/**
 * テキストから感情を分析
 */
export function analyzeEmotion(text: string): EmotionAnalysisResult {
  const normalizedText = text.toLowerCase();
  
  // キーワードのカウント
  const positiveMatches = POSITIVE_KEYWORDS.filter(kw => normalizedText.includes(kw));
  const negativeMatches = NEGATIVE_KEYWORDS.filter(kw => normalizedText.includes(kw));
  const mysticalMatches = MYSTICAL_KEYWORDS.filter(kw => normalizedText.includes(kw));
  const warningMatches = WARNING_KEYWORDS.filter(kw => normalizedText.includes(kw));
  
  const positiveScore = positiveMatches.length;
  const negativeScore = negativeMatches.length;
  const mysticalScore = mysticalMatches.length;
  const warningScore = warningMatches.length;
  
  const totalScore = positiveScore + negativeScore + mysticalScore + warningScore;
  
  // 感情の判定
  let emotion: EmotionType = 'neutral';
  let confidence = 0.5;
  let keywords: string[] = [];
  
  if (totalScore === 0) {
    return { emotion: 'neutral', confidence: 0.5, keywords: [] };
  }
  
  // 警告が多い場合
  if (warningScore >= 2 && warningScore >= positiveScore) {
    emotion = 'warning';
    confidence = Math.min(0.9, 0.5 + warningScore * 0.1);
    keywords = warningMatches;
  }
  // ポジティブが優勢
  else if (positiveScore > negativeScore && positiveScore >= mysticalScore) {
    emotion = 'positive';
    confidence = Math.min(0.95, 0.5 + (positiveScore - negativeScore) * 0.1);
    keywords = positiveMatches;
  }
  // ネガティブが優勢
  else if (negativeScore > positiveScore && negativeScore >= mysticalScore) {
    emotion = 'negative';
    confidence = Math.min(0.95, 0.5 + (negativeScore - positiveScore) * 0.1);
    keywords = negativeMatches;
  }
  // 神秘的が優勢
  else if (mysticalScore >= positiveScore && mysticalScore >= negativeScore) {
    emotion = 'mystical';
    confidence = Math.min(0.9, 0.5 + mysticalScore * 0.08);
    keywords = mysticalMatches;
  }
  // 混在している場合は中立
  else {
    emotion = 'neutral';
    confidence = 0.5;
    keywords = [...positiveMatches.slice(0, 2), ...negativeMatches.slice(0, 2)];
  }
  
  return { emotion, confidence, keywords };
}

/**
 * 感情に基づいて音声パラメータの修正値を取得
 */
export function getEmotionVoiceModifier(emotion: EmotionType, confidence: number): EmotionVoiceModifier {
  // 信頼度に基づいて効果を調整
  const effectStrength = Math.min(1, confidence);
  
  switch (emotion) {
    case 'positive':
      // ポジティブ：少し高めのピッチ、やや速め、明るく
      return {
        pitchModifier: 0.15 * effectStrength,
        rateModifier: 0.1 * effectStrength,
        volumeModifier: 0.05 * effectStrength,
      };
    
    case 'negative':
      // ネガティブ：低めのピッチ、ゆっくり、静かに
      return {
        pitchModifier: -0.15 * effectStrength,
        rateModifier: -0.15 * effectStrength,
        volumeModifier: -0.05 * effectStrength,
      };
    
    case 'mystical':
      // 神秘的：やや低めのピッチ、ゆっくり、神秘的な雰囲気
      return {
        pitchModifier: -0.1 * effectStrength,
        rateModifier: -0.1 * effectStrength,
        volumeModifier: 0,
      };
    
    case 'warning':
      // 警告：やや低めのピッチ、ゆっくり、はっきりと
      return {
        pitchModifier: -0.1 * effectStrength,
        rateModifier: -0.2 * effectStrength,
        volumeModifier: 0.05 * effectStrength,
      };
    
    case 'neutral':
    default:
      // 中立：変更なし
      return {
        pitchModifier: 0,
        rateModifier: 0,
        volumeModifier: 0,
      };
  }
}

/**
 * 感情分析結果に基づいて音声設定を調整
 */
export function adjustVoiceSettingsForEmotion(
  basePitch: number,
  baseRate: number,
  baseVolume: number,
  text: string
): { pitch: number; rate: number; volume: number; emotion: EmotionType } {
  const analysis = analyzeEmotion(text);
  const modifier = getEmotionVoiceModifier(analysis.emotion, analysis.confidence);
  
  // 基本設定に修正値を適用（範囲内に収める）
  const pitch = Math.max(0.5, Math.min(2.0, basePitch + modifier.pitchModifier));
  const rate = Math.max(0.5, Math.min(2.0, baseRate + modifier.rateModifier));
  const volume = Math.max(0, Math.min(1.0, baseVolume + modifier.volumeModifier));
  
  return { pitch, rate, volume, emotion: analysis.emotion };
}
