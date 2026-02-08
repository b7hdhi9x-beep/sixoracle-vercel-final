import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Users, Plus, X, Sparkles, Star, AlertTriangle, CheckCircle, TrendingUp, Heart, Download, Share2, Link, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { mbtiTypeInfo } from '@/lib/mbtiQuestions';
import { MBTICompatibilityNetwork } from './MBTICompatibilityNetwork';
import { MBTIGroupRadarChart } from './MBTIGroupRadarChart';

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

interface GroupMember {
  id: string;
  name: string;
  type: MBTIType | null;
}

interface MBTIGroupCompatibilityProps {
  trigger?: React.ReactNode;
}

// グループの強みと弱みを分析
function analyzeGroupDynamics(members: GroupMember[]): {
  strengths: string[];
  weaknesses: string[];
  tips: string[];
} {
  const types = members.filter(m => m.type).map(m => m.type as MBTIType);
  
  // 各次元のバランスを計算
  const dimensions = {
    E: types.filter(t => t[0] === 'E').length,
    I: types.filter(t => t[0] === 'I').length,
    S: types.filter(t => t[1] === 'S').length,
    N: types.filter(t => t[1] === 'N').length,
    T: types.filter(t => t[2] === 'T').length,
    F: types.filter(t => t[2] === 'F').length,
    J: types.filter(t => t[3] === 'J').length,
    P: types.filter(t => t[3] === 'P').length,
  };

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const tips: string[] = [];

  // E/I バランス
  if (dimensions.E > 0 && dimensions.I > 0) {
    strengths.push('外向的・内向的メンバーのバランスが取れており、多様な視点を持っています');
  } else if (dimensions.E > dimensions.I) {
    strengths.push('活発なコミュニケーションと行動力があります');
    weaknesses.push('じっくり考える時間が不足しがちです');
    tips.push('重要な決定の前に、静かに考える時間を設けましょう');
  } else {
    strengths.push('深い思考と集中力があります');
    weaknesses.push('外部との交流が不足しがちです');
    tips.push('定期的にチーム外との交流の機会を設けましょう');
  }

  // S/N バランス
  if (dimensions.S > 0 && dimensions.N > 0) {
    strengths.push('現実的な視点と革新的なアイデアの両方を持っています');
  } else if (dimensions.S > dimensions.N) {
    strengths.push('実践的で現実的なアプローチが得意です');
    weaknesses.push('長期的なビジョンが見えにくいことがあります');
    tips.push('時々、将来の可能性について話し合う時間を作りましょう');
  } else {
    strengths.push('創造的で革新的なアイデアが豊富です');
    weaknesses.push('細部の実行が疎かになりがちです');
    tips.push('アイデアを具体的な行動計画に落とし込む担当を決めましょう');
  }

  // T/F バランス
  if (dimensions.T > 0 && dimensions.F > 0) {
    strengths.push('論理的な判断と人間関係への配慮のバランスが取れています');
  } else if (dimensions.T > dimensions.F) {
    strengths.push('客観的で論理的な意思決定ができます');
    weaknesses.push('メンバーの感情面への配慮が不足しがちです');
    tips.push('定期的にメンバーの気持ちを確認する場を設けましょう');
  } else {
    strengths.push('チームの調和と協力関係を大切にします');
    weaknesses.push('厳しい決断を避けがちです');
    tips.push('時には論理的な基準で判断することも必要です');
  }

  // J/P バランス
  if (dimensions.J > 0 && dimensions.P > 0) {
    strengths.push('計画性と柔軟性の両方を持っています');
  } else if (dimensions.J > dimensions.P) {
    strengths.push('計画的で締め切りを守る力があります');
    weaknesses.push('予期せぬ変化への対応が苦手なことがあります');
    tips.push('計画に余裕を持たせ、変更に対応できる柔軟性を持ちましょう');
  } else {
    strengths.push('柔軟で適応力があります');
    weaknesses.push('締め切りや計画の管理が苦手なことがあります');
    tips.push('明確な期限と責任者を決めて進捗を管理しましょう');
  }

  return { strengths, weaknesses, tips };
}

// グループ全体の相性スコアを計算
function calculateGroupScore(members: GroupMember[]): number {
  const types = members.filter(m => m.type).map(m => m.type as MBTIType);
  if (types.length < 2) return 0;

  let totalScore = 0;
  let pairCount = 0;

  for (let i = 0; i < types.length; i++) {
    for (let j = i + 1; j < types.length; j++) {
      totalScore += compatibilityData[types[i]][types[j]];
      pairCount++;
    }
  }

  return pairCount > 0 ? totalScore / pairCount : 0;
}

