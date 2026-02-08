import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { oracles } from "@/lib/oracles";
import MobileNav from "@/components/MobileNav";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, MessageSquare, Trash2, Clock, ChevronRight, Loader2, Crown, Lock, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Streamdown } from "streamdown";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function History() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [selectedOracleFilter, setSelectedOracleFilter] = useState<string | null>(null);

  // Check if user is premium
  const isPremium = user?.subscriptionStatus === "active";

  const { data: sessions, isLoading: sessionsLoading, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    { oracleId: selectedOracleFilter || undefined, limit: 50 },
    { enabled: !!user && isPremium }
  );

  const { data: sessionData, isLoading: messagesLoading } = trpc.chat.getSessionMessages.useQuery(
    { sessionId: selectedSessionId! },
    { enabled: !!selectedSessionId && isPremium }
  );

  const deleteSession = trpc.chat.deleteSession.useMutation({
    onSuccess: () => {
      refetchSessions();
      setSelectedSessionId(null);
    },
  });

  const getOracleInfo = (oracleId: string) => {
    return oracles.find(o => o.id === oracleId) || { name: "不明", color: "from-gray-500 to-gray-600" };
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">鑑定履歴を見るにはログインが必要です</p>
            <Link href="/">
              <Button>ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Premium-only gate
  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Navigation */}
        <MobileNav user={user} />

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-serif font-bold">鑑定履歴</h1>
                <p className="text-sm text-muted-foreground">過去の相談内容を振り返る</p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-16">
          <Card className="glass-card max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-purple-500/20 flex items-center justify-center">
                <Lock className="w-10 h-10 text-amber-400" />
              </div>
              <h2 className="text-2xl font-serif font-bold mb-4">プレミアム限定機能</h2>
              <p className="text-muted-foreground mb-6">
                鑑定履歴の閲覧は、プレミアムプランにアップグレードすると利用できます。
                過去の相談内容を振り返り、占い師からのアドバイスをいつでも確認できます。
              </p>
              <div className="space-y-3">
                <Link href="/subscription">
                  <Button className="w-full btn-primary" size="lg">
                    <Crown className="w-5 h-5 mr-2" />
                    プレミアムにアップグレード
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full" size="lg">
                    ダッシュボードに戻る
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-6">
                ※プレミアムプランにアップグレードすると、無料プラン時の鑑定履歴も引き継がれます
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <MobileNav user={user} />

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-serif font-bold">鑑定履歴</h1>
              <p className="text-sm text-muted-foreground">過去の相談内容を振り返る</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sessions List */}
          <div className="lg:col-span-1">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  セッション一覧
                </CardTitle>
                {/* Oracle Filter */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Button
                    variant={selectedOracleFilter === null ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedOracleFilter(null)}
                  >
                    すべて
                  </Button>
                  {oracles.map(oracle => (
                    <Button
                      key={oracle.id}
                      variant={selectedOracleFilter === oracle.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedOracleFilter(oracle.id)}
                    >
                      {oracle.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {sessionsLoading ? (
                  <div className="p-8 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : sessions && sessions.length > 0 ? (
                  <div className="divide-y divide-white/10">
                    {sessions.map(session => {
                      const oracle = getOracleInfo(session.oracleId);
                      return (
                        <button
                          key={session.id}
                          onClick={() => setSelectedSessionId(session.id)}
                          className={`w-full p-4 text-left hover:bg-white/5 transition-colors ${
                            selectedSessionId === session.id ? "bg-white/10" : ""
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${oracle.color} text-white`}>
                                  {oracle.name}
                                </span>
                              </div>
                              <p className="text-sm font-medium truncate">{session.title || "無題の相談"}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(session.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>まだ鑑定履歴がありません</p>
                    <Link href="/dashboard">
                      <Button variant="link" className="mt-2">
                        占い師に相談する
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Session Detail */}
          <div className="lg:col-span-2">
            {selectedSessionId && sessionData ? (
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {sessionData.session.title || "無題の相談"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {getOracleInfo(sessionData.session.oracleId).name}との会話 ・{" "}
                      {format(new Date(sessionData.session.createdAt), "yyyy年M月d日", { locale: ja })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Continue Conversation Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to dashboard with oracle and session info
                        const oracleId = sessionData.session.oracleId;
                        const sessionId = sessionData.session.id;
                        setLocation(`/dashboard?oracle=${oracleId}&session=${sessionId}`);
                      }}
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/20"
                    >
                      <PlayCircle className="w-4 h-4 mr-1" />
                      この会話を続ける
                    </Button>
                    <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>この履歴を削除しますか？</AlertDialogTitle>
                        <AlertDialogDescription>
                          この操作は取り消せません。この相談の全てのメッセージが削除されます。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>キャンセル</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteSession.mutate({ sessionId: selectedSessionId })}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          削除する
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {messagesLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      {sessionData.messages.map((message, index) => {
                        const oracle = getOracleInfo(sessionData.session.oracleId);
                        return (
                          <div
                            key={index}
                            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-white/10"
                              }`}
                            >
                              {message.role === "assistant" && (
                                <p className={`text-xs font-medium mb-1 bg-gradient-to-r ${oracle.color} bg-clip-text text-transparent`}>
                                  {oracle.name}
                                </p>
                              )}
                              {/* Display palm image if present (for Shion's palm reading) */}
                              {message.role === "user" && message.imageUrl && (
                                <div className="mb-2">
                                  <img
                                    src={message.imageUrl}
                                    alt="手相画像"
                                    className="max-w-[200px] rounded-lg border border-white/20"
                                    loading="lazy"
                                  />
                                </div>
                              )}
                              <div className="text-sm">
                                <Streamdown>{message.content}</Streamdown>
                              </div>
                              <p className="text-xs opacity-50 mt-2">
                                {format(new Date(message.createdAt), "HH:mm", { locale: ja })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>左側からセッションを選択してください</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
