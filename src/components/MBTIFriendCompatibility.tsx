import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Users, Sparkles, ArrowRight, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { mbtiTypeInfo } from '@/lib/mbtiQuestions';

type MBTIType = 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP' | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP' | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ' | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

const MBTI_TYPES: MBTIType[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
];

// 相性データ（5段階: 5=最高, 1=要努力）
const compatibilityData: Record<MBTIType, Record<MBTIType, number>> = {
  'INTJ': { 'INTJ': 4, 'INTP': 5, 'ENTJ': 5, 'ENTP': 5, 'INFJ': 4, 'INFP': 3, 'ENFJ': 4, 'ENFP': 4, 'ISTJ': 3, 'ISFJ': 2, 'ESTJ': 3, 'ESFJ': 2, 'ISTP': 3, 'ISFP': 2, 'ESTP': 2, 'ESFP': 2 },
  'INTP': { 'INTJ': 5, 'INTP': 4, 'ENTJ': 5, 'ENTP': 5, 'INFJ': 4, 'INFP': 4, 'ENFJ': 3, 'ENFP': 4, 'ISTJ': 3, 'ISFJ': 2, 'ESTJ': 2, 'ESFJ': 2, 'ISTP': 4, 'ISFP': 3, 'ESTP': 3, 'ESFP': 2 },
  'ENTJ': { 'INTJ': 5, 'INTP': 5, 'ENTJ': 4, 'ENTP': 5, 'INFJ': 4, 'INFP': 4, 'ENFJ': 4, 'ENFP': 4, 'ISTJ': 4, 'ISFJ': 3, 'ESTJ': 4, 'ESFJ': 3, 'ISTP': 4, 'ISFP': 3, 'ESTP': 4, 'ESFP': 3 },
  'ENTP': { 'INTJ': 5, 'INTP': 5, 'ENTJ': 5, 'ENTP': 4, 'INFJ': 5, 'INFP': 4, 'ENFJ': 4, 'ENFP': 5, 'ISTJ': 2, 'ISFJ': 2, 'ESTJ': 3, 'ESFJ': 2, 'ISTP': 4, 'ISFP': 3, 'ESTP': 4, 'ESFP': 3 },
  'INFJ': { 'INTJ': 4, 'INTP': 4, 'ENTJ': 4, 'ENTP': 5, 'INFJ': 4, 'INFP': 5, 'ENFJ': 5, 'ENFP': 5, 'ISTJ': 3, 'ISFJ': 3, 'ESTJ': 2, 'ESFJ': 3, 'ISTP': 3, 'ISFP': 4, 'ESTP': 2, 'ESFP': 3 },
  'INFP': { 'INTJ': 3, 'INTP': 4, 'ENTJ': 4, 'ENTP': 4, 'INFJ': 5, 'INFP': 4, 'ENFJ': 5, 'ENFP': 5, 'ISTJ': 2, 'ISFJ': 3, 'ESTJ': 2, 'ESFJ': 3, 'ISTP': 3, 'ISFP': 4, 'ESTP': 2, 'ESFP': 3 },
  'ENFJ': { 'INTJ': 4, 'INTP': 3, 'ENTJ': 4, 'ENTP': 4, 'INFJ': 5, 'INFP': 5, 'ENFJ': 4, 'ENFP': 5, 'ISTJ': 3, 'ISFJ': 4, 'ESTJ': 3, 'ESFJ': 4, 'ISTP': 3, 'ISFP': 5, 'ESTP': 3, 'ESFP': 4 },
  'ENFP': { 'INTJ': 4, 'INTP': 4, 'ENTJ': 4, 'ENTP': 5, 'INFJ': 5, 'INFP': 5, 'ENFJ': 5, 'ENFP': 4, 'ISTJ': 2, 'ISFJ': 3, 'ESTJ': 2, 'ESFJ': 3, 'ISTP': 3, 'ISFP': 4, 'ESTP': 3, 'ESFP': 4 },
  'ISTJ': { 'INTJ': 3, 'INTP': 3, 'ENTJ': 4, 'ENTP': 2, 'INFJ': 3, 'INFP': 2, 'ENFJ': 3, 'ENFP': 2, 'ISTJ': 4, 'ISFJ': 5, 'ESTJ': 5, 'ESFJ': 5, 'ISTP': 4, 'ISFP': 4, 'ESTP': 4, 'ESFP': 4 },
  'ISFJ': { 'INTJ': 2, 'INTP': 2, 'ENTJ': 3, 'ENTP': 2, 'INFJ': 3, 'INFP': 3, 'ENFJ': 4, 'ENFP': 3, 'ISTJ': 5, 'ISFJ': 4, 'ESTJ': 5, 'ESFJ': 5, 'ISTP': 4, 'ISFP': 5, 'ESTP': 4, 'ESFP': 5 },
  'ESTJ': { 'INTJ': 3, 'INTP': 2, 'ENTJ': 4, 'ENTP': 3, 'INFJ': 2, 'INFP': 2, 'ENFJ': 3, 'ENFP': 2, 'ISTJ': 5, 'ISFJ': 5, 'ESTJ': 4, 'ESFJ': 5, 'ISTP': 5, 'ISFP': 4, 'ESTP': 5, 'ESFP': 4 },
  'ESFJ': { 'INTJ': 2, 'INTP': 2, 'ENTJ': 3, 'ENTP': 2, 'INFJ': 3, 'INFP': 3, 'ENFJ': 4, 'ENFP': 3, 'ISTJ': 5, 'ISFJ': 5, 'ESTJ': 5, 'ESFJ': 4, 'ISTP': 4, 'ISFP': 5, 'ESTP': 4, 'ESFP': 5 },
  'ISTP': { 'INTJ': 3, 'INTP': 4, 'ENTJ': 4, 'ENTP': 4, 'INFJ': 3, 'INFP': 3, 'ENFJ': 3, 'ENFP': 3, 'ISTJ': 4, 'ISFJ': 4, 'ESTJ': 5, 'ESFJ': 4, 'ISTP': 4, 'ISFP': 4, 'ESTP': 5, 'ESFP': 4 },
  'ISFP': { 'INTJ': 2, 'INTP': 3, 'ENTJ': 3, 'ENTP': 3, 'INFJ': 4, 'INFP': 4, 'ENFJ': 5, 'ENFP': 4, 'ISTJ': 4, 'ISFJ': 5, 'ESTJ': 4, 'ESFJ': 5, 'ISTP': 4, 'ISFP': 4, 'ESTP': 4, 'ESFP': 5 },
  'ESTP': { 'INTJ': 2, 'INTP': 3, 'ENTJ': 4, 'ENTP': 4, 'INFJ': 2, 'INFP': 2, 'ENFJ': 3, 'ENFP': 3, 'ISTJ': 4, 'ISFJ': 4, 'ESTJ': 5, 'ESFJ': 4, 'ISTP': 5, 'ISFP': 4, 'ESTP': 4, 'ESFP': 5 },
  'ESFP': { 'INTJ': 2, 'INTP': 2, 'ENTJ': 3, 'ENTP': 3, 'INFJ': 3, 'INFP': 3, 'ENFJ': 4, 'ENFP': 4, 'ISTJ': 4, 'ISFJ': 5, 'ESTJ': 4, 'ESFJ': 5, 'ISTP': 4, 'ISFP': 5, 'ESTP': 5, 'ESFP': 4 }
};

