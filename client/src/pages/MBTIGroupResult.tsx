import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Star, CheckCircle, AlertTriangle, TrendingUp, Heart, ArrowLeft, Share2, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function MBTIGroupResult() {
  const params = useParams<{ shareId: string }>();
  const [, navigate] = useLocation();
  
  const { data, isLoading, error } = trpc.mbtiGroup.getByShareId.useQuery({
    shareId: params.shareId || '',
  }, {
    enabled: !!params.shareId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error || !data?.result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-red-500/20 bg-red-500/5">
          <CardContent className="pt-6 text-center space-y-4">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto" />
            <h2 className="text-xl font-bold">結果が見つかりません</h2>
            <p className="text-muted-foreground">
              このリンクは無効か、期限切れの可能性があります。
            </p>
            <Button onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              ホームに戻る
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const result = data.result;
  const formattedDate = new Date(result.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-400 text-sm">
            <Users className="w-4 h-4" />
            グループMBTI相性診断結果
          </div>
          {result.groupName && (
            <h1 className="text-2xl font-bold">{result.groupName}</h1>
          )}
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            {result.viewCount}回閲覧
          </div>
        </motion.div>

        {/* スコア */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center space-y-4"
        >
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full ${getScoreColor(result.groupScore)}`}>
            <Star className="w-5 h-5" />
            <span className="text-3xl font-bold">{result.groupScore.toFixed(1)}</span>
            <span className="text-sm">/ 5.0</span>
          </div>
          <p className="text-lg font-medium">{getScoreLabel(result.groupScore)}</p>
        </motion.div>

        {/* メンバー一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-2"
        >
          {result.members.map((member: { name: string; type: string }, i: number) => (
            <div
              key={i}
              className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm"
            >
              {member.name} ({member.type})
            </div>
          ))}
        </motion.div>

        {/* 相性マトリックス */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                メンバー間の相性
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.matrix.map((pair: { member1: string; member2: string; score: number }, i: number) => (
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
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 強み */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-green-500/20 bg-green-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                グループの強み
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.analysis.strengths.map((s: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    {s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* 弱み */}
        {result.analysis.weaknesses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-orange-500/20 bg-orange-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                  注意点
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {result.analysis.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="text-orange-400 mt-1">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* アドバイス */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-blue-500/20 bg-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                チームワーク改善のヒント
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {result.analysis.tips.map((t: string, i: number) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {t}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        {/* フッター */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-4 pt-4"
        >
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              ホームへ
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')} 
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <Users className="w-4 h-4" />
              自分も診断する
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            六神ノ間 - 心理（MBTI性格診断の専門家）
          </p>
        </motion.div>
      </div>
    </div>
  );
}
