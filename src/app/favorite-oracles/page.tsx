"use client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApiQuery, useApiMutation } from "@/lib/api";
import { oracles, getOracleById } from "@/lib/oracles";
import { ArrowLeft, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Star, Sparkles, GripVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { motion, Reorder } from "framer-motion";
import { toast } from "sonner";

const iconMap: Record<string, any> = { Clock, Heart, Calculator, Lightbulb, Moon, Shield };

export default function FavoriteOracles() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [orderedFavorites, setOrderedFavorites] = useState<string[]>([]);

  const { data: favorites, isLoading: favoritesLoading, refetch } = useApiQuery<any[]>(
    user ? "/api/favorites/list" : null,
    { enabled: !!user }
  );

  const addFavoriteMutation = useApiMutation("/api/favorites/add", {
    onSuccess: () => refetch(),
  });

  const removeFavoriteMutation = useApiMutation("/api/favorites/remove", {
    onSuccess: () => refetch(),
  });

  const reorderFavoritesMutation = useApiMutation("/api/favorites/reorder");

  useEffect(() => {
    if (favorites) {
      setOrderedFavorites(favorites.map((f: any) => f.oracleId));
    }
  }, [favorites]);

  const toggleFavorite = useCallback((oracleId: string) => {
    if (orderedFavorites.includes(oracleId)) {
      removeFavoriteMutation.mutate({ oracleId });
      setOrderedFavorites(prev => prev.filter(id => id !== oracleId));
    } else {
      addFavoriteMutation.mutate({ oracleId });
      setOrderedFavorites(prev => [...prev, oracleId]);
    }
  }, [orderedFavorites, addFavoriteMutation, removeFavoriteMutation]);

  const handleReorder = (newOrder: string[]) => {
    setOrderedFavorites(newOrder);
    reorderFavoritesMutation.mutate({ oracleIds: newOrder });
  };

  if (loading || favoritesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const nonFavoriteOracles = oracles.filter(o => !orderedFavorites.includes(o.id));

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
      </div>

      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                お気に入り占い師
              </h1>
              <p className="text-xs text-muted-foreground">ドラッグで並び替えできます</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          {orderedFavorites.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                お気に入り ({orderedFavorites.length})
              </h2>
              <Reorder.Group axis="y" values={orderedFavorites} onReorder={handleReorder} className="space-y-3">
                {orderedFavorites.map((oracleId) => {
                  const oracle = getOracleById(oracleId);
                  if (!oracle) return null;
                  const Icon = iconMap[oracle.icon] || Star;
                  return (
                    <Reorder.Item key={oracleId} value={oracleId} className="cursor-grab active:cursor-grabbing">
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
                            <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); toggleFavorite(oracleId); }} className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10">
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

          <section>
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              {orderedFavorites.length > 0 ? "その他の占い師" : "すべての占い師"}
            </h2>
            <div className="space-y-3">
              {nonFavoriteOracles.map((oracle) => {
                const Icon = iconMap[oracle.icon] || Star;
                return (
                  <motion.div key={oracle.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <Card className="glass-card hover:border-white/30 transition-all">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-14 h-14">
                            <AvatarImage src={oracle.image} alt={oracle.name} />
                            <AvatarFallback className={`bg-gradient-to-br ${oracle.color}`}><Icon className="w-6 h-6 text-white" /></AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="font-serif text-lg text-white">{oracle.name}</div>
                            <div className="text-sm text-muted-foreground truncate">{oracle.role}</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => toggleFavorite(oracle.id)} className="text-muted-foreground hover:text-rose-400 hover:bg-rose-400/10">
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
