import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { 
  ArrowLeft, Trash2, RotateCcw, Eye, Shield, Moon, Loader2, AlertTriangle, ChevronLeft, ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getOracleById } from "@/lib/oracles";

export default function AdminDeletedSessions() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [viewReason, setViewReason] = useState("");
  const [restoreReason, setRestoreReason] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  
  const ITEMS_PER_PAGE = 20;
  
  // Check for token in URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = sessionStorage.getItem('adminToken');
    
    if (urlToken) {
      setToken(urlToken);
      sessionStorage.setItem('adminToken', urlToken);
    } else if (storedToken) {
      setToken(storedToken);
    } else {
      setIsChecking(false);
      setHasAccess(false);
    }
  }, []);
  
  // Validate token with server
  const tokenValidation = trpc.adminAccess.validateToken.useQuery(
    { token: token || "" },
    { 
      enabled: !!token,
      retry: false,
    }
  );
  
  // Handle token validation result
  useEffect(() => {
    if (tokenValidation.data !== undefined) {
      setHasAccess(tokenValidation.data.valid);
      setIsChecking(false);
      
      if (!tokenValidation.data.valid) {
        sessionStorage.removeItem('adminToken');
      }
    }
    if (tokenValidation.error) {
      setHasAccess(false);
      setIsChecking(false);
    }
  }, [tokenValidation.data, tokenValidation.error]);
  
  // Get deleted sessions
  const deletedSessionsQuery = trpc.admin.getDeletedSessions.useQuery(
    { limit: ITEMS_PER_PAGE, offset: page * ITEMS_PER_PAGE },
    { enabled: hasAccess }
  );
  
  // View session content mutation
  const viewContentQuery = trpc.admin.viewDeletedSessionContent.useQuery(
    { sessionId: selectedSession || 0, reason: viewReason },
    { enabled: showViewModal && !!selectedSession && viewReason.length >= 10 }
  );
  
  // Restore session mutation
  const restoreMutation = trpc.admin.restoreDeletedSession.useMutation({
    onSuccess: () => {
      toast.success("鑑定履歴を復元しました");
      setShowRestoreModal(false);
      setRestoreReason("");
      setSelectedSession(null);
      deletedSessionsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "復元に失敗しました");
    },
  });
  
  const handleViewContent = (sessionId: number) => {
    setSelectedSession(sessionId);
    setViewReason("");
    setShowViewModal(true);
  };
  
  const handleRestoreSession = (sessionId: number) => {
    setSelectedSession(sessionId);
    setRestoreReason("");
    setShowRestoreModal(true);
  };
  
  const confirmRestore = () => {
    if (!selectedSession || restoreReason.length < 10) {
      toast.error("復元理由を10文字以上入力してください");
      return;
    }
    restoreMutation.mutate({ sessionId: selectedSession, reason: restoreReason });
  };
  
  const getAdminLink = (path: string) => {
    return token ? `${path}?token=${token}` : path;
  };
  
  // Show loading spinner while checking token
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background admin-bg">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-muted-foreground">認証確認中...</p>
        </div>
      </div>
    );
  }
  
  // If no access, show 404-like page
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background admin-bg">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">ページが見つかりません</h1>
            <p className="text-muted-foreground mb-4">お探しのページは存在しないか、移動した可能性があります。</p>
            <Link href="/">
              <Button className="btn-admin-primary">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const sessions = deletedSessionsQuery.data || [];
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={getAdminLink("/admin")}>
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/20">
                  <Trash2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">削除済み履歴管理</h1>
                  <p className="text-xs text-muted-foreground">犯罪防止目的での確認・復元</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="border-amber-500/30 bg-amber-500/10">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">プライバシー保護に関する注意</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    削除済み履歴の閲覧は犯罪防止目的に限定されます。閲覧・復元操作はすべて監査ログに記録されます。
                    不正な閲覧は厳禁です。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Sessions List */}
        {deletedSessionsQuery.isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">読み込み中...</p>
          </div>
        ) : sessions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">削除済みの履歴はありません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, index) => {
              const oracle = getOracleById(session.oracleId);
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="glass-card hover:border-white/20 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-semibold text-white truncate">
                              {session.title || "無題のセッション"}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-muted-foreground">
                              {oracle?.name || "不明"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>ユーザーID: {session.userId}</span>
                            <span>カテゴリ: {session.category || "なし"}</span>
                            <span>
                              削除日: {session.deletedAt ? format(new Date(session.deletedAt), "yyyy/MM/dd HH:mm", { locale: ja }) : "不明"}
                            </span>
                          </div>
                          {session.deletedReason && (
                            <p className="text-xs text-amber-400/80 mt-1">
                              削除理由: {session.deletedReason}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            onClick={() => handleViewContent(session.id)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            内容確認
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                            onClick={() => handleRestoreSession(session.id)}
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            復元
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
            
            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className="border-white/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                前へ
              </Button>
              <span className="text-sm text-muted-foreground">
                ページ {page + 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={sessions.length < ITEMS_PER_PAGE}
                onClick={() => setPage(p => p + 1)}
                className="border-white/20"
              >
                次へ
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground/50">
        <p className="flex items-center justify-center gap-2">
          <Moon className="w-4 h-4" />
          六神ノ間 管理者ダッシュボード
        </p>
      </footer>
      
      {/* View Content Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-y-auto"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Eye className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">削除済み履歴の閲覧</h3>
              <p className="text-muted-foreground text-sm">
                閲覧理由を入力してください（10文字以上）。<br />
                この操作は監査ログに記録されます。
              </p>
            </div>
            
            {viewReason.length < 10 ? (
              <div className="space-y-4">
                <textarea
                  value={viewReason}
                  onChange={(e) => setViewReason(e.target.value)}
                  placeholder="閲覧理由を入力してください（例：ユーザーからの通報により内容確認が必要）"
                  className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-amber-500/50"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {viewReason.length}/10文字以上
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false);
                      setViewReason("");
                      setSelectedSession(null);
                    }}
                    className="border-white/20"
                  >
                    キャンセル
                  </Button>
                  <Button
                    disabled={viewReason.length < 10}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    内容を表示
                  </Button>
                </div>
              </div>
            ) : viewContentQuery.isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            ) : viewContentQuery.data ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-semibold mb-2">セッション情報</h4>
                  <p className="text-sm text-muted-foreground">
                    タイトル: {viewContentQuery.data.session.title || "無題"}
                  </p>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {viewContentQuery.data.messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.role === "user" ? "bg-primary/20 ml-8" : "bg-white/5 mr-8"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground mb-1">
                        {msg.role === "user" ? "ユーザー" : "占い師"}
                      </p>
                      <p className="text-sm">{msg.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewModal(false);
                      setViewReason("");
                      setSelectedSession(null);
                    }}
                    className="border-white/20"
                  >
                    閉じる
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-400">内容を取得できませんでした</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setViewReason("");
                    setSelectedSession(null);
                  }}
                  className="border-white/20 mt-4"
                >
                  閉じる
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
      
      {/* Restore Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-md mx-4 shadow-2xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">鑑定履歴を復元</h3>
              <p className="text-muted-foreground text-sm mb-4">
                復元理由を入力してください（10文字以上）。<br />
                この操作は監査ログに記録されます。
              </p>
              
              <textarea
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="復元理由を入力してください（例：誤削除のため復元）"
                className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-green-500/50 mb-2"
              />
              <p className="text-xs text-muted-foreground text-right mb-4">
                {restoreReason.length}/10文字以上
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRestoreModal(false);
                    setRestoreReason("");
                    setSelectedSession(null);
                  }}
                  className="border-white/20"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={confirmRestore}
                  disabled={restoreReason.length < 10 || restoreMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {restoreMutation.isPending ? "復元中..." : "復元する"}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
