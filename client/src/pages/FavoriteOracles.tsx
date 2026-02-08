import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { oracles, getOracleById } from "@/lib/oracles";
import { ArrowLeft, Heart, Star, Sparkles, GripVertical, Clock, Calculator, Lightbulb, Moon, Shield, Hand, Droplet, Cat } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion, Reorder } from "framer-motion";
import { useState, useEffect } from "react";

const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield, Hand, Star, Droplet, Cat
};

export default function FavoriteOracles() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  
  // Get user's favorites
  const { data: favorites, isLoading: favoritesLoading, refetch } = trpc.favorites.list.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Local state for drag-and-drop reordering
  const [orderedFavorites, setOrderedFavorites] = useState<string[]>([]);
  
  useEffect(() => {
    if (favorites) {
      setOrderedFavorites(favorites.map(f => f.oracleId));
    }
  }, [favorites]);
  
  // Add to favorites mutation
  const addFavoriteMutation = trpc.favorites.add.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "お気に入りの追加に失敗しました");
    },
  });
  
  // Remove from favorites mutation
  const removeFavoriteMutation = trpc.favorites.remove.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "お気に入りの削除に失敗しました");
    },
  });
  
  // Reorder favorites mutation
  const reorderFavoritesMutation = trpc.favorites.reorder.useMutation({
    onError: (error) => {
      toast.error(error.message || "並び替えに失敗しました");
      refetch(); // Revert to server state on error
    },
  });
  
  const handleReorder = (newOrder: string[]) => {
    setOrderedFavorites(newOrder);
    reorderFavoritesMutation.mutate({ oracleIds: newOrder });
  };
  
  const toggleFavorite = (oracleId: string) => {
    const isFavorite = favorites?.some(f => f.oracleId === oracleId);
    if (isFavorite) {
      removeFavoriteMutation.mutate({ oracleId });
    } else {
      addFavoriteMutation.mutate({ oracleId });
    }
  };
  
  if (authLoading || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  const favoriteOracleIds = favorites?.map(f => f.oracleId) || [];
  const nonFavoriteOracles = oracles.filter(o => !favoriteOracleIds.includes(o.id));
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
        {[...Array(50)].map((_, i) => (
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
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-400 fill-rose-400" />
              <h1 className="text-xl font-bold text-white">お気に入り占い師</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {/* Favorites Section */}
          {orderedFavorites.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-amber-400 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 fill-amber-400" />
                お気に入り（ドラッグで並び替え）
              </h2>
              <Reorder.Group
                axis="y"
                values={orderedFavorites}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {orderedFavorites.map((oracleId) => {
                  const oracle = getOracleById(oracleId);
                  if (!oracle) return null;
                  const Icon = iconMap[oracle.icon] || Star;
                  
                  return (
                    <Reorder.Item
                      key={oracleId}
                      value={oracleId}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Card className="glass-card hover:border-rose-400/50 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <Avatar className="w-14 h-14 ring-2 ring-rose-400/50">
                              <AvatarImage src={oracle.image} alt={oracle.name} />
                              <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                                <Icon className="w-6 h-6 text-white" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="font-serif text-lg text-white">{oracle.name}</div>
                              <div className="text-sm text-muted-foreground truncate">{oracle.role}</div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavorite(oracleId);
                              }}
                              className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                            >
                              <Heart className="w-5 h-5 fill-current" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </section>
          )}
          
          {/* All Oracles Section */}
          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {orderedFavorites.length > 0 ? "その他の占い師" : "すべての占い師"}
            </h2>
            <div className="space-y-3">
              {nonFavoriteOracles.map((oracle) => {
                const Icon = iconMap[oracle.icon] || Star;
                
                return (
                  <motion.div
                    key={oracle.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="glass-card hover:border-white/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={oracle.image} alt={oracle.name} />
                            <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}>
                              <Icon className="w-6 h-6 text-white" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-serif text-lg text-white">{oracle.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{oracle.role}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleFavorite(oracle.id)}
                            className="text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10"
                          >
                            <Heart className="w-5 h-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </section>
          
          {/* Empty State */}
          {orderedFavorites.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Heart className="w-12 h-12 mx-auto mb-4 text-rose-400/30" />
              <p>お気に入りの占い師を追加すると、</p>
              <p>ダッシュボードで優先表示されます</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
