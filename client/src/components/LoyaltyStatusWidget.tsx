import { trpc } from "@/lib/trpc";
import { Crown, Star, Shield, Award, Sparkles, Lock, Gift, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link } from "wouter";

interface LoyaltyStatusWidgetProps {
  compact?: boolean;
}

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

export function LoyaltyStatusWidget({ compact = false }: LoyaltyStatusWidgetProps) {
  const { data: loyaltyData, isLoading } = trpc.subscription.getLoyaltyStatus.useQuery();

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-white/10 rounded w-24 mb-2"></div>
        <div className="h-2 bg-white/10 rounded w-full"></div>
      </div>
    );
  }

  if (!loyaltyData) {
    return null;
  }

  const { tier, tierName, continuousMonths, nextTier, milestones, availableBenefits } = loyaltyData;
  const TierIcon = tierIcons[tier as keyof typeof tierIcons] || Shield;
  const tierColor = tierColors[tier as keyof typeof tierColors] || tierColors.none;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/loyalty">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${tierColor} flex items-center justify-center`}>
                  <TierIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">継続特典</div>
                  <div className="text-sm font-medium text-white flex items-center gap-1">
                    {tierName}
                    {tier === 'vip' && <Sparkles className="w-3 h-3 text-yellow-400" />}
                  </div>
                </div>
                {nextTier.months > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {nextTier.months - continuousMonths}ヶ月
                  </div>
                )}
              </div>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-2">
              <p className="font-medium">{continuousMonths}ヶ月継続中</p>
              {nextTier.months > 0 && (
                <p className="text-sm text-muted-foreground">
                  あと{nextTier.months - continuousMonths}ヶ月で{nextTier.name}に昇格
                </p>
              )}
              <p className="text-xs text-muted-foreground">クリックして詳細を見る</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      {/* Header with tier badge */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${tierColor} flex items-center justify-center shadow-lg`}>
            <TierIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-serif text-white flex items-center gap-2">
              {tierName}
              {tier === 'vip' && <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />}
            </div>
            <div className="text-sm text-muted-foreground">
              {continuousMonths}ヶ月継続中
            </div>
          </div>
        </div>
        {tier === 'vip' && (
          <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <span className="text-xs font-medium text-purple-300">VIP会員</span>
          </div>
        )}
      </div>

      {/* Progress to next tier */}
      {nextTier.months > 0 && (
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">次のランク: {nextTier.name}</span>
            <span className="text-white">{nextTier.progressPercent}%</span>
          </div>
          <Progress value={nextTier.progressPercent} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            あと{nextTier.months - continuousMonths}ヶ月で昇格
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-white flex items-center gap-2">
          <Gift className="w-4 h-4" />
          継続特典
        </h3>
        <div className="space-y-2">
          {milestones.map((milestone) => {
            const isUnlocked = continuousMonths >= milestone.months;
            const isCurrent = tier === milestone.tier;
            
            return (
              <div
                key={milestone.tier}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isUnlocked
                    ? 'bg-white/10'
                    : 'bg-white/5 opacity-60'
                } ${isCurrent ? 'ring-1 ring-user-primary' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isUnlocked
                    ? `bg-gradient-to-br ${tierColors[milestone.tier as keyof typeof tierColors]}`
                    : 'bg-white/10'
                }`}>
                  {isUnlocked ? (
                    <Award className="w-4 h-4 text-white" />
                  ) : (
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white flex items-center gap-2">
                    {milestone.name}
                    <span className="text-xs text-muted-foreground">({milestone.months}ヶ月)</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{milestone.benefit}</div>
                </div>
                {isUnlocked && (
                  <div className="text-xs text-green-400">解放済み</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current benefits */}
      {(availableBenefits.detailed_reading || availableBenefits.bonus_oracle || availableBenefits.all_oracles || availableBenefits.vip_badge) && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h3 className="text-sm font-medium text-white mb-3">現在の特典</h3>
          <div className="flex flex-wrap gap-2">
            {availableBenefits.detailed_reading && (
              <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                詳細鑑定
              </span>
            )}
            {availableBenefits.bonus_oracle && (
              <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                星蘭解放
              </span>
            )}
            {availableBenefits.all_oracles && (
              <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs">
                全占い師解放
              </span>
            )}
            {availableBenefits.vip_badge && (
              <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-pink-300 text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" />
                VIPバッジ
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// VIP Badge component for profile display
export function VIPBadge({ className = "" }: { className?: string }) {
  const { data: loyaltyData } = trpc.subscription.getLoyaltyStatus.useQuery();

  if (!loyaltyData?.availableBenefits.vip_badge) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium ${className}`}>
            <Crown className="w-3 h-3" />
            VIP
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>12ヶ月以上継続のVIP会員です</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
