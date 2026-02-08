import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Star, Gift, Flame, Trophy, Sparkles } from "lucide-react";
import { oracles } from "@/lib/oracles";
import { toast } from "sonner";

interface IntimacyDisplayProps {
  oracleId?: string;
  compact?: boolean;
  onLevelUp?: (previousLevel: number, newLevel: number, oracleId: string) => void;
}

const levelTitles: Record<number, string> = {
  1: "初対面",
  2: "顔見知り",
  3: "知り合い",
  4: "友人",
  5: "親友",
  6: "心の友",
  7: "魂の伴侶",
  8: "運命の絆",
  9: "永遠の契り",
  10: "至高の絆",
};

const levelColors: Record<number, string> = {
  1: "bg-gray-500",
  2: "bg-green-500",
  3: "bg-blue-500",
  4: "bg-purple-500",
  5: "bg-pink-500",
  6: "bg-amber-500",
  7: "bg-rose-500",
  8: "bg-indigo-500",
  9: "bg-fuchsia-500",
  10: "bg-gradient-to-r from-amber-400 via-pink-500 to-purple-600",
};

export function IntimacyDisplay({ oracleId, compact = false, onLevelUp }: IntimacyDisplayProps) {
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);
  const [hasRecordedLogin, setHasRecordedLogin] = useState(false);
  const oracle = oracleId ? oracles.find(o => o.id === oracleId) : null;
  
  // @ts-ignore - API exists but type not generated yet
  const intimacyQuery = (trpc.intimacy as any).getWithOracle?.useQuery?.(
    { oracleId: oracleId || '' },
    { enabled: !!oracleId }
  );
  const intimacy = intimacyQuery?.data ?? null;
  const isLoading = intimacyQuery?.isLoading ?? false;
  
  // @ts-ignore
  const rewardsQuery = (trpc.intimacy as any).getRewards?.useQuery?.(
    { oracleId: oracleId || '' },
    { enabled: !!oracleId }
  );
  const rewards = rewardsQuery?.data ?? [];
  
  // @ts-ignore
  const recordLoginMutation = (trpc.intimacy as any).recordLogin?.useMutation?.();
  
  // Record login on mount - only run once
  useEffect(() => {
    if (!hasRecordedLogin && recordLoginMutation?.mutate) {
      setHasRecordedLogin(true);
      recordLoginMutation.mutate(undefined, {
        onSuccess: (result: any) => {
          if (result && !result.alreadyLoggedIn && result.bonusPoints > 0) {
            toast.success(`ログインボーナス！+${result.bonusPoints}ポイント獲得`, {
              description: `連続ログイン倍率: ${(result.streakMultiplier / 100).toFixed(1)}x`,
            });
          }
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasRecordedLogin]);
  
  // Level up detection
  useEffect(() => {
    if (intimacy && oracleId) {
      if (previousLevel !== null && intimacy.level > previousLevel) {
        // Level up detected!
        onLevelUp?.(previousLevel, intimacy.level, oracleId);
      }
      setPreviousLevel(intimacy.level);
    }
  }, [intimacy?.level, oracleId, previousLevel, onLevelUp]);
  
  // If no oracleId, show summary view
  if (!oracleId) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <Heart className="w-4 h-4 text-pink-500" />
          <span>親密度システム</span>
        </div>
        <div className="text-xs text-muted-foreground">
          占い師と会話すると親密度が上がります
        </div>
        <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" asChild>
          <a href="/intimacy">
            <Trophy className="w-4 h-4 mr-2" />
            親密度を確認
          </a>
        </Button>
      </div>
    );
  }
  
  if (isLoading || !intimacy) {
    return null;
  }
  
  const progressPercent = intimacy.pointsToNextLevel > 0 
    ? ((intimacy.experiencePoints % 100) / intimacy.pointsToNextLevel) * 100 
    : 100;
  
  // Get unlocked and locked rewards
  const unlockedRewards = rewards?.filter((r: any) => r.requiredLevel <= intimacy.level) || [];
  const nextReward = rewards?.find((r: any) => r.requiredLevel > intimacy.level);
  
  if (compact) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Heart className={`w-4 h-4 ${intimacy.level >= 5 ? "text-pink-500 fill-pink-500" : "text-muted-foreground"}`} />
        <span className="text-muted-foreground">Lv.{intimacy.level}</span>
        <span className="text-xs text-muted-foreground">{levelTitles[intimacy.level]}</span>
        {intimacy.currentStreak > 1 && (
          <Badge variant="outline" className="text-xs">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            {intimacy.currentStreak}日連続
          </Badge>
        )}
      </div>
    );
  }
  
  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Heart className={`w-5 h-5 ${intimacy.level >= 5 ? "text-pink-500 fill-pink-500" : "text-muted-foreground"}`} />
          {oracle?.name}との親密度
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full ${levelColors[intimacy.level]} flex items-center justify-center text-white font-bold text-lg`}>
              {intimacy.level}
            </div>
            <div>
              <div className="font-semibold">{levelTitles[intimacy.level]}</div>
              <div className="text-sm text-muted-foreground">
                {intimacy.experiencePoints} / {intimacy.experiencePoints + intimacy.pointsToNextLevel} EXP
              </div>
            </div>
          </div>
          {intimacy.currentStreak > 1 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              {intimacy.currentStreak}日連続
            </Badge>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>次のレベルまで</span>
            <span>{intimacy.pointsToNextLevel} EXP</span>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-lg font-bold">{intimacy.totalConversations || 0}</div>
            <div className="text-xs text-muted-foreground">総鑑定回数</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-lg font-bold">{intimacy.longestStreak}</div>
            <div className="text-xs text-muted-foreground">最長連続</div>
          </div>
          <div className="p-2 rounded-lg bg-white/5">
            <div className="text-lg font-bold">{intimacy.level}</div>
            <div className="text-xs text-muted-foreground">現在レベル</div>
          </div>
        </div>
        
        {/* Unlocked Rewards */}
        {unlockedRewards.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              解放済み特典
            </div>
            <div className="flex flex-wrap gap-2">
              {unlockedRewards.map((reward: any) => (
                <Badge key={reward.id} variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {reward.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Next Reward */}
        {nextReward && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-amber-500/10 to-pink-500/10 border border-amber-500/20">
            <div className="text-sm font-medium flex items-center gap-2 mb-1">
              <Trophy className="w-4 h-4 text-amber-500" />
              次の特典 (Lv.{nextReward.requiredLevel})
            </div>
            <div className="text-sm">{nextReward.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{nextReward.description}</div>
          </div>
        )}
        
        {/* 親密度レベルに応じた鑑定深度の説明 */}
        <div className="p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
          <div className="text-sm font-medium flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            親密度の特典
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {intimacy.level >= 8 ? (
              <p className="text-purple-300">特別な絆: 最も深いパーソナルな鑑定を受けられます</p>
            ) : intimacy.level >= 5 ? (
              <p className="text-blue-300">信頼の絆: より深い洞察と具体的なアドバイスが得られます</p>
            ) : intimacy.level >= 3 ? (
              <p className="text-green-300">繋がりの芽生え: あなたを理解した鑑定が受けられます</p>
            ) : (
              <p>会話を重ねて親密度を上げると、より深い鑑定が受けられます</p>
            )}
            <p className="text-muted-foreground/70 mt-2">
              ※ 解約すると親密度はリセットされます
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function IntimacyOverview() {
  // @ts-ignore - API exists but type not generated yet
  const { data: allIntimacies, isLoading } = (trpc.intimacy as any).getAll?.useQuery?.() || { data: [], isLoading: false };
  
  if (isLoading || !allIntimacies || allIntimacies.length === 0) {
    return null;
  }
  
  // Sort by level descending
  const sortedIntimacies = [...allIntimacies].sort((a, b) => b.level - a.level);
  
  return (
    <Card className="glass-card border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          六神との絆
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedIntimacies.slice(0, 5).map(intimacy => {
            const oracle = oracles.find(o => o.id === intimacy.oracleId);
            return (
              <div key={intimacy.id} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${levelColors[intimacy.level]} flex items-center justify-center text-white font-bold text-sm`}>
                  {intimacy.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{oracle?.name || intimacy.oracleId}</div>
                  <div className="text-xs text-muted-foreground">{levelTitles[intimacy.level]}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {intimacy.totalConversations || 0}回
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
