import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mbtiQuestions, mbtiTypeInfo, calculateMBTIType, MBTITypeInfo } from "@/lib/mbtiQuestions";
import { MBTIAdvicePanel } from "@/components/MBTIAdvicePanel";
import { Brain, ArrowRight, ArrowLeft, Sparkles, Heart, Briefcase, Users, X, BookOpen, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useApiQuery, useApiMutation } from "@/lib/api";
import { toast } from "sonner";

interface MBTIQuickTestProps {
  onComplete?: (type: string, info: MBTITypeInfo) => void;
  trigger?: React.ReactNode;
}

// Calculate dimension scores from answers
function calculateScores(answers: Record<number, 'A' | 'B'>): { eScore: number; sScore: number; tScore: number; jScore: number } {
  let eScore = 0, sScore = 0, tScore = 0, jScore = 0;
  
  mbtiQuestions.forEach(q => {
    const answer = answers[q.id];
    if (!answer) return;
    
    const value = answer === 'A' ? 1 : -1;
    switch (q.dimension) {
      case 'EI': eScore += value; break;
      case 'SN': sScore += value; break;
      case 'TF': tScore += value; break;
      case 'JP': jScore += value; break;
    }
  });
  
  return { eScore, sScore, tScore, jScore };
}

export function MBTIQuickTest({ onComplete, trigger }: MBTIQuickTestProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [result, setResult] = useState<MBTITypeInfo | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const saveResultMutation = useApiMutation("/api/mbti/save");
  const { data: historyData, refetch: refetchHistory } = useApiQuery(`/api/mbti/history?limit: 10`);

  const progress = (Object.keys(answers).length / mbtiQuestions.length) * 100;
  const question = mbtiQuestions[currentQuestion];

  const handleAnswer = (choice: 'A' | 'B') => {
    const newAnswers = { ...answers, [question.id]: choice };
    setAnswers(newAnswers);

    if (currentQuestion < mbtiQuestions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 300);
    } else {
      // 全問回答完了
      const type = calculateMBTIType(newAnswers);
      const info = mbtiTypeInfo[type];
      setResult(info);
      setShowResult(true);
      
      // 履歴に保存
      const scores = calculateScores(newAnswers);
      saveResultMutation.mutate({
        mbtiType: type,
        eScore: scores.eScore,
        sScore: scores.sScore,
        tScore: scores.tScore,
        jScore: scores.jScore,
        testSource: 'quick_test',
      }, {
        onSuccess: () => {
          toast.success('🧠 MBTIタイプを履歴に保存しました');
          refetchHistory();
        },
        onError: () => {
          // 保存失敗しても結果は表示
        },
      });
      
      if (onComplete) {
        onComplete(type, info);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleReset = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setResult(null);
    setShowResult(false);
    setShowAdvice(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    handleReset();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) handleReset();
      }}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" className="gap-2">
              <Brain className="w-4 h-4" />
              MBTIクイックテスト
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-400" />
              MBTIクイックテスト
            </DialogTitle>
          </DialogHeader>

          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 進捗バー */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>質問 {currentQuestion + 1} / {mbtiQuestions.length}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                {/* 質問 */}
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="pt-6">
                    <p className="text-lg font-medium mb-6">{question.question}</p>
                    
                    <div className="space-y-3">
                      <Button
                        variant={answers[question.id] === 'A' ? 'default' : 'outline'}
                        className="w-full justify-start text-left h-auto py-4 px-4"
                        onClick={() => handleAnswer('A')}
                      >
                        <span className="mr-3 font-bold text-purple-400">A.</span>
                        {question.optionA.text}
                      </Button>
                      <Button
                        variant={answers[question.id] === 'B' ? 'default' : 'outline'}
                        className="w-full justify-start text-left h-auto py-4 px-4"
                        onClick={() => handleAnswer('B')}
                      >
                        <span className="mr-3 font-bold text-purple-400">B.</span>
                        {question.optionB.text}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* ナビゲーション */}
                <div className="flex justify-between">
                  <Button
                    variant="ghost"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    前の質問
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClose}
                  >
                    キャンセル
                  </Button>
                </div>
              </motion.div>
            ) : result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* 結果ヘッダー */}
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <span className="text-2xl font-bold text-white">{result.type}</span>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{result.name}</h3>
                    <p className="text-muted-foreground">{result.nickname}</p>
                  </div>
                </div>

                {/* 説明 */}
                <Card className="border-purple-500/20 bg-purple-500/5">
                  <CardContent className="pt-6">
                    <p className="text-sm leading-relaxed">{result.description}</p>
                  </CardContent>
                </Card>

                {/* 強み・弱み */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-green-500/20 bg-green-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-green-400" />
                        強み
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        {result.strengths.map((s, i) => (
                          <li key={i}>• {s}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  <Card className="border-orange-500/20 bg-orange-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Heart className="w-4 h-4 text-orange-400" />
                        課題
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        {result.weaknesses.map((w, i) => (
                          <li key={i}>• {w}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* 相性・適職 */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="border-pink-500/20 bg-pink-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-400" />
                        相性の良いタイプ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-1">
                        {result.compatibleTypes.map((t, i) => (
                          <span key={i} className="px-2 py-1 text-xs rounded bg-pink-500/20 text-pink-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-blue-500/20 bg-blue-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-blue-400" />
                        適職
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-xs space-y-1">
                        {result.careers.slice(0, 3).map((c, i) => (
                          <li key={i}>• {c}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* 詳細アドバイスボタン */}
                <Button
                  variant="outline"
                  onClick={() => setShowAdvice(true)}
                  className="w-full gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
                >
                  <BookOpen className="w-4 h-4" />
                  恋愛・仕事・人間関係の詳細アドバイスを見る
                </Button>

                {/* 履歴表示ボタン */}
                {historyData && historyData.history.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setShowHistory(!showHistory)}
                    className="w-full gap-2 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <History className="w-4 h-4" />
                    {showHistory ? '履歴を閉じる' : `過去の結果を見る (${historyData.history.length}件)`}
                  </Button>
                )}

                {/* 履歴表示 */}
                {showHistory && historyData && historyData.history.length > 0 && (
                  <Card className="border-amber-500/20 bg-amber-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <History className="w-4 h-4 text-amber-400" />
                        MBTIタイプ履歴
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {historyData.history.map((h, i) => (
                          <div key={h.id} className="flex items-center justify-between text-sm p-2 rounded bg-background/50">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-purple-400">{h.mbtiType}</span>
                              <span className="text-xs text-muted-foreground">
                                {mbtiTypeInfo[h.mbtiType as keyof typeof mbtiTypeInfo]?.nickname || ''}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(h.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* アクション */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="flex-1"
                  >
                    もう一度テスト
                  </Button>
                  <Button
                    onClick={handleClose}
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

      {/* アドバイスパネル */}
      {showAdvice && result && (
        <MBTIAdvicePanel
          mbtiType={result.type}
          onClose={() => setShowAdvice(false)}
        />
      )}
    </>
  );
}
