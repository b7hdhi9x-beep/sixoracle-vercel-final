import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { 
  ArrowLeft, Users, GitMerge, Search, Shield, Moon, Loader2, AlertTriangle, Check, ArrowRight, History, ChevronDown, ChevronUp
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function AdminAccountMerge() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryAccount, setPrimaryAccount] = useState<any>(null);
  const [secondaryAccount, setSecondaryAccount] = useState<any>(null);
  const [mergeReason, setMergeReason] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
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
  
  // Search users
  const usersQuery = trpc.admin.getUsersForMerge.useQuery(
    { search: searchQuery, limit: 50 },
    { enabled: hasAccess && searchQuery.length >= 2 }
  );
  
  // Merge history query
  const [showHistory, setShowHistory] = useState(false);
  const mergeHistoryQuery = trpc.admin.getMergeHistory.useQuery(
    { limit: 20, offset: 0 },
    { enabled: hasAccess && showHistory }
  );
  
  // Merge accounts mutation
  const mergeMutation = trpc.admin.mergeAccounts.useMutation({
    onSuccess: (data) => {
      toast.success(`アカウントを統合しました（セッション: ${data.transferred.sessions}件、購入履歴: ${data.transferred.purchases}件）`);
      setShowConfirmModal(false);
      setPrimaryAccount(null);
      setSecondaryAccount(null);
      setMergeReason("");
    },
    onError: (error) => {
      toast.error(error.message || "統合に失敗しました");
    },
  });
  
  const handleSelectAccount = (account: any) => {
    if (!primaryAccount) {
      setPrimaryAccount(account);
      toast.info("メインアカウントを選択しました。次に統合するアカウントを選択してください。");
    } else if (!secondaryAccount && account.id !== primaryAccount.id) {
      setSecondaryAccount(account);
    } else if (account.id === primaryAccount.id) {
      setPrimaryAccount(null);
      setSecondaryAccount(null);
    } else if (account.id === secondaryAccount?.id) {
      setSecondaryAccount(null);
    }
  };
  
  const handleMerge = () => {
    if (!primaryAccount || !secondaryAccount || mergeReason.length < 10) {
      toast.error("統合理由を10文字以上入力してください");
      return;
    }
    mergeMutation.mutate({
      primaryAccountId: primaryAccount.id,
      secondaryAccountId: secondaryAccount.id,
      reason: mergeReason,
    });
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
  
  const users = usersQuery.data || [];
  
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
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <GitMerge className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">アカウント統合</h1>
                  <p className="text-xs text-muted-foreground">複数アカウントを1つに統合</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Selected Accounts */}
        {(primaryAccount || secondaryAccount) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="glass-card border-purple-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Primary Account */}
                  <div className="flex-1">
                    {primaryAccount ? (
                      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <p className="text-xs text-green-400 mb-1">メインアカウント（残る）</p>
                        <p className="font-semibold">{primaryAccount.name || primaryAccount.displayName || "名前なし"}</p>
                        <p className="text-xs text-muted-foreground">{primaryAccount.email || primaryAccount.loginMethod}</p>
                        <p className="text-xs text-muted-foreground">ID: {primaryAccount.id}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                        <p className="text-muted-foreground">メインアカウントを選択</p>
                      </div>
                    )}
                  </div>
                  
                  <ArrowRight className="w-6 h-6 text-purple-400 flex-shrink-0" />
                  
                  {/* Secondary Account */}
                  <div className="flex-1">
                    {secondaryAccount ? (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-400 mb-1">統合するアカウント（削除される）</p>
                        <p className="font-semibold">{secondaryAccount.name || secondaryAccount.displayName || "名前なし"}</p>
                        <p className="text-xs text-muted-foreground">{secondaryAccount.email || secondaryAccount.loginMethod}</p>
                        <p className="text-xs text-muted-foreground">ID: {secondaryAccount.id}</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-center">
                        <p className="text-muted-foreground">統合するアカウントを選択</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {primaryAccount && secondaryAccount && (
                  <div className="mt-4 flex justify-center">
                    <Button
                      onClick={() => setShowConfirmModal(true)}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <GitMerge className="w-4 h-4 mr-2" />
                      アカウントを統合
                    </Button>
                  </div>
                )}
                
                {(primaryAccount || secondaryAccount) && (
                  <div className="mt-2 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setPrimaryAccount(null);
                        setSecondaryAccount(null);
                      }}
                      className="text-muted-foreground"
                    >
                      選択をクリア
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ユーザー名、メールアドレス、OpenIDで検索..."
              className="pl-10 bg-white/5 border-white/10"
            />
          </div>
          {searchQuery.length > 0 && searchQuery.length < 2 && (
            <p className="text-xs text-muted-foreground mt-1">2文字以上入力してください</p>
          )}
        </div>
        
        {/* Users List */}
        {usersQuery.isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">検索中...</p>
          </div>
        ) : searchQuery.length < 2 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">ユーザーを検索して統合するアカウントを選択してください</p>
            </CardContent>
          </Card>
        ) : users.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">該当するユーザーが見つかりません</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {users.map((user, index) => {
              const isPrimary = primaryAccount?.id === user.id;
              const isSecondary = secondaryAccount?.id === user.id;
              
              return (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                >
                  <Card
                    className={`glass-card cursor-pointer transition-colors ${
                      isPrimary ? "border-green-500/50 bg-green-500/5" :
                      isSecondary ? "border-amber-500/50 bg-amber-500/5" :
                      "hover:border-white/20"
                    }`}
                    onClick={() => handleSelectAccount(user)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold truncate">
                              {user.name || user.displayName || "名前なし"}
                            </span>
                            {user.isPremium && (
                              <span className="text-xs px-2 py-0.5 rounded bg-gold/20 text-gold">
                                プレミアム
                              </span>
                            )}
                            {isPrimary && (
                              <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">
                                メイン
                              </span>
                            )}
                            {isSecondary && (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                統合対象
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>ID: {user.id}</span>
                            <span>{user.email || "メールなし"}</span>
                            <span>{user.loginMethod || "不明"}</span>
                            <span>
                              登録: {format(new Date(user.createdAt), "yyyy/MM/dd", { locale: ja })}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          {(isPrimary || isSecondary) ? (
                            <Check className={`w-5 h-5 ${isPrimary ? "text-green-400" : "text-amber-400"}`} />
                          ) : (
                            <div className="w-5 h-5 rounded border border-white/20" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* Merge History Section */}
        <div className="mt-12">
          <Card className="glass-card">
            <CardHeader 
              className="cursor-pointer"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-purple-400" />
                  <CardTitle className="text-lg">統合履歴</CardTitle>
                </div>
                {showHistory ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <CardDescription>過去のアカウント統合履歴を確認</CardDescription>
            </CardHeader>
            
            {showHistory && (
              <CardContent>
                {mergeHistoryQuery.isLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">読み込み中...</p>
                  </div>
                ) : mergeHistoryQuery.data?.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">統合履歴はありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {mergeHistoryQuery.data?.map((history: any) => {
                      const snapshot = typeof history.mergedAccountSnapshot === 'string' 
                        ? JSON.parse(history.mergedAccountSnapshot) 
                        : history.mergedAccountSnapshot;
                      const transferred = typeof history.transferredData === 'string'
                        ? JSON.parse(history.transferredData)
                        : history.transferredData;
                      
                      return (
                        <div 
                          key={history.id}
                          className="p-4 bg-white/5 border border-white/10 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <GitMerge className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-medium">
                                ID {history.primaryAccountId} ← ID {history.mergedAccountId}
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(history.createdAt), "yyyy/MM/dd HH:mm", { locale: ja })}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                            <div className="p-2 bg-green-500/10 border border-green-500/20 rounded">
                              <p className="text-green-400 mb-1">メインアカウント</p>
                              <p className="text-muted-foreground">ID: {history.primaryAccountId}</p>
                            </div>
                            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded">
                              <p className="text-amber-400 mb-1">統合されたアカウント</p>
                              <p className="text-muted-foreground">
                                {snapshot?.name || snapshot?.displayName || '名前なし'}
                              </p>
                              <p className="text-muted-foreground">{snapshot?.email || snapshot?.loginMethod || ''}</p>
                            </div>
                          </div>
                          
                          {transferred && (
                            <div className="flex flex-wrap gap-2 text-xs mb-3">
                              {transferred.sessions > 0 && (
                                <span className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded">
                                  セッション: {transferred.sessions}件
                                </span>
                              )}
                              {transferred.purchases > 0 && (
                                <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                                  購入履歴: {transferred.purchases}件
                                </span>
                              )}
                              {transferred.bonusReadings > 0 && (
                                <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded">
                                  ボーナス: {transferred.bonusReadings}回
                                </span>
                              )}
                              {transferred.premiumTransferred && (
                                <span className="px-2 py-1 bg-gold/20 text-gold rounded">
                                  プレミアム移行
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">理由:</span> {history.mergeReason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground/50">
        <p className="flex items-center justify-center gap-2">
          <Moon className="w-4 h-4" />
          六神ノ間 管理者ダッシュボード
        </p>
      </footer>
      
      {/* Confirm Modal */}
      {showConfirmModal && primaryAccount && secondaryAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-lg mx-4 shadow-2xl"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <GitMerge className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">アカウント統合の確認</h3>
              <p className="text-muted-foreground text-sm">
                この操作は取り消せません。統合理由を入力してください。
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="text-xs text-green-400 mb-1">メインアカウント（残る）</p>
                <p className="font-semibold">{primaryAccount.name || primaryAccount.displayName || "名前なし"}</p>
                <p className="text-xs text-muted-foreground">ID: {primaryAccount.id}</p>
              </div>
              
              <div className="text-center">
                <ArrowRight className="w-5 h-5 text-purple-400 mx-auto rotate-90" />
              </div>
              
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-xs text-red-400 mb-1">統合するアカウント（ブロックされる）</p>
                <p className="font-semibold">{secondaryAccount.name || secondaryAccount.displayName || "名前なし"}</p>
                <p className="text-xs text-muted-foreground">ID: {secondaryAccount.id}</p>
              </div>
              
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-300">
                    <p className="font-semibold mb-1">統合される内容:</p>
                    <ul className="list-disc list-inside text-muted-foreground">
                      <li>鑑定履歴（チャットセッション）</li>
                      <li>購入履歴</li>
                      <li>ボーナス鑑定回数</li>
                      <li>プレミアム状態（より良い方を維持）</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">統合理由（10文字以上）</label>
                <textarea
                  value={mergeReason}
                  onChange={(e) => setMergeReason(e.target.value)}
                  placeholder="例：同一ユーザーが電話番号とメールアドレスで別々にアカウントを作成したため統合"
                  className="w-full h-24 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-muted-foreground resize-none focus:outline-none focus:border-purple-500/50"
                />
                <p className="text-xs text-muted-foreground text-right mt-1">
                  {mergeReason.length}/10文字以上
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmModal(false);
                  setMergeReason("");
                }}
                className="border-white/20"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleMerge}
                disabled={mergeReason.length < 10 || mergeMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {mergeMutation.isPending ? "統合中..." : "統合を実行"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
