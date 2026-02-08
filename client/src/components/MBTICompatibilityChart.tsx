import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { mbtiTypeInfo } from "@/lib/mbtiQuestions";
import { Users, Heart, Briefcase, Star, Info } from "lucide-react";

// 相性データ（5段階評価）
const compatibilityData: Record<string, Record<string, number>> = {
  INTJ: { INTJ: 4, INTP: 4, ENTJ: 4, ENTP: 5, INFJ: 4, INFP: 3, ENFJ: 3, ENFP: 5, ISTJ: 3, ISFJ: 2, ESTJ: 2, ESFJ: 2, ISTP: 3, ISFP: 2, ESTP: 2, ESFP: 2 },
  INTP: { INTJ: 4, INTP: 4, ENTJ: 5, ENTP: 4, INFJ: 3, INFP: 4, ENFJ: 5, ENFP: 3, ISTJ: 3, ISFJ: 2, ESTJ: 3, ESFJ: 2, ISTP: 3, ISFP: 2, ESTP: 3, ESFP: 2 },
  ENTJ: { INTJ: 4, INTP: 5, ENTJ: 4, ENTP: 4, INFJ: 3, INFP: 5, ENFJ: 4, ENFP: 3, ISTJ: 3, ISFJ: 2, ESTJ: 3, ESFJ: 2, ISTP: 4, ISFP: 3, ESTP: 3, ESFP: 2 },
  ENTP: { INTJ: 5, INTP: 4, ENTJ: 4, ENTP: 4, INFJ: 5, INFP: 3, ENFJ: 3, ENFP: 4, ISTJ: 2, ISFJ: 2, ESTJ: 2, ESFJ: 2, ISTP: 3, ISFP: 3, ESTP: 3, ESFP: 3 },
  INFJ: { INTJ: 4, INTP: 3, ENTJ: 3, ENTP: 5, INFJ: 4, INFP: 4, ENFJ: 4, ENFP: 5, ISTJ: 2, ISFJ: 3, ESTJ: 2, ESFJ: 3, ISTP: 2, ISFP: 3, ESTP: 2, ESFP: 3 },
  INFP: { INTJ: 3, INTP: 4, ENTJ: 5, ENTP: 3, INFJ: 4, INFP: 4, ENFJ: 5, ENFP: 4, ISTJ: 2, ISFJ: 3, ESTJ: 2, ESFJ: 3, ISTP: 2, ISFP: 4, ESTP: 2, ESFP: 3 },
  ENFJ: { INTJ: 3, INTP: 5, ENTJ: 4, ENTP: 3, INFJ: 4, INFP: 5, ENFJ: 4, ENFP: 4, ISTJ: 2, ISFJ: 3, ESTJ: 2, ESFJ: 3, ISTP: 3, ISFP: 5, ESTP: 2, ESFP: 3 },
  ENFP: { INTJ: 5, INTP: 3, ENTJ: 3, ENTP: 4, INFJ: 5, INFP: 4, ENFJ: 4, ENFP: 4, ISTJ: 2, ISFJ: 2, ESTJ: 2, ESFJ: 2, ISTP: 2, ISFP: 3, ESTP: 3, ESFP: 4 },
  ISTJ: { INTJ: 3, INTP: 3, ENTJ: 3, ENTP: 2, INFJ: 2, INFP: 2, ENFJ: 2, ENFP: 2, ISTJ: 4, ISFJ: 4, ESTJ: 4, ESFJ: 3, ISTP: 4, ISFP: 3, ESTP: 5, ESFP: 5 },
  ISFJ: { INTJ: 2, INTP: 2, ENTJ: 2, ENTP: 2, INFJ: 3, INFP: 3, ENFJ: 3, ENFP: 2, ISTJ: 4, ISFJ: 4, ESTJ: 3, ESFJ: 4, ISTP: 3, ISFP: 4, ESTP: 5, ESFP: 5 },
  ESTJ: { INTJ: 2, INTP: 3, ENTJ: 3, ENTP: 2, INFJ: 2, INFP: 2, ENFJ: 2, ENFP: 2, ISTJ: 4, ISFJ: 3, ESTJ: 4, ESFJ: 4, ISTP: 5, ISFP: 5, ESTP: 4, ESFP: 3 },
  ESFJ: { INTJ: 2, INTP: 2, ENTJ: 2, ENTP: 2, INFJ: 3, INFP: 3, ENFJ: 3, ENFP: 2, ISTJ: 3, ISFJ: 4, ESTJ: 4, ESFJ: 4, ISTP: 5, ISFP: 5, ESTP: 3, ESFP: 4 },
  ISTP: { INTJ: 3, INTP: 3, ENTJ: 4, ENTP: 3, INFJ: 2, INFP: 2, ENFJ: 3, ENFP: 2, ISTJ: 4, ISFJ: 3, ESTJ: 5, ESFJ: 5, ISTP: 4, ISFP: 4, ESTP: 4, ESFP: 3 },
  ISFP: { INTJ: 2, INTP: 2, ENTJ: 3, ENTP: 3, INFJ: 3, INFP: 4, ENFJ: 5, ENFP: 3, ISTJ: 3, ISFJ: 4, ESTJ: 5, ESFJ: 5, ISTP: 4, ISFP: 4, ESTP: 3, ESFP: 4 },
  ESTP: { INTJ: 2, INTP: 3, ENTJ: 3, ENTP: 3, INFJ: 2, INFP: 2, ENFJ: 2, ENFP: 3, ISTJ: 5, ISFJ: 5, ESTJ: 4, ESFJ: 3, ISTP: 4, ISFP: 3, ESTP: 4, ESFP: 4 },
  ESFP: { INTJ: 2, INTP: 2, ENTJ: 2, ENTP: 3, INFJ: 3, INFP: 3, ENFJ: 3, ENFP: 4, ISTJ: 5, ISFJ: 5, ESTJ: 3, ESFJ: 4, ISTP: 3, ISFP: 4, ESTP: 4, ESFP: 4 },
};

const mbtiTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

const getCompatibilityColor = (score: number) => {
  switch (score) {
    case 5: return 'bg-green-500 text-white';
    case 4: return 'bg-green-400 text-white';
    case 3: return 'bg-yellow-400 text-black';
    case 2: return 'bg-orange-400 text-white';
    default: return 'bg-red-400 text-white';
  }
};

const getCompatibilityLabel = (score: number) => {
  switch (score) {
    case 5: return '最高';
    case 4: return '良好';
    case 3: return '普通';
    case 2: return '注意';
    default: return '難しい';
  }
};

interface MBTICompatibilityChartProps {
  selectedType?: string;
  trigger?: React.ReactNode;
}

export function MBTICompatibilityChart({ selectedType, trigger }: MBTICompatibilityChartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string | null>(selectedType || null);

  const activeInfo = activeType ? mbtiTypeInfo[activeType] : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            MBTI相性表
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            MBTI 16タイプ相性表
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* 相性表 */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[400px]">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 bg-background z-10 p-1"></th>
                      {mbtiTypes.map((type) => (
                        <th 
                          key={type} 
                          className="p-1 font-medium text-center cursor-pointer hover:bg-purple-500/10 transition-colors"
                          onClick={() => setActiveType(type)}
                        >
                          <span className={activeType === type ? 'text-purple-400 font-bold' : ''}>
                            {type}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mbtiTypes.map((rowType) => (
                      <tr key={rowType}>
                        <td 
                          className="sticky left-0 bg-background z-10 p-1 font-medium cursor-pointer hover:bg-purple-500/10 transition-colors"
                          onClick={() => setActiveType(rowType)}
                        >
                          <span className={activeType === rowType ? 'text-purple-400 font-bold' : ''}>
                            {rowType}
                          </span>
                        </td>
                        {mbtiTypes.map((colType) => {
                          const score = compatibilityData[rowType][colType];
                          const isHighlighted = activeType === rowType || activeType === colType;
                          return (
                            <td 
                              key={colType}
                              className={`p-1 text-center cursor-pointer transition-all ${
                                isHighlighted ? 'ring-2 ring-purple-400' : ''
                              }`}
                              onMouseEnter={() => setHoveredType(`${rowType}-${colType}`)}
                              onMouseLeave={() => setHoveredType(null)}
                              onClick={() => setActiveType(rowType)}
                            >
                              <span className={`inline-block w-6 h-6 rounded text-[10px] leading-6 ${getCompatibilityColor(score)}`}>
                                {score}
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ScrollArea>

            {/* 凡例 */}
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-500"></span>
                <span>5: 最高</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-green-400"></span>
                <span>4: 良好</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-yellow-400"></span>
                <span>3: 普通</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-4 h-4 rounded bg-orange-400"></span>
                <span>2: 注意</span>
              </div>
            </div>
          </div>

          {/* タイプ詳細 */}
          <div className="lg:col-span-1">
            {activeInfo ? (
              <Card className="border-purple-500/20 bg-purple-500/5 h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {activeInfo.type}
                    </div>
                    <div>
                      <div>{activeInfo.name}</div>
                      <div className="text-xs text-muted-foreground font-normal">{activeInfo.nickname}</div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground">{activeInfo.description}</p>
                  
                  <div>
                    <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Heart className="w-3 h-3 text-pink-400" />
                      相性の良いタイプ
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {activeInfo.compatibleTypes.map((t) => (
                        <button
                          key={t}
                          onClick={() => setActiveType(t)}
                          className="px-2 py-1 text-xs rounded bg-pink-500/20 text-pink-300 hover:bg-pink-500/30 transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Briefcase className="w-3 h-3 text-blue-400" />
                      適職
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {activeInfo.careers.map((c, i) => (
                        <span key={i} className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium flex items-center gap-1 mb-2">
                      <Star className="w-3 h-3 text-yellow-400" />
                      強み
                    </h4>
                    <ul className="text-xs space-y-1">
                      {activeInfo.strengths.map((s, i) => (
                        <li key={i} className="text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-dashed h-full flex items-center justify-center">
                <CardContent className="text-center py-8">
                  <Info className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    タイプをクリックして<br />詳細を表示
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
