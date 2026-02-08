import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { oracles, getOracleById } from "@/lib/oracles";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Lock, Crown, Sparkles, ChevronRight, History, Filter, Briefcase, Wallet, Users, Compass, Star, Hand, Droplet, Cat } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

// Icon mapping for oracles
const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat
};

// Category definitions
const categories = [
  { id: null, label: "すべて", icon: History },
  { id: "love", label: "恋愛", icon: Heart },
  { id: "work", label: "仕事", icon: Briefcase },
  { id: "health", label: "健康", icon: Shield },
  { id: "money", label: "金運", icon: Wallet },
  { id: "relationships", label: "人間関係", icon: Users },
  { id: "future", label: "将来", icon: Compass },
  { id: "spiritual", label: "スピリチュアル", icon: Sparkles },
  { id: "other", label: "その他", icon: Star },
] as const;

type CategoryType = "love" | "work" | "health" | "money" | "relationships" | "future" | "spiritual" | "other" | null;

// Character quotes for each oracle (used when no characterQuote is saved)
const defaultQuotes: Record<string, string> = {
  souma: "時の流れが、あなたの運命を語っておる...",
  reira: "あなたの心に、優しい光が見えますわ...",
  sakuya: "数字が示す真実は、興味深いものです...",
  akari: "カードが照らす道を、一緒に見ていきましょう！",
  yui: "夢の中で、あなたの答えを見つけました...",
  gen: "私があなたを守り、導きましょう。",
};

