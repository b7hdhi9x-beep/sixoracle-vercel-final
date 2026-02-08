import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { oracles, getOracleById } from "@/lib/oracles";
import { ArrowLeft, Bell, Calendar, Sun, Moon, Sparkles, Clock, Star, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function MessageSettings() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  
  // Get user's message preferences
  const { data: preferences, isLoading: prefsLoading, refetch } = trpc.scheduledMessages.getPreferences.useQuery(
    undefined,
    { enabled: !!user }
  );
  
  // Update preferences mutation
  const updatePrefsMutation = trpc.scheduledMessages.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("設定を保存しました");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "設定の保存に失敗しました");
    },
  });
  
  // Get user's favorite oracles
  const { data: favorites } = trpc.favorites.list.useQuery(undefined, { enabled: !!user });
  
  const handleToggle = (key: string, value: boolean) => {
    updatePrefsMutation.mutate({ [key]: value });
  };
  
  const handleOracleSelect = (key: string, value: string | null) => {
    updatePrefsMutation.mutate({ [key]: value === "random" ? null : value });
  };
  
  const handleHourSelect = (hour: string) => {
    updatePrefsMutation.mutate({ preferredDeliveryHour: parseInt(hour) });
  };
  
  if (authLoading || prefsLoading) {
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
  
  // Get oracle options (favorites first, then all)
  const favoriteOracleIds = favorites?.map(f => f.oracleId) || [];
  const sortedOracles = [
    ...oracles.filter(o => favoriteOracleIds.includes(o.id)),
    ...oracles.filter(o => !favoriteOracleIds.includes(o.id)),
  ];
  
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
            <Link href="/profile">
              <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Bell className="w-6 h-6 text-amber-400" />
              <h1 className="text-xl font-bold text-white">定期メッセージ設定</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          {/* Weekly Fortune */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">週間運勢</CardTitle>
                    <CardDescription>毎週月曜日に運勢をお届け</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={preferences?.weeklyFortuneEnabled ?? true}
                  onCheckedChange={(checked) => handleToggle("weeklyFortuneEnabled", checked)}
                />
              </div>
            </CardHeader>
            {preferences?.weeklyFortuneEnabled && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground">担当占い師</label>
                  <Select
                    value={preferences?.weeklyFortuneOracleId || "random"}
                    onValueChange={(value) => handleOracleSelect("weeklyFortuneOracleId", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="占い師を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>ランダム（毎週変わる）</span>
                        </div>
                      </SelectItem>
                      {sortedOracles.map((oracle) => {
                        const isFavorite = favoriteOracleIds.includes(oracle.id);
                        return (
                          <SelectItem key={oracle.id} value={oracle.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={oracle.image} />
                                <AvatarFallback className={`bg-gradient-to-br ${oracle.color} text-[10px]`}>
                                  {oracle.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{oracle.name}</span>
                              {isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Daily Fortune */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    <Sun className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">毎日の運勢</CardTitle>
                    <CardDescription>毎朝、今日の運勢をお届け</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={preferences?.dailyFortuneEnabled ?? false}
                  onCheckedChange={(checked) => handleToggle("dailyFortuneEnabled", checked)}
                />
              </div>
            </CardHeader>
            {preferences?.dailyFortuneEnabled && (
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <label className="text-sm text-muted-foreground">担当占い師</label>
                  <Select
                    value={preferences?.dailyFortuneOracleId || "random"}
                    onValueChange={(value) => handleOracleSelect("dailyFortuneOracleId", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="占い師を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="random">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                          <span>ランダム（毎日変わる）</span>
                        </div>
                      </SelectItem>
                      {sortedOracles.map((oracle) => {
                        const isFavorite = favoriteOracleIds.includes(oracle.id);
                        return (
                          <SelectItem key={oracle.id} value={oracle.id}>
                            <div className="flex items-center gap-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={oracle.image} />
                                <AvatarFallback className={`bg-gradient-to-br ${oracle.color} text-[10px]`}>
                                  {oracle.name[0]}
                                </AvatarFallback>
                              </Avatar>
                              <span>{oracle.name}</span>
                              {isFavorite && <Star className="w-3 h-3 text-amber-400 fill-amber-400" />}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            )}
          </Card>
          
          {/* Seasonal Messages */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">季節のメッセージ</CardTitle>
                    <CardDescription>季節の変わり目や特別な日にお届け</CardDescription>
                  </div>
                </div>
                <Switch
                  checked={preferences?.seasonalMessagesEnabled ?? true}
                  onCheckedChange={(checked) => handleToggle("seasonalMessagesEnabled", checked)}
                />
              </div>
            </CardHeader>
          </Card>
          
          {/* Delivery Time */}
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">配信時間</CardTitle>
                  <CardDescription>メッセージを受け取る時間帯</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Select
                value={String(preferences?.preferredDeliveryHour ?? 8)}
                onValueChange={handleHourSelect}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="時間を選択" />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10, 11, 12, 18, 19, 20, 21, 22].map((hour) => (
                    <SelectItem key={hour} value={String(hour)}>
                      {hour}:00
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {/* Info */}
          <div className="text-center text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              メッセージは通知ページで確認できます
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
