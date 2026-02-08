import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { mbtiTypeInfo } from "@/lib/mbtiQuestions";
import { History, Brain, Calendar, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface MBTIHistoryDialogProps {
  trigger?: React.ReactNode;
}

// スコアバーコンポーネント
function ScoreBar({ 
  leftLabel, 
  rightLabel, 
  score, 
  color 
}: { 
  leftLabel: string; 
  rightLabel: string; 
  score: number; 
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className={score > 0 ? `text-${color}-400 font-bold` : 'text-muted-foreground'}>{leftLabel}</span>
        <span className={score < 0 ? `text-${color}-400 font-bold` : 'text-muted-foreground'}>{rightLabel}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden relative">
        <div className="absolute inset-0 flex">
          <div className="w-1/2 flex justify-end">
            {score > 0 && (
              <div 
                className={`h-full bg-gradient-to-r from-${color}-600 to-${color}-400 rounded-r-full`}
                style={{ width: `${Math.min(Math.abs(score) * 20, 100)}%` }}
              />
            )}
          </div>
          <div className="w-1/2">
            {score < 0 && (
              <div 
                className={`h-full bg-gradient-to-l from-${color}-600 to-${color}-400 rounded-l-full`}
                style={{ width: `${Math.min(Math.abs(score) * 20, 100)}%` }}
              />
            )}
          </div>
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-500" />
      </div>
    </div>
  );
}

export function MBTIHistoryDialog({ trigger }: MBTIHistoryDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const { data, isLoading } = trpc.mbti.getHistory.useQuery(
    { limit: 20 },
    { enabled: open }
  );

  const history = data?.history || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <History className="w-4 h-4" />
            MBTI履歴
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-cyan-400" />
            MBTI診断履歴
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">まだ診断履歴がありません</p>
            <p className="text-sm text-muted-foreground/70 mt-2">
              心理占い師とのチャットでMBTI診断を受けてみましょう
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-3">
              {history.map((item, index) => {
                const typeInfo = mbtiTypeInfo[item.mbtiType];
                const isExpanded = selectedIndex === index;

                return (
                  <Card 
                    key={item.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isExpanded 
                        ? 'border-cyan-500/50 bg-cyan-500/5' 
                        : 'border-border/50 hover:border-cyan-500/30'
                    }`}
                    onClick={() => setSelectedIndex(isExpanded ? null : index)}
                  >
                    <CardContent className="p-4">
                      {/* ヘッダー */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{item.mbtiType}</span>
                          </div>
                          <div>
                            <h3 className="font-medium text-white">
                              {typeInfo?.name || item.mbtiType}
                            </h3>
                            <p className="text-xs text-cyan-400">
                              {typeInfo?.nickname || ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(item.createdAt), 'yyyy/MM/dd HH:mm', { locale: ja })}
                          <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>

                      {/* 展開時の詳細 */}
                      {isExpanded && (
                        <div className="mt-4 pt-4 border-t border-border/30 space-y-4">
                          {/* 説明 */}
                          {typeInfo && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {typeInfo.description}
                            </p>
                          )}

                          {/* スコア詳細 */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                              <TrendingUp className="w-3 h-3" />
                              性格指標スコア
                            </h4>
                            
                            <ScoreBar 
                              leftLabel="E 外向型" 
                              rightLabel="内向型 I" 
                              score={item.eScore} 
                              color="purple" 
                            />
                            <ScoreBar 
                              leftLabel="S 感覚型" 
                              rightLabel="直感型 N" 
                              score={item.sScore} 
                              color="blue" 
                            />
                            <ScoreBar 
                              leftLabel="T 思考型" 
                              rightLabel="感情型 F" 
                              score={item.tScore} 
                              color="green" 
                            />
                            <ScoreBar 
                              leftLabel="J 判断型" 
                              rightLabel="知覚型 P" 
                              score={item.jScore} 
                              color="orange" 
                            />
                          </div>

                          {/* テストソース */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400">
                              {item.testSource === 'quick_test' ? 'クイックテスト' : 
                               item.testSource === 'full_test' ? '詳細テスト' : 'チャット診断'}
                            </span>
                          </div>

                          {/* 強み・相性 */}
                          {typeInfo && (
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <h5 className="text-xs font-medium text-green-400 mb-2">強み</h5>
                                <ul className="text-xs space-y-1 text-muted-foreground">
                                  {typeInfo.strengths.slice(0, 3).map((s, i) => (
                                    <li key={i}>• {s}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <h5 className="text-xs font-medium text-pink-400 mb-2">相性の良いタイプ</h5>
                                <div className="flex flex-wrap gap-1">
                                  {typeInfo.compatibleTypes.map((t, i) => (
                                    <span key={i} className="px-2 py-0.5 text-xs rounded bg-pink-500/20 text-pink-300">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