// 相性の詳細説明
const getCompatibilityDescription = (type1: MBTIType, type2: MBTIType, score: number): { title: string; description: string; tips: string[] } => {
  const info1 = mbtiTypeInfo[type1];
  const info2 = mbtiTypeInfo[type2];
  
  if (score === 5) {
    return {
      title: '最高の相性！',
      description: `${info1.nickname}と${info2.nickname}は、お互いの長所を引き出し合える最高のパートナーです。価値観や考え方が自然と調和し、一緒にいるだけで成長できる関係です。`,
      tips: [
        'お互いの違いを尊重しながら、共通の目標に向かって協力しましょう',
        '深い会話を楽しみ、知的な刺激を与え合いましょう',
        '一緒に新しい体験をすることで、絆がさらに深まります'
      ]
    };
  } else if (score === 4) {
    return {
      title: '良い相性',
      description: `${info1.nickname}と${info2.nickname}は、多くの点で共感し合える良い関係を築けます。お互いの強みを活かしながら、弱点を補い合えるでしょう。`,
      tips: [
        'コミュニケーションスタイルの違いを理解しましょう',
        '相手の意見を積極的に聞く姿勢が大切です',
        '共通の趣味や活動を見つけると関係が深まります'
      ]
    };
  } else if (score === 3) {
    return {
      title: '普通の相性',
      description: `${info1.nickname}と${info2.nickname}は、努力次第で良い関係を築けます。お互いの違いを理解し、尊重することが重要です。`,
      tips: [
        '相手の価値観を否定せず、理解しようとする姿勢が大切',
        '意見が合わない時は、冷静に話し合いましょう',
        'お互いの長所に目を向けることで関係が改善します'
      ]
    };
  } else if (score === 2) {
    return {
      title: '努力が必要',
      description: `${info1.nickname}と${info2.nickname}は、考え方やアプローチが異なることが多いです。しかし、その違いを学びの機会と捉えれば、成長につながります。`,
      tips: [
        '相手の視点から物事を見る練習をしましょう',
        '小さな妥協点を見つけることから始めましょう',
        '相手の良いところを意識的に探しましょう'
      ]
    };
  } else {
    return {
      title: '挑戦的な相性',
      description: `${info1.nickname}と${info2.nickname}は、価値観や行動パターンが大きく異なります。しかし、その違いこそが新しい視点をもたらす可能性があります。`,
      tips: [
        '相手を変えようとせず、ありのままを受け入れましょう',
        '共通点を見つける努力を続けましょう',
        '専門家のアドバイスを求めることも選択肢です'
      ]
    };
  }
};