// 相性マトリックスを生成
function generateCompatibilityMatrix(members: GroupMember[]): { member1: string; member2: string; score: number }[] {
  const matrix: { member1: string; member2: string; score: number }[] = [];
  const validMembers = members.filter(m => m.type);

  for (let i = 0; i < validMembers.length; i++) {
    for (let j = i + 1; j < validMembers.length; j++) {
      const score = compatibilityData[validMembers[i].type!][validMembers[j].type!];
      matrix.push({
        member1: validMembers[i].name || validMembers[i].type!,
        member2: validMembers[j].name || validMembers[j].type!,
        score
      });
    }
  }

  return matrix.sort((a, b) => b.score - a.score);
}

const getScoreColor = (score: number) => {
  if (score >= 4.5) return 'text-pink-400 bg-pink-500/20';
  if (score >= 3.5) return 'text-green-400 bg-green-500/20';
  if (score >= 2.5) return 'text-yellow-400 bg-yellow-500/20';
  if (score >= 1.5) return 'text-orange-400 bg-orange-500/20';
  return 'text-red-400 bg-red-500/20';
};

const getScoreLabel = (score: number) => {
  if (score >= 4.5) return '最高のチーム！';
  if (score >= 3.5) return '良いチーム';
  if (score >= 2.5) return '普通のチーム';
  if (score >= 1.5) return '努力が必要';
  return '挑戦的なチーム';
};