export default function ReadingHistory() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(null);
  
  // Get user's chat sessions (reading history)
  const { data: sessions, isLoading: sessionsLoading } = trpc.chat.getSessions.useQuery(
    { limit: 100 },
    { enabled: !!user }
  );
  
  // Get category stats
  const { data: categoryStats } = trpc.sessionCategories.getStats.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Update category mutation
  const updateCategoryMutation = trpc.sessionCategories.updateCategory.useMutation({
    onSuccess: () => {
      toast.success("カテゴリを更新しました");
    },
    onError: (error) => {
      toast.error(error.message || "カテゴリの更新に失敗しました");
    },
  });
  
  const isPremium = user?.isPremium || false;
  const maxFreeHistory = 5;
  
  // Filter sessions by category
  const filteredSessions = sessions?.filter(session => {
    if (!selectedCategory) return true;
    return (session as any).category === selectedCategory;
  });
  
  // Filter sessions for free users
  const displaySessions = isPremium 
    ? filteredSessions 
    : filteredSessions?.slice(0, maxFreeHistory);
  
  const hiddenCount = !isPremium && filteredSessions ? Math.max(0, filteredSessions.length - maxFreeHistory) : 0;
  
  // Get count for each category
  const getCategoryCount = (categoryId: string | null) => {
    if (!categoryId) return sessions?.length || 0;
    const stat = categoryStats?.find(s => s.category === categoryId);
    return stat?.count || 0;
  };
  
  if (authLoading || sessionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">鑑定履歴を読み込んでいます...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 z-0">
        {/* Star field */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 2}s infinite ease-in-out ${Math.random() * 2}s`
            }}
          />
        ))}
        {/* Magic circle background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-5">
          <div className="absolute inset-0 border-2 border-amber-400/50 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-8 border border-purple-400/50 rounded-full animate-[spin_45s_linear_infinite_reverse]" />
          <div className="absolute inset-16 border border-cyan-400/50 rounded-full animate-[spin_30s_linear_infinite]" />
        </div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <History className="w-6 h-6 text-amber-400" />
                <h1 className="text-xl font-bold text-white">鑑定履歴</h1>
              </div>
            </div>
            {isPremium && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-amber-300">プレミアム</span>
              </div>
            )}
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">カテゴリで絞り込み</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.id);
              const isSelected = selectedCategory === cat.id;
              
              return (
                <Button
                  key={cat.id || "all"}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 ${
                    isSelected 
                      ? "bg-amber-500 hover:bg-amber-600 text-black" 
                      : "border-white/20 hover:border-amber-400/50 hover:bg-amber-400/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                  <span className={`text-xs ${isSelected ? "text-black/70" : "text-muted-foreground"}`}>
                    ({count})
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
        
        {/* Stats Section */}
        <div className="mb-8 text-center">
          <p className="text-muted-foreground">
            {selectedCategory ? (
              <>
                「{categories.find(c => c.id === selectedCategory)?.label}」の鑑定記録: {filteredSessions?.length || 0}件
              </>
            ) : (
              <>全{sessions?.length || 0}件の鑑定記録</>
            )}
            {!isPremium && filteredSessions && filteredSessions.length > maxFreeHistory && (
              <span className="text-amber-400 ml-2">
                （無料プランでは直近{maxFreeHistory}件まで表示）
              </span>
            )}
          </p>
        </div>
        
        {/* History List */}
        <div className="max-w-3xl mx-auto space-y-4">
          {displaySessions && displaySessions.length > 0 ? (
            displaySessions.map((session, index) => {
              const oracle = getOracleById(session.oracleId);
              const Icon = oracle ? iconMap[oracle.icon] : Clock;
              const quote = session.characterQuote || defaultQuotes[session.oracleId] || "鑑定結果をご確認ください";
              const sessionCategory = (session as any).category;
              const categoryInfo = categories.find(c => c.id === sessionCategory);
              
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Link href={`/history/${session.id}`}>
                    <Card className="glass-card hover:border-primary/50 transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-stretch">
                          {/* Oracle Avatar Section */}
                          <div className={`w-24 sm:w-32 flex-shrink-0 bg-gradient-to-br ${oracle?.color || 'from-gray-600 to-gray-800'} flex flex-col items-center justify-center p-4 relative`}>
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                              {oracle?.image ? (
                                <img 
                                  src={oracle.image} 
                                  alt={oracle.name}
                                  className="w-full h-full rounded-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <Icon className={`w-6 h-6 sm:w-8 sm:h-8 text-white ${oracle?.image ? 'hidden' : ''}`} />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-white text-center">
                              {oracle?.name || session.oracleId}
                            </span>
                          </div>
                          
                          {/* Content Section */}
                          <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                            <div>
                              {/* Title & Category */}
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-white truncate">
                                  {session.title || "鑑定セッション"}
                                </h3>
                                {categoryInfo && (
                                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground flex-shrink-0">
                                    <categoryInfo.icon className="w-3 h-3" />
                                    {categoryInfo.label}
                                  </span>
                                )}
                              </div>
                              
                              {/* Character Quote / Summary */}
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2 italic">
                                「{session.summary ? session.summary.substring(0, 80) + (session.summary.length > 80 ? '...' : '') : quote}」
                              </p>
                            </div>
                            
                            {/* Date & Status */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(session.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                              </span>
                              {session.isComplete && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                  完了
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Arrow */}
                          <div className="flex items-center pr-4">
                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                <History className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {selectedCategory ? "このカテゴリの鑑定履歴がありません" : "まだ鑑定履歴がありません"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory ? "他のカテゴリを選択するか、新しい鑑定を始めてください" : "占い師に相談すると、ここに履歴が表示されます"}
              </p>
              <Link href="/dashboard">
                <Button className="btn-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  占いを始める
                </Button>
              </Link>
            </div>
          )}
          
          {/* Locked History Notice (Free Users) */}
          {!isPremium && hiddenCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-300 mb-2">
                    さらに{hiddenCount}件の履歴があります
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    プレミアムプランにアップグレードすると、<br />
                    すべての鑑定履歴を閲覧できます
                  </p>
                  <Link href="/pricing">
                    <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold">
                      <Crown className="w-4 h-4 mr-2" />
                      プレミアムにアップグレード
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground/50">
        <p>六神ノ間 - 鑑定履歴</p>
      </footer>
    </div>
  );
}
