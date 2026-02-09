import { useState } from 'react';
import { mbtiAdvice, adviceCategories, type AdviceCategory } from '@/lib/mbtiAdvice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Briefcase, Users, X, ChevronRight, Sparkles } from 'lucide-react';

interface MBTIAdvicePanelProps {
  mbtiType: string;
  onClose: () => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Heart: <Heart className="w-5 h-5" />,
  Briefcase: <Briefcase className="w-5 h-5" />,
  Users: <Users className="w-5 h-5" />,
};

export function MBTIAdvicePanel({ mbtiType, onClose }: MBTIAdvicePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<AdviceCategory>('love');
  const advice = mbtiAdvice[mbtiType];

  if (!advice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md glass-card">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">アドバイスデータが見つかりません</p>
            <Button onClick={onClose} className="mt-4">閉じる</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAdvice = advice[selectedCategory];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden glass-card border-primary/30">
        <CardHeader className="border-b border-white/10 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-serif">{mbtiType} タイプ別アドバイス</CardTitle>
                <p className="text-sm text-muted-foreground">あなたの性格タイプに合わせた具体的なアドバイス</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <div className="flex border-b border-white/10">
          {adviceCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary/20 text-primary-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:bg-white/5'
              }`}
            >
              <span className={category.color}>{iconMap[category.icon]}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        <CardContent className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-serif text-primary-foreground">{currentAdvice.title}</h3>
            </div>

            {/* 強み */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium flex items-center gap-2 text-green-400">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                あなたの強み
              </h4>
              <ul className="space-y-2">
                {currentAdvice.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 mt-1 text-green-400 flex-shrink-0" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 課題 */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium flex items-center gap-2 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                注意すべき点
              </h4>
              <ul className="space-y-2">
                {currentAdvice.challenges.map((challenge, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 mt-1 text-amber-400 flex-shrink-0" />
                    <span>{challenge}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* アドバイス */}
            <div className="space-y-3">
              <h4 className="text-lg font-medium flex items-center gap-2 text-cyan-400">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                具体的なアドバイス
              </h4>
              <ul className="space-y-2">
                {currentAdvice.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-muted-foreground">
                    <ChevronRight className="w-4 h-4 mt-1 text-cyan-400 flex-shrink-0" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* カテゴリ別の追加情報 */}
            {selectedCategory === 'love' && 'bestMatches' in currentAdvice && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-lg font-medium flex items-center gap-2 text-pink-400">
                  <Heart className="w-4 h-4" />
                  相性の良いタイプ
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentAdvice as any).bestMatches.map((type: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-sm font-medium"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'work' && 'idealEnvironment' in currentAdvice && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-lg font-medium flex items-center gap-2 text-blue-400">
                  <Briefcase className="w-4 h-4" />
                  理想の職場環境
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(currentAdvice as any).idealEnvironment.map((env: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-medium"
                    >
                      {env}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedCategory === 'relationships' && 'communicationStyle' in currentAdvice && (
              <div className="space-y-3 pt-4 border-t border-white/10">
                <h4 className="text-lg font-medium flex items-center gap-2 text-green-400">
                  <Users className="w-4 h-4" />
                  コミュニケーションスタイル
                </h4>
                <p className="text-muted-foreground bg-white/5 rounded-lg p-4">
                  {(currentAdvice as any).communicationStyle}
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-4 border-t border-white/10">
          <Button onClick={onClose} className="w-full btn-primary">
            閉じる
          </Button>
        </div>
      </Card>
    </div>
  );
}