const getScoreColor = (score: number) => {
  switch (score) {
    case 5: return 'text-pink-400 bg-pink-500/20';
    case 4: return 'text-green-400 bg-green-500/20';
    case 3: return 'text-yellow-400 bg-yellow-500/20';
    case 2: return 'text-orange-400 bg-orange-500/20';
    default: return 'text-red-400 bg-red-500/20';
  }
};

const getScoreStars = (score: number) => {
  return Array(5).fill(0).map((_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
    />
  ));
};

interface MBTIFriendCompatibilityProps {
  trigger?: React.ReactNode;
  defaultMyType?: MBTIType;
}

export function MBTIFriendCompatibility({ trigger, defaultMyType }: MBTIFriendCompatibilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [myType, setMyType] = useState<MBTIType | null>(defaultMyType || null);
  const [friendType, setFriendType] = useState<MBTIType | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleCheck = () => {
    if (myType && friendType) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setMyType(defaultMyType || null);
    setFriendType(null);
    setShowResult(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
  };

  const score = myType && friendType ? compatibilityData[myType][friendType] : 0;
  const compatibility = myType && friendType ? getCompatibilityDescription(myType, friendType, score) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleReset();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Heart className="w-4 h-4" />
            友達との相性チェック
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400" />
            友達とのMBTI相性チェック
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <p className="text-sm text-muted-foreground">
                あなたと友達（または気になる人）のMBTIタイプを選択して、相性をチェックしましょう！
              </p>

              {/* 自分のタイプ選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  あなたのMBTIタイプ
                </label>
                <Select value={myType || ''} onValueChange={(v) => setMyType(v as MBTIType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="タイプを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type} - {mbtiTypeInfo[type].nickname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 相手のタイプ選択 */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-400" />
                  相手のMBTIタイプ
                </label>
                <Select value={friendType || ''} onValueChange={(v) => setFriendType(v as MBTIType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="タイプを選択..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MBTI_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type} - {mbtiTypeInfo[type].nickname}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* チェックボタン */}
              <Button
                onClick={handleCheck}
                disabled={!myType || !friendType}
                className="w-full gap-2 bg-gradient-to-r from-pink-500 to-purple-500"
              >
                <Sparkles className="w-4 h-4" />
                相性をチェック
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          ) : myType && friendType && compatibility && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* 相性スコア */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-purple-400">{myType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mbtiTypeInfo[myType].nickname}</p>
                  </div>
                  <Heart className="w-8 h-8 text-pink-400 animate-pulse" />
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full bg-pink-500/20 flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-pink-400">{friendType}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{mbtiTypeInfo[friendType].nickname}</p>
                  </div>
                </div>

                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getScoreColor(score)}`}>
                  <span className="font-bold">{compatibility.title}</span>
                </div>

                <div className="flex justify-center gap-1">
                  {getScoreStars(score)}
                </div>
              </div>

              {/* 説明 */}
              <Card className="border-pink-500/20 bg-pink-500/5">
                <CardContent className="pt-6">
                  <p className="text-sm leading-relaxed">{compatibility.description}</p>
                </CardContent>
              </Card>

              {/* アドバイス */}
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    関係を良くするためのヒント
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {compatibility.tips.map((tip, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-purple-400 mt-1">•</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* アクション */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  別の組み合わせを試す
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500"
                >
                  閉じる
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
