import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { oracles, getOracleById } from "@/lib/oracles";
import { trpc } from "@/lib/trpc";
import { Sparkles, ArrowRight, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star
};

interface RecommendedOraclesProps {
  currentOracleId?: string | null;
  onSelectOracle: (oracleId: string) => void;
  className?: string;
}

export function RecommendedOracles({ 
  currentOracleId, 
  onSelectOracle,
  className = ""
}: RecommendedOraclesProps) {
  const { t } = useLanguage();
  
  // Get recommended oracles based on user's consultation history
  const { data: recommendations, isLoading } = trpc.chat.getRecommendedOracles.useQuery(
    { currentOracleId: currentOracleId || undefined, limit: 3 },
    { enabled: true }
  );

  // Mark referral as followed when user clicks on recommendation
  const markFollowedMutation = trpc.chat.markReferralFollowed.useMutation();

  const handleSelectRecommended = (oracleId: string) => {
    // If coming from another oracle, mark the referral as followed
    if (currentOracleId) {
      markFollowedMutation.mutate({
        fromOracleId: currentOracleId,
        toOracleId: oracleId,
      });
    }
    onSelectOracle(oracleId);
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-white/10 rounded w-32 mb-3"></div>
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-16 h-20 bg-white/5 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    // Show default recommendations if no history
    const defaultRecommendations = oracles
      .filter(o => o.id !== currentOracleId)
      .slice(0, 3);

    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-user-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            {t("dashboard.recommendedOracles", "おすすめの占い師")}
          </span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {defaultRecommendations.map((oracle) => {
            const Icon = iconMap[oracle.icon];
            return (
              <button
                key={oracle.id}
                onClick={() => handleSelectRecommended(oracle.id)}
                className="flex-shrink-0 p-2 rounded-lg border border-user-primary/20 hover:border-user-primary/50 hover:bg-user-primary/10 transition-all group"
              >
                <Avatar className="w-12 h-12 mb-1">
                  <AvatarImage src={oracle.image} alt={oracle.name} />
                  <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </AvatarFallback>
                </Avatar>
                <div className="text-xs text-center">
                  <div className="font-medium text-white group-hover:text-user-primary transition-colors">
                    {oracle.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-user-primary" />
        <span className="text-sm font-medium text-muted-foreground">
          {t("dashboard.recommendedForYou", "あなたへのおすすめ")}
        </span>
      </div>
      <div className="space-y-2">
        {recommendations.map((rec) => {
          const oracle = getOracleById(rec.oracleId);
          if (!oracle) return null;
          const Icon = iconMap[oracle.icon];
          
          return (
            <button
              key={rec.oracleId}
              onClick={() => handleSelectRecommended(rec.oracleId)}
              className="w-full p-3 rounded-lg border border-user-primary/20 hover:border-user-primary/50 hover:bg-user-primary/10 transition-all group flex items-center gap-3"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={oracle.image} alt={oracle.name} />
                <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                  <Icon className="w-5 h-5 text-white" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="font-medium text-white group-hover:text-user-primary transition-colors">
                  {oracle.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {rec.reason}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-user-primary transition-colors" />
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-muted-foreground/50 mt-2 text-center">
        ※ 過去の相談内容に基づくおすすめです
      </p>
    </div>
  );
}
