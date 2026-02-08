import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { getOracleById } from "@/lib/oracles";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { ArrowLeft, Clock, Heart, Calculator, Lightbulb, Moon, Shield, Share2, Download, Crown, Lock, MessageCircle, Sparkles, Trash2 } from "lucide-react";
import { Link, useLocation, useParams } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

// Icon mapping for oracles
const iconMap: Record<string, any> = {
  Clock, Heart, Calculator, Lightbulb, Moon, Shield
};

export default function ReadingHistoryDetail() {
  const { user, loading: authLoading } = useAuth();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const sessionId = parseInt(params.id || "0");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Get session details with messages
  const { data, isLoading } = trpc.chat.getSessionMessages.useQuery(
    { sessionId },
    { enabled: !!user && sessionId > 0 }
  );
  
  // Delete session mutation
  const deleteSessionMutation = trpc.chat.deleteSession.useMutation({
    onSuccess: () => {
      toast.success("鑑定履歴を削除しました");
      navigate("/history");
    },
    onError: (error) => {
      toast.error(error.message || "削除に失敗しました");
    },
  });
  
  const handleDelete = () => {
    if (!sessionId) return;
    deleteSessionMutation.mutate({ sessionId });
  };
  
  const isPremium = user?.isPremium || false;
  
  // Handle share
  const handleShare = async () => {
    if (!data?.session) return;
    
    const oracle = getOracleById(data.session.oracleId);
    const shareText = `🔮 ${oracle?.name || '占い師'}による鑑定結果\n\n「${data.session.title}」\n\n六神ノ間で占いを体験してみませんか？`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "六神ノ間 - 鑑定結果",
          text: shareText,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareText + "\n" + window.location.href);
      toast.success("シェア用テキストをコピーしました");
    }
  };
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">鑑定内容を読み込んでいます...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    navigate("/");
    return null;
  }
  
  if (!data?.session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">鑑定が見つかりません</h2>
          <Link href="/history">
            <Button>履歴一覧に戻る</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const oracle = getOracleById(data.session.oracleId);
  const Icon = oracle ? iconMap[oracle.icon] : Clock;
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical Background */}
      <div className="fixed inset-0 z-0">
        {/* Star field */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-purple-950/30 to-slate-950" />
        {[...Array(80)].map((_, i) => (
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
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-5">
          <div className="absolute inset-0 border-2 border-amber-400/50 rounded-full animate-[spin_60s_linear_infinite]" />
          <div className="absolute inset-8 border border-purple-400/50 rounded-full animate-[spin_45s_linear_infinite_reverse]" />
        </div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/history">
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${oracle?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">{oracle?.name || '占い師'}の鑑定</h1>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(data.session.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white/70 hover:text-white"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-400/70 hover:text-red-400 hover:bg-red-400/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="relative z-10 container mx-auto px-4 py-8 max-w-3xl">
        {/* Session Title Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card mb-6 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${oracle?.color || 'from-gray-600 to-gray-800'}`} />
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-2">{data.session.title || "鑑定セッション"}</h2>
              {data.session.summary && (
                <div className="mt-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-amber-300">鑑定のまとめ</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">
                    「{data.session.summary}」
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Chat Log */}
        {isPremium ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">会話ログ</h3>
            </div>
            <div className="space-y-4">
              {data.messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, x: message.role === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] ${message.role === "user" ? "order-2" : "order-1"}`}>
                    {message.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${oracle?.color || 'from-gray-600 to-gray-800'} flex items-center justify-center`}>
                          <Icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-muted-foreground">{oracle?.name}</span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-4 py-3 ${
                      message.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-br-md" 
                        : "bg-white/10 border border-white/10 rounded-bl-md"
                    }`}>
                      {message.role === "assistant" ? (
                        <div className="prose prose-invert prose-sm max-w-none">
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                      ) : (
                        <p className="text-sm">{message.content}</p>
                      )}
                    </div>
                    <p className={`text-xs text-muted-foreground mt-1 ${message.role === "user" ? "text-right" : ""}`}>
                      {format(new Date(message.createdAt), "HH:mm", { locale: ja })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* Locked Content for Free Users */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Lock className="w-10 h-10 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-amber-300 mb-3">
                  会話ログはプレミアム限定
                </h3>
                <p className="text-muted-foreground mb-6">
                  プレミアムプランにアップグレードすると、<br />
                  すべての鑑定の会話ログを閲覧できます
                </p>
                <div className="space-y-3">
                  <Link href="/pricing">
                    <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold">
                      <Crown className="w-4 h-4 mr-2" />
                      プレミアムにアップグレード
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    月額980円で全機能が使い放題
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Share Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card className="glass-card overflow-hidden">
            <div className="absolute inset-0 opacity-5">
              {/* Decorative magic circle for screenshot */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" fill="none" />
                <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.3" fill="none" />
                <polygon points="100,20 180,100 100,180 20,100" stroke="currentColor" strokeWidth="0.3" fill="none" />
              </svg>
            </div>
            <CardContent className="p-6 relative">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  この鑑定結果をシェアしませんか？
                </p>
                <Button 
                  variant="outline" 
                  className="border-primary/50 hover:bg-primary/10"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  シェアする
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-sm text-muted-foreground/50">
        <p className="flex items-center justify-center gap-2">
          <Moon className="w-4 h-4" />
          六神ノ間
        </p>
      </footer>
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">鑑定履歴を削除しますか？</h3>
              <p className="text-muted-foreground text-sm mb-6">
                この鑑定履歴は削除されます。<br />
                削除後は履歴一覧に表示されなくなります。
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-white/20"
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete();
                    setShowDeleteConfirm(false);
                  }}
                  disabled={deleteSessionMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteSessionMutation.isPending ? "削除中..." : "削除する"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
