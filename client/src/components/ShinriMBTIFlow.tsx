import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { mbtiQuestions, mbtiTypeInfo, calculateMBTIType, MBTITypeInfo } from "@/lib/mbtiQuestions";
import { Brain, ArrowRight, ArrowLeft, Sparkles, Heart, Briefcase, Users, ChevronRight, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface ShinriMBTIFlowProps {
  onComplete: (type: string, info: MBTITypeInfo) => void;
  onSkip?: () => void;
  existingMBTI?: string | null;
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

export function ShinriMBTIFlow({ onComplete, onSkip, existingMBTI }: ShinriMBTIFlowProps) {
  const [step, setStep] = useState<'intro' | 'test' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, 'A' | 'B'>>({});
  const [result, setResult] = useState<MBTITypeInfo | null>(null);
  const [scores, setScores] = useState<{ eScore: number; sScore: number; tScore: number; jScore: number } | null>(null);
  
  const saveResultMutation = trpc.mbti.saveResult.useMutation();
  
  const progress = (Object.keys(answers).length / mbtiQuestions.length) * 100;
  const question = mbtiQuestions[currentQuestion];

  // 既存のMBTIがある場合は、それを使用するか確認
  useEffect(() => {
    if (existingMBTI && mbtiTypeInfo[existingMBTI]) {
      // 既存のMBTIがある場合は、イントロで選択肢を表示
    }
  }, [existingMBTI]);

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
      setStep('result');
      
      // 履歴に保存
      const calculatedScores = calculateScores(newAnswers);
      setScores(calculatedScores);
      const scores = calculatedScores;
      saveResultMutation.mutate({
        mbtiType: type,
        eScore: scores.eScore,
        sScore: scores.sScore,
        tScore: scores.tScore,
        jScore: scores.jScore,
        testSource: 'quick_test',
      }, {
        onSuccess: () => {
          toast.success('🧠 MBTIタイプを保存しました');
        },
      });
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleUseExistingMBTI = () => {
    if (existingMBTI && mbtiTypeInfo[existingMBTI]) {
      const info = mbtiTypeInfo[existingMBTI];
      setResult(info);
      setStep('result');
    }
  };

  const handleStartChat = () => {
    if (result) {
      onComplete(result.type, result);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* イントロヘッダー */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/30">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">心理の部屋へようこそ</h2>
                <p className="text-muted-foreground mt-2">
                  あなたの心の地図を読み解きましょう
                </p>
              </div>
            </div>

            {/* 説明カード */}
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-6 space-y-4">
                <p className="text-sm leading-relaxed">
                  心理は、MBTI性格診断の専門家です。
                  あなたの性格タイプを知ることで、より深い心理分析と的確なアドバイスを提供できます。
                </p>
                <div className="flex items-center gap-2 text-sm text-cyan-400">
                  <Sparkles className="w-4 h-4" />
                  <span>まずはMBTI診断から始めましょう</span>
                </div>
              </CardContent>
            </Card>

            {/* アクションボタン */}
            <div className="space-y-3">
              <Button
                onClick={() => setStep('test')}
                className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <Brain className="w-5 h-5 mr-2" />
                MBTI診断を始める
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              {existingMBTI && mbtiTypeInfo[existingMBTI] && (
                <Button
                  variant="outline"
                  onClick={handleUseExistingMBTI}
                  className="w-full py-6 text-lg border-cyan-500/30 hover:bg-cyan-500/10"
                >
                  <Users className="w-5 h-5 mr-2" />
                  前回の結果を使う（{existingMBTI}）
                </Button>
              )}

              {onSkip && (
                <Button
                  variant="ghost"
                  onClick={onSkip}
                  className="w-full text-muted-foreground hover:text-white"
                >
                  スキップして相談を始める
                </Button>
              )}
            </div>

            {/* 所要時間 */}
            <p className="text-center text-xs text-muted-foreground">
              診断は約3〜5分で完了します（{mbtiQuestions.length}問）
            </p>
          </motion.div>
        )}

        {step === 'test' && (
          <motion.div
            key="test"
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
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-6">
                <p className="text-lg font-medium mb-6">{question.question}</p>
                
                <div className="space-y-3">
                  <Button
                    variant={answers[question.id] === 'A' ? 'default' : 'outline'}
                    className={`w-full justify-start text-left h-auto py-4 px-4 ${
                      answers[question.id] === 'A' 
                        ? 'bg-cyan-500 hover:bg-cyan-600' 
                        : 'hover:border-cyan-500/50'
                    }`}
                    onClick={() => handleAnswer('A')}
                  >
                    <span className="mr-3 font-bold text-cyan-400">A.</span>
                    {question.optionA.text}
                  </Button>
                  <Button
                    variant={answers[question.id] === 'B' ? 'default' : 'outline'}
                    className={`w-full justify-start text-left h-auto py-4 px-4 ${
                      answers[question.id] === 'B' 
                        ? 'bg-cyan-500 hover:bg-cyan-600' 
                        : 'hover:border-cyan-500/50'
                    }`}
                    onClick={() => handleAnswer('B')}
                  >
                    <span className="mr-3 font-bold text-cyan-400">B.</span>
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
                onClick={() => setStep('intro')}
              >
                キャンセル
              </Button>
            </div>
          </motion.div>
        )}

        {step === 'result' && result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-6"
          >
            {/* 結果ヘッダー */}
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/30">
                <span className="text-3xl font-bold text-white">{result.type}</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">{result.name}</h3>
                <p className="text-cyan-400">{result.nickname}</p>
              </div>
            </div>

            {/* 説明 */}
            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="pt-6">
                <p className="text-sm leading-relaxed">{result.description}</p>
              </CardContent>
            </Card>

            {/* 詳細スコア表示 */}
            {scores && (
              <Card className="border-purple-500/20 bg-purple-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    あなたの性格指標
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* E/I 指標 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={scores.eScore > 0 ? 'text-purple-400 font-bold' : 'text-muted-foreground'}>E 外向型</span>
                      <span className={scores.eScore < 0 ? 'text-purple-400 font-bold' : 'text-muted-foreground'}>内向型 I</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 flex justify-end">
                          {scores.eScore > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-r-full"
                              style={{ width: `${Math.min(Math.abs(scores.eScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="w-1/2">
                          {scores.eScore < 0 && (
                            <div 
                              className="h-full bg-gradient-to-l from-purple-600 to-purple-400 rounded-l-full"
                              style={{ width: `${Math.min(Math.abs(scores.eScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500" />
                    </div>
                  </div>

                  {/* S/N 指標 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={scores.sScore > 0 ? 'text-blue-400 font-bold' : 'text-muted-foreground'}>S 感覚型</span>
                      <span className={scores.sScore < 0 ? 'text-blue-400 font-bold' : 'text-muted-foreground'}>直感型 N</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 flex justify-end">
                          {scores.sScore > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-r-full"
                              style={{ width: `${Math.min(Math.abs(scores.sScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="w-1/2">
                          {scores.sScore < 0 && (
                            <div 
                              className="h-full bg-gradient-to-l from-blue-600 to-blue-400 rounded-l-full"
                              style={{ width: `${Math.min(Math.abs(scores.sScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500" />
                    </div>
                  </div>

                  {/* T/F 指標 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={scores.tScore > 0 ? 'text-green-400 font-bold' : 'text-muted-foreground'}>T 思考型</span>
                      <span className={scores.tScore < 0 ? 'text-green-400 font-bold' : 'text-muted-foreground'}>感情型 F</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 flex justify-end">
                          {scores.tScore > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-r-full"
                              style={{ width: `${Math.min(Math.abs(scores.tScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="w-1/2">
                          {scores.tScore < 0 && (
                            <div 
                              className="h-full bg-gradient-to-l from-green-600 to-green-400 rounded-l-full"
                              style={{ width: `${Math.min(Math.abs(scores.tScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500" />
                    </div>
                  </div>

                  {/* J/P 指標 */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className={scores.jScore > 0 ? 'text-orange-400 font-bold' : 'text-muted-foreground'}>J 判断型</span>
                      <span className={scores.jScore < 0 ? 'text-orange-400 font-bold' : 'text-muted-foreground'}>知覚型 P</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden relative">
                      <div className="absolute inset-0 flex">
                        <div className="w-1/2 flex justify-end">
                          {scores.jScore > 0 && (
                            <div 
                              className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-r-full"
                              style={{ width: `${Math.min(Math.abs(scores.jScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                        <div className="w-1/2">
                          {scores.jScore < 0 && (
                            <div 
                              className="h-full bg-gradient-to-l from-orange-600 to-orange-400 rounded-l-full"
                              style={{ width: `${Math.min(Math.abs(scores.jScore) * 20, 100)}%` }}
                            />
                          )}
                        </div>
                      </div>
                      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    {result.strengths.slice(0, 3).map((s, i) => (
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
                    {result.weaknesses.slice(0, 3).map((w, i) => (
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

            {/* 心理との相談開始ボタン */}
            <div className="space-y-3 pt-4">
              <Button
                onClick={handleStartChat}
                className="w-full py-6 text-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                心理に相談を始める
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                あなたの{result.type}タイプを踏まえて、心理が深い分析とアドバイスを提供します
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
