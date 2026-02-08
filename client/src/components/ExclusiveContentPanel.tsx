import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { 
  Lock, 
  Unlock, 
  Sparkles, 
  Crown, 
  Star, 
  MessageCircle,
  Gift,
  Heart,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ExclusiveContentPanelProps {
  oracleId: string;
  oracleName: string;
  onUseContent?: (rewardId: number, rewardType: string, rewardData: any) => void;
}

const rewardTypeIcons: Record<string, React.ReactNode> = {
  exclusive_menu: <Sparkles className="w-4 h-4" />,
  deep_reading: <Crown className="w-4 h-4" />,
  special_prompt: <Zap className="w-4 h-4" />,
  title: <Star className="w-4 h-4" />,
  special_greeting: <MessageCircle className="w-4 h-4" />,
  image_style: <Gift className="w-4 h-4" />,
  exclusive_advice: <Heart className="w-4 h-4" />,
};

const rewardTypeLabels: Record<string, string> = {
  exclusive_menu: "限定メニュー",
  deep_reading: "深層鑑定",
  special_prompt: "特別プロンプト",
  title: "称号",
  special_greeting: "特別挨拶",
  image_style: "画像スタイル",
  exclusive_advice: "限定アドバイス",
};

const rewardTypeColors: Record<string, string> = {
  exclusive_menu: "from-purple-500 to-pink-500",
  deep_reading: "from-amber-500 to-orange-500",
  special_prompt: "from-blue-500 to-cyan-500",
  title: "from-yellow-500 to-amber-500",
  special_greeting: "from-green-500 to-emerald-500",
  image_style: "from-pink-500 to-rose-500",
  exclusive_advice: "from-red-500 to-pink-500",
};

export function ExclusiveContentPanel({ oracleId, oracleName, onUseContent }: ExclusiveContentPanelProps) {
  const { data, isLoading } = trpc.intimacy.getUnlockedContent.useQuery({ oracleId });

  if (isLoading) {
    return (
      <Card className="glass-card border-white/10">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { currentLevel, unlockedContent, lockedContent, totalUnlocked, totalLocked } = data;
  const allUnlocked = [
    ...unlockedContent.exclusiveMenus,
    ...unlockedContent.deepReadings,
    ...unlockedContent.specialPrompts,
    ...unlockedContent.titles,
    ...unlockedContent.specialGreetings,
  ];

  // Calculate progress to next unlock
  const nextLockedReward = lockedContent.length > 0 
    ? lockedContent.reduce((min, r) => r.requiredLevel < min.requiredLevel ? r : min, lockedContent[0])
    : null;
  
  const levelsToNextUnlock = nextLockedReward ? nextLockedReward.requiredLevel - currentLevel : 0;
  const progressToNext = nextLockedReward 
    ? ((currentLevel / nextLockedReward.requiredLevel) * 100)
    : 100;

  return (
    <Card className="glass-card border-white/10 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold" />
            {oracleName}との特別な絆
          </CardTitle>
          <Badge variant="outline" className="border-gold/50 text-gold">
            Lv.{currentLevel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress to next unlock */}
        {nextLockedReward && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>次の解放まで</span>
              <span>Lv.{nextLockedReward.requiredLevel}で「{nextLockedReward.name}」解放</span>
            </div>
            <Progress value={progressToNext} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              あと{levelsToNextUnlock}レベル
            </p>
          </div>
        )}

        {/* Unlocked content */}
        {allUnlocked.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Unlock className="w-4 h-4 text-green-400" />
              解放済み ({totalUnlocked})
            </h4>
            <div className="grid gap-2">
              <AnimatePresence>
                {allUnlocked.map((reward, index) => (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg bg-gradient-to-r ${rewardTypeColors[reward.rewardType] || 'from-gray-500 to-gray-600'} bg-opacity-20 border border-white/10`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-white/10">
                          {rewardTypeIcons[reward.rewardType]}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{reward.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {rewardTypeLabels[reward.rewardType]}
                          </p>
                        </div>
                      </div>
                      {onUseContent && (reward.rewardType === 'special_prompt' || reward.rewardType === 'exclusive_menu') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/20 hover:bg-white/10"
                          onClick={() => onUseContent(reward.id, reward.rewardType, reward.rewardData)}
                        >
                          使用
                        </Button>
                      )}
                    </div>
                    {reward.description && (
                      <p className="text-xs text-muted-foreground mt-2 pl-9">
                        {reward.description}
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Locked content preview */}
        {lockedContent.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Lock className="w-4 h-4" />
              未解放 ({totalLocked})
            </h4>
            <div className="grid gap-2">
              {lockedContent.slice(0, 3).map((reward) => (
                <div
                  key={reward.id}
                  className="p-3 rounded-lg bg-white/5 border border-white/5 opacity-60"
                >
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-white/5">
                      <Lock className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{reward.name}</p>
                      <p className="text-xs text-muted-foreground/70">
                        Lv.{reward.requiredLevel}で解放
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {lockedContent.length > 3 && (
                <p className="text-xs text-center text-muted-foreground">
                  他{lockedContent.length - 3}件の特典
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty state */}
        {allUnlocked.length === 0 && lockedContent.length === 0 && (
          <div className="text-center py-4 text-muted-foreground">
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">特典はまだ設定されていません</p>
          </div>
        )}

        {/* Encouragement message */}
        <div className="p-3 rounded-lg bg-gold/5 border border-gold/20 text-center">
          <p className="text-xs text-gold">
            💫 会話を重ねて親密度を上げると、特別な特典が解放されます
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Compact version for sidebar
export function ExclusiveContentBadge({ oracleId }: { oracleId: string }) {
  const { data } = trpc.intimacy.getUnlockedContent.useQuery({ oracleId });

  if (!data || data.totalUnlocked === 0) return null;

  return (
    <Badge 
      variant="outline" 
      className="border-gold/50 text-gold text-xs gap-1"
    >
      <Gift className="w-3 h-3" />
      {data.totalUnlocked}特典
    </Badge>
  );
}
