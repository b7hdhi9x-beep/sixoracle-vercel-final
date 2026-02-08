// MBTIクイックテストの質問データ

export interface MBTIQuestion {
  id: number;
  question: string;
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  optionA: {
    text: string;
    value: 'E' | 'S' | 'T' | 'J';
  };
  optionB: {
    text: string;
    value: 'I' | 'N' | 'F' | 'P';
  };
}

export const mbtiQuestions: MBTIQuestion[] = [
  // E/I (外向型/内向型) - 4問
  {
    id: 1,
    question: "パーティーや大人数の集まりの後、あなたはどう感じますか？",
    dimension: 'EI',
    optionA: { text: "エネルギーが充電された気分", value: 'E' },
    optionB: { text: "疲れて一人の時間が欲しい", value: 'I' },
  },
  {
    id: 2,
    question: "新しい人と出会うとき、あなたは？",
    dimension: 'EI',
    optionA: { text: "積極的に話しかける", value: 'E' },
    optionB: { text: "相手から話しかけられるのを待つ", value: 'I' },
  },
  {
    id: 3,
    question: "考えをまとめるとき、あなたは？",
    dimension: 'EI',
    optionA: { text: "人と話しながら考える", value: 'E' },
    optionB: { text: "一人で静かに考える", value: 'I' },
  },
  {
    id: 4,
    question: "週末の過ごし方として好ましいのは？",
    dimension: 'EI',
    optionA: { text: "友人と外出して過ごす", value: 'E' },
    optionB: { text: "家でゆっくり過ごす", value: 'I' },
  },
  
  // S/N (感覚型/直感型) - 4問
  {
    id: 5,
    question: "物事を理解するとき、あなたは？",
    dimension: 'SN',
    optionA: { text: "具体的な事実や詳細を重視する", value: 'S' },
    optionB: { text: "全体像やパターンを重視する", value: 'N' },
  },
  {
    id: 6,
    question: "説明を受けるとき、どちらが分かりやすいですか？",
    dimension: 'SN',
    optionA: { text: "具体的な例を使った説明", value: 'S' },
    optionB: { text: "概念や理論を使った説明", value: 'N' },
  },
  {
    id: 7,
    question: "仕事や作業をするとき、あなたは？",
    dimension: 'SN',
    optionA: { text: "確立された方法に従う", value: 'S' },
    optionB: { text: "新しいアイデアを試したい", value: 'N' },
  },
  {
    id: 8,
    question: "将来について考えるとき、あなたは？",
    dimension: 'SN',
    optionA: { text: "現実的で達成可能な目標を立てる", value: 'S' },
    optionB: { text: "可能性や夢を想像する", value: 'N' },
  },
  
  // T/F (思考型/感情型) - 4問
  {
    id: 9,
    question: "重要な決断をするとき、あなたは？",
    dimension: 'TF',
    optionA: { text: "論理的に分析して決める", value: 'T' },
    optionB: { text: "自分や他者の気持ちを考慮する", value: 'F' },
  },
  {
    id: 10,
    question: "友人が悩みを相談してきたとき、あなたは？",
    dimension: 'TF',
    optionA: { text: "解決策やアドバイスを提案する", value: 'T' },
    optionB: { text: "まず共感して話を聞く", value: 'F' },
  },
  {
    id: 11,
    question: "議論や意見の対立があるとき、あなたは？",
    dimension: 'TF',
    optionA: { text: "正しいことを主張する", value: 'T' },
    optionB: { text: "調和を保とうとする", value: 'F' },
  },
  {
    id: 12,
    question: "批判を受けたとき、あなたは？",
    dimension: 'TF',
    optionA: { text: "客観的に受け止めて改善点を探す", value: 'T' },
    optionB: { text: "感情的に傷つきやすい", value: 'F' },
  },
  
  // J/P (判断型/知覚型) - 4問
  {
    id: 13,
    question: "予定やスケジュールについて、あなたは？",
    dimension: 'JP',
    optionA: { text: "事前に計画を立てて行動する", value: 'J' },
    optionB: { text: "柔軟に対応して流れに任せる", value: 'P' },
  },
  {
    id: 14,
    question: "締め切りのある仕事に対して、あなたは？",
    dimension: 'JP',
    optionA: { text: "早めに終わらせたい", value: 'J' },
    optionB: { text: "ギリギリまで粘る", value: 'P' },
  },
  {
    id: 15,
    question: "旅行の計画を立てるとき、あなたは？",
    dimension: 'JP',
    optionA: { text: "詳細なスケジュールを作る", value: 'J' },
    optionB: { text: "大まかな計画だけで現地で決める", value: 'P' },
  },
  {
    id: 16,
    question: "日常生活において、あなたは？",
    dimension: 'JP',
    optionA: { text: "ルーティンや習慣を好む", value: 'J' },
    optionB: { text: "変化や新しい刺激を好む", value: 'P' },
  },
];

