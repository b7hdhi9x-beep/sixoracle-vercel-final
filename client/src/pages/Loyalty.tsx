import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Crown, Star, Shield, Award, Sparkles, Lock, Gift, Clock, Users, Zap, Heart } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

// Tier badge colors
const tierColors = {
  none: "from-gray-400 to-gray-500",
  bronze: "from-amber-600 to-amber-800",
  silver: "from-gray-300 to-gray-500",
  gold: "from-yellow-400 to-yellow-600",
  vip: "from-purple-500 via-pink-500 to-rose-500",
};

const tierIcons = {
  none: Shield,
  bronze: Shield,
  silver: Star,
  gold: Crown,
  vip: Crown,
};

export default function Loyalty() {
  const { user, isAuthenticated, loading } = useAuth();
  const { data: loyaltyData, isLoading } = trpc.subscription.getLoyaltyStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-serif text-white mb-4">ログインが必要です</h1>
        <a href={getLoginUrl()}>
          <Button>ログイン</Button>
        </a>
      </div>
    );
  }

  if (!loyaltyData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background flex items-center justify-center">
        <div className="text-muted-foreground">データを取得できませんでした</div>
      </div>
    );
  }

  const { tier, tierName, continuousMonths, nextTier, milestones, availableBenefits, subscriptionStartDate } = loyaltyData;
  const TierIcon = tierIcons[tier as keyof typeof tierIcons] || Shield;
  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.none;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/20 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-serif text-white">継続特典</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Current Tier Card */}
        <Card className="mb-8 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-white/10 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${tierColor}`} />
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${tierColor} flex items-center justify-center shadow-xl`}>
                <TierIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-2xl font-serif text-white flex items-center gap-2">
                  {tierName}
                  {tier === 'vip' && <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />}
                </div>
                <div className="text-muted-foreground">
                  {continuousMonths}ヶ月継続中
                </div>
                {subscriptionStartDate && (
                  <div className="text-xs text-muted-foreground mt-1">
                    開始日: {new Date(subscriptionStartDate).toLocaleDateString('ja-JP')}
                  </div>
                )}
              </div>
            </div>

            {/* Progress to next tier */}
            {nextTier.months > 0 ? (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">次のランク: {nextTier.name}</span>
                  <span className="text-white font-medium">{nextTier.progressPercent}%</span>
                </div>
                <Progress value={nextTier.progressPercent} className="h-3" />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{continuousMonths}ヶ月</span>
                  <span>あと{nextTier.months - continuousMonths}ヶ月で昇格</span>
                  <span>{nextTier.months}ヶ月</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-lg text-white font-medium">最高ランクに到達しました！</div>
                <div className="text-sm text-muted-foreground">すべての特典をご利用いただけます</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Current Benefits */}
        {(availableBenefits.detailed_reading || availableBenefits.bonus_oracle || availableBenefits.all_oracles || availableBenefits.vip_badge) && (
          <Card className="mb-8 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-white/10">
            <CardHeader>
              <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-user-primary" />
                現在ご利用いただける特典
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableBenefits.detailed_reading && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">詳細な鑑定結果</div>
                    <div className="text-sm text-muted-foreground">
                      占い師からより深い洞察と具体的なアドバイスを受けられます
                    </div>
                  </div>
                </div>
              )}
              {availableBenefits.bonus_oracle && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <Users className="w-5 h-5 text-purple-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">限定占い師「星蘭」解放</div>
                    <div className="text-sm text-muted-foreground">
                      6ヶ月継続特典として、限定占い師「星蘭」をご利用いただけます
                    </div>
                  </div>
                </div>
              )}
              {availableBenefits.all_oracles && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <Crown className="w-5 h-5 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">全占い師解放</div>
                    <div className="text-sm text-muted-foreground">
                      すべての占い師に無制限でアクセスできます
                    </div>
                  </div>
                </div>
              )}
              {availableBenefits.vip_badge && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <Sparkles className="w-5 h-5 text-pink-400 mt-0.5" />
                  <div>
                    <div className="font-medium text-white">VIPバッジ</div>
                    <div className="text-sm text-muted-foreground">
                      プロフィールにVIPバッジが表示されます
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Milestone Roadmap */}
        <Card className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-serif text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-user-primary" />
              継続特典ロードマップ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-white/10" />
              
              <div className="space-y-6">
                {milestones.map((milestone, index) => {
                  const isUnlocked = continuousMonths >= milestone.months;
                  const isCurrent = tier === milestone.tier;
                  const MilestoneIcon = tierIcons[milestone.tier as keyof typeof tierIcons] || Shield;
                  const milestoneColor = tierColors[milestone.tier as keyof typeof tierColors];
                  
                  return (
                    <div key={milestone.tier} className="relative flex items-start gap-4 pl-2">
                      {/* Timeline dot */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                        isUnlocked
                          ? `bg-gradient-to-br ${milestoneColor} shadow-lg`
                          : 'bg-white/10 border border-white/20'
                      } ${isCurrent ? 'ring-2 ring-user-primary ring-offset-2 ring-offset-background' : ''}`}>
                        {isUnlocked ? (
                          <MilestoneIcon className="w-5 h-5 text-white" />
                        ) : (
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className={`flex-1 pb-6 ${!isUnlocked ? 'opacity-60' : ''}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white">{milestone.name}</span>
                          <span className="text-xs text-muted-foreground bg-white/10 px-2 py-0.5 rounded">
                            {milestone.months}ヶ月
                          </span>
                          {isUnlocked && (
                            <span className="text-xs text-green-400 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              達成済み
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{milestone.benefit}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info note */}
        <div className="mt-8 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-start gap-3">
            <Heart className="w-5 h-5 text-user-primary mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">
                継続特典は、有料プラン（スタンダードまたはプレミアム）を継続してご利用いただいた期間に応じて自動的に解放されます。
              </p>
              <p>
                解約された場合、継続期間はリセットされますが、一度解放された特典は引き続きご利用いただけます。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