export function MBTIGroupCompatibility({ trigger }: MBTIGroupCompatibilityProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [members, setMembers] = useState<GroupMember[]>([
    { id: '1', name: '', type: null },
    { id: '2', name: '', type: null },
    { id: '3', name: '', type: null },
  ]);
  const [showResult, setShowResult] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [shareId, setShareId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Mutations
  const saveResultMutation = trpc.mbtiGroup.saveResult.useMutation();
  const generateCertificateMutation = trpc.mbtiGroup.generateCertificate.useMutation();

  const addMember = () => {
    if (members.length < 10) {
      setMembers([...members, { id: Date.now().toString(), name: '', type: null }]);
    }
  };

  const removeMember = (id: string) => {
    if (members.length > 3) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: 'name' | 'type', value: string) => {
    setMembers(members.map(m => 
      m.id === id ? { ...m, [field]: field === 'type' ? (value as MBTIType) : value } : m
    ));
  };

  const handleAnalyze = () => {
    const validMembers = members.filter(m => m.type);
    if (validMembers.length >= 3) {
      setShowResult(true);
    }
  };

  const handleReset = () => {
    setMembers([
      { id: '1', name: '', type: null },
      { id: '2', name: '', type: null },
      { id: '3', name: '', type: null },
    ]);
    setShowResult(false);
    setGroupName('');
    setShareId(null);
    setCopied(false);
  };

  // 結果データを取得するヘルパー関数
  const getResultData = () => {
    const validMembers = members.filter(m => m.type).map(m => ({
      name: m.name || m.type!,
      type: m.type!,
    }));
    return {
      groupName: groupName || undefined,
      members: validMembers,
      groupScore,
      analysis: dynamics,
      matrix,
    };
  };

  // PDFダウンロード
  const handleDownload = async () => {
    try {
      const data = getResultData();
      const result = await generateCertificateMutation.mutateAsync(data);
      // 新しいタブで開く
      window.open(result.url, '_blank');
      toast.success('診断結果を開きました');
    } catch (error) {
      console.error('Failed to generate certificate:', error);
      toast.error('ダウンロードに失敗しました');
    }
  };

  // 共有リンク生成
  const handleShare = async () => {
    try {
      const data = getResultData();
      const result = await saveResultMutation.mutateAsync(data);
      setShareId(result.shareId);
      toast.success('共有リンクを生成しました');
    } catch (error) {
      console.error('Failed to save result:', error);
      toast.error('共有リンクの生成に失敗しました。ログインが必要です。');
    }
  };

  // リンクをコピー
  const handleCopyLink = async () => {
    if (!shareId) return;
    const url = `${window.location.origin}/mbti-group/${shareId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('リンクをコピーしました');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('コピーに失敗しました');
    }
  };

  const validMemberCount = members.filter(m => m.type).length;
  const groupScore = calculateGroupScore(members);
  const matrix = generateCompatibilityMatrix(members);
  const dynamics = analyzeGroupDynamics(members);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) handleReset();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            グループ相性診断
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            グループMBTI相性診断
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!showResult ? (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <p className="text-sm text-muted-foreground">
                3人以上のメンバーのMBTIタイプを入力して、グループ全体の相性を分析しましょう！
              </p>

              {/* メンバーリスト */}
              <div className="space-y-3">
                {members.map((member, index) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-sm text-muted-foreground w-8">#{index + 1}</span>
                    <Input
                      placeholder="名前（任意）"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      className="flex-1"
                    />
                    <Select
                      value={member.type || ''}
                      onValueChange={(v) => updateMember(member.id, 'type', v)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="タイプ" />
                      </SelectTrigger>
                      <SelectContent>
                        {MBTI_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {members.length > 3 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMember(member.id)}
                        className="text-red-400 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* メンバー追加ボタン */}
              {members.length < 10 && (
                <Button
                  variant="outline"
                  onClick={addMember}
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  メンバーを追加（最大10人）
                </Button>
              )}

              {/* 分析ボタン */}
              <Button
                onClick={handleAnalyze}
                disabled={validMemberCount < 3}
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
              >
                <Sparkles className="w-4 h-4" />
                グループ相性を分析（{validMemberCount}/3人以上必要）
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* グループスコア */}
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${getScoreColor(groupScore)}`}>
                  <Star className="w-5 h-5" />
                  <span className="text-2xl font-bold">{groupScore.toFixed(1)}</span>
                  <span className="text-sm">/ 5.0</span>
                </div>
                <p className="text-lg font-medium">{getScoreLabel(groupScore)}</p>
              </div>

              {/* メンバー一覧 */}
              <div className="flex flex-wrap justify-center gap-2">
                {members.filter(m => m.type).map((member) => (
                  <div
                    key={member.id}
                    className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm"
                  >
                    {member.name || member.type}
                  </div>
                ))}
              </div>

              {/* 相性マトリックス */}
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    メンバー間の相性
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {matrix.slice(0, 6).map((pair, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span>{pair.member1} × {pair.member2}</span>
                        <div className="flex items-center gap-1">
                          {Array(5).fill(0).map((_, j) => (
                            <Star
                              key={j}
                              className={`w-3 h-3 ${j < pair.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                    {matrix.length > 6 && (
                      <p className="text-xs text-muted-foreground text-center">
                        他 {matrix.length - 6} 組の相性...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 相性ネットワーク図 */}
              <MBTICompatibilityNetwork
                members={members.filter(m => m.type).map(m => ({
                  name: m.name || m.type!,
                  type: m.type!,
                }))}
                matrix={matrix}
              />

              {/* グループ特性レーダーチャート */}
              <MBTIGroupRadarChart
                members={members.filter(m => m.type).map(m => ({
                  name: m.name || m.type!,
                  type: m.type!,
                }))}
              />

              {/* 強み */}
              <Card className="border-green-500/20 bg-green-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    グループの強み
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {dynamics.strengths.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-green-400 mt-1">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 弱み */}
              {dynamics.weaknesses.length > 0 && (
                <Card className="border-orange-500/20 bg-orange-500/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-400" />
                      注意点
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {dynamics.weaknesses.map((w, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-orange-400 mt-1">•</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* アドバイス */}
              <Card className="border-blue-500/20 bg-blue-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    チームワーク改善のヒント
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {dynamics.tips.map((t, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* 保存・共有アクション */}
              <Card className="border-indigo-500/20 bg-indigo-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    結果を保存・共有
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* グループ名入力 */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="グループ名（任意）"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  
                  {/* ボタン群 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownload}
                      disabled={generateCertificateMutation.isPending}
                      className="flex-1 gap-2"
                    >
                      <Download className="w-4 h-4" />
                      {generateCertificateMutation.isPending ? '生成中...' : 'ダウンロード'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleShare}
                      disabled={saveResultMutation.isPending || !!shareId}
                      className="flex-1 gap-2"
                    >
                      <Link className="w-4 h-4" />
                      {saveResultMutation.isPending ? '生成中...' : shareId ? '生成済み' : '共有リンク'}
                    </Button>
                  </div>
                  
                  {/* 共有リンク表示 */}
                  {shareId && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 bg-black/20 rounded-lg"
                    >
                      <Input
                        readOnly
                        value={`${window.location.origin}/mbti-group/${shareId}`}
                        className="flex-1 text-xs bg-transparent border-none"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyLink}
                        className="gap-1"
                      >
                        {copied ? (
                          <><Check className="w-4 h-4 text-green-400" /> コピー済み</>
                        ) : (
                          <><Copy className="w-4 h-4" /> コピー</>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>

              {/* アクション */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  別のグループを分析
                </Button>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
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