// MBTIタイプの説明
export interface MBTITypeInfo {
  type: string;
  name: string;
  nickname: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  compatibleTypes: string[];
  careers: string[];
}

export const mbtiTypeInfo: Record<string, MBTITypeInfo> = {
  INTJ: {
    type: 'INTJ',
    name: '建築家',
    nickname: '戦略家',
    description: '独創的で戦略的な思考を持つ完璧主義者。長期的なビジョンを持ち、目標達成のために計画的に行動します。',
    strengths: ['戦略的思考', '独立心', '決断力', '高い基準'],
    weaknesses: ['感情表現が苦手', '完璧主義', '批判的になりやすい'],
    compatibleTypes: ['ENFP', 'ENTP', 'INFJ', 'INTJ'],
    careers: ['科学者', 'エンジニア', '戦略コンサルタント', '投資家'],
  },
  INTP: {
    type: 'INTP',
    name: '論理学者',
    nickname: '思索家',
    description: '革新的で論理的な思考を持つ発明家タイプ。知識への探求心が強く、複雑な問題を解決することを楽しみます。',
    strengths: ['論理的思考', '創造性', '客観性', '知的好奇心'],
    weaknesses: ['社交が苦手', '優柔不断', '感情への無関心'],
    compatibleTypes: ['ENTJ', 'ENFJ', 'INFP', 'INTP'],
    careers: ['研究者', 'プログラマー', '哲学者', '数学者'],
  },
  ENTJ: {
    type: 'ENTJ',
    name: '指揮官',
    nickname: 'リーダー',
    description: '大胆で想像力豊かなリーダー。効率性を重視し、目標達成のためにチームを導く力を持っています。',
    strengths: ['リーダーシップ', '効率性', '自信', '戦略的思考'],
    weaknesses: ['支配的', '感情への無関心', '短気'],
    compatibleTypes: ['INFP', 'INTP', 'ENFJ', 'ENTJ'],
    careers: ['経営者', '弁護士', '政治家', 'コンサルタント'],
  },
  ENTP: {
    type: 'ENTP',
    name: '討論者',
    nickname: '発明家',
    description: '賢くて好奇心旺盛な思考家。新しいアイデアを生み出し、知的な議論を楽しみます。',
    strengths: ['創造性', '知的好奇心', '適応力', 'ユーモア'],
    weaknesses: ['議論好き', '集中力の欠如', 'ルール嫌い'],
    compatibleTypes: ['INFJ', 'INTJ', 'ENFP', 'ENTP'],
    careers: ['起業家', '発明家', 'ジャーナリスト', 'マーケター'],
  },
  INFJ: {
    type: 'INFJ',
    name: '提唱者',
    nickname: '理想主義者',
    description: '静かで神秘的、しかし非常に鼓舞的で疲れを知らない理想主義者。人々を助けることに深い喜びを感じます。',
    strengths: ['洞察力', '創造性', '決断力', '情熱'],
    weaknesses: ['完璧主義', '燃え尽きやすい', '批判に敏感'],
    compatibleTypes: ['ENFP', 'ENTP', 'INFJ', 'INTJ'],
    careers: ['カウンセラー', '作家', '心理学者', '教師'],
  },
  INFP: {
    type: 'INFP',
    name: '仲介者',
    nickname: '詩人',
    description: '詩的で親切な利他主義者。常に善を見出そうとし、人々や状況を良くするために行動します。',
    strengths: ['共感力', '創造性', '情熱', '誠実さ'],
    weaknesses: ['非現実的', '自己批判', '孤立しやすい'],
    compatibleTypes: ['ENFJ', 'ENTJ', 'INFP', 'ISFP'],
    careers: ['作家', 'アーティスト', 'カウンセラー', '社会活動家'],
  },
  ENFJ: {
    type: 'ENFJ',
    name: '主人公',
    nickname: '教師',
    description: 'カリスマ的で鼓舞的なリーダー。人々を魅了し、導く自然な能力を持っています。',
    strengths: ['カリスマ性', '共感力', '信頼性', 'リーダーシップ'],
    weaknesses: ['過度に理想主義', '自己犠牲的', '批判に敏感'],
    compatibleTypes: ['INFP', 'INTP', 'ENFJ', 'ISFP'],
    careers: ['教師', 'コーチ', '人事', 'カウンセラー'],
  },
  ENFP: {
    type: 'ENFP',
    name: '運動家',
    nickname: 'チャンピオン',
    description: '熱心で創造的、社交的な自由人。常に笑顔の理由を見つけることができます。',
    strengths: ['熱意', '創造性', '社交性', '適応力'],
    weaknesses: ['集中力の欠如', '過度に楽観的', '計画性の欠如'],
    compatibleTypes: ['INFJ', 'INTJ', 'ENFP', 'INFP'],
    careers: ['ジャーナリスト', 'アーティスト', 'コンサルタント', '起業家'],
  },
  ISTJ: {
    type: 'ISTJ',
    name: '管理者',
    nickname: '検査官',
    description: '実用的で事実に基づいた思考を持つ人。信頼性と責任感が非常に高いです。',
    strengths: ['誠実さ', '責任感', '忍耐力', '実用性'],
    weaknesses: ['頑固', '変化を嫌う', '感情表現が苦手'],
    compatibleTypes: ['ESFP', 'ESTP', 'ISTJ', 'ISFJ'],
    careers: ['会計士', '管理職', '法律家', '軍人'],
  },
  ISFJ: {
    type: 'ISFJ',
    name: '擁護者',
    nickname: '保護者',
    description: '非常に献身的で温かい保護者。愛する人々を守るために常に準備ができています。',
    strengths: ['支援的', '信頼性', '忍耐力', '観察力'],
    weaknesses: ['過度に謙虚', '変化を嫌う', '自己犠牲的'],
    compatibleTypes: ['ESFP', 'ESTP', 'ISFJ', 'ISTJ'],
    careers: ['看護師', '教師', '社会福祉士', '管理職'],
  },
  ESTJ: {
    type: 'ESTJ',
    name: '幹部',
    nickname: '監督者',
    description: '優れた管理者。物事を管理し、秩序を維持する能力に長けています。',
    strengths: ['組織力', 'リーダーシップ', '誠実さ', '決断力'],
    weaknesses: ['頑固', '柔軟性の欠如', '感情への無関心'],
    compatibleTypes: ['ISFP', 'ISTP', 'ESTJ', 'ESFJ'],
    careers: ['経営者', '管理職', '軍人', '裁判官'],
  },
  ESFJ: {
    type: 'ESFJ',
    name: '領事',
    nickname: '世話役',
    description: '非常に思いやりがあり、社交的で人気者。常に人々を助けることに熱心です。',
    strengths: ['思いやり', '社交性', '信頼性', '協調性'],
    weaknesses: ['承認欲求', '批判に敏感', '変化を嫌う'],
    compatibleTypes: ['ISFP', 'ISTP', 'ESFJ', 'ESTJ'],
    careers: ['看護師', '教師', 'イベントプランナー', '人事'],
  },
  ISTP: {
    type: 'ISTP',
    name: '巨匠',
    nickname: '職人',
    description: '大胆で実践的な実験者。あらゆる種類の道具を使いこなすことに長けています。',
    strengths: ['実用性', '創造性', '冷静さ', '適応力'],
    weaknesses: ['感情表現が苦手', '無関心', 'リスクを取りすぎる'],
    compatibleTypes: ['ESFJ', 'ESTJ', 'ISTP', 'ISFP'],
    careers: ['エンジニア', '整備士', 'パイロット', 'アスリート'],
  },
  ISFP: {
    type: 'ISFP',
    name: '冒険家',
    nickname: '芸術家',
    description: '柔軟で魅力的なアーティスト。常に新しい経験を探求する準備ができています。',
    strengths: ['創造性', '感受性', '好奇心', '情熱'],
    weaknesses: ['計画性の欠如', '競争を嫌う', '予測不能'],
    compatibleTypes: ['ENFJ', 'ESFJ', 'ISFP', 'ESFP'],
    careers: ['アーティスト', 'デザイナー', '獣医', 'シェフ'],
  },
  ESTP: {
    type: 'ESTP',
    name: '起業家',
    nickname: '推進者',
    description: 'スマートでエネルギッシュ、非常に知覚的な人。危険を冒すことを楽しみます。',
    strengths: ['エネルギッシュ', '実用性', '観察力', '社交性'],
    weaknesses: ['短気', '計画性の欠如', 'ルール嫌い'],
    compatibleTypes: ['ISFJ', 'ISTJ', 'ESTP', 'ESFP'],
    careers: ['起業家', '営業', 'アスリート', '救急隊員'],
  },
  ESFP: {
    type: 'ESFP',
    name: 'エンターテイナー',
    nickname: '演技者',
    description: '自発的でエネルギッシュ、楽しいことが大好き。周りの人を楽しませることに喜びを感じます。',
    strengths: ['社交性', '楽観性', '実用性', '観察力'],
    weaknesses: ['集中力の欠如', '計画性の欠如', '批判に敏感'],
    compatibleTypes: ['ISFJ', 'ISTJ', 'ESFP', 'ESTP'],
    careers: ['エンターテイナー', '営業', 'イベントプランナー', '旅行ガイド'],
  },
};

// 結果を計算する関数
export function calculateMBTIType(answers: Record<number, 'A' | 'B'>): string {
  const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  
  mbtiQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (answer === 'A') {
      scores[q.optionA.value]++;
    } else if (answer === 'B') {
      scores[q.optionB.value]++;
    }
  });
  
  const type = 
    (scores.E >= scores.I ? 'E' : 'I') +
    (scores.S >= scores.N ? 'S' : 'N') +
    (scores.T >= scores.F ? 'T' : 'F') +
    (scores.J >= scores.P ? 'J' : 'P');
  
  return type;
}
