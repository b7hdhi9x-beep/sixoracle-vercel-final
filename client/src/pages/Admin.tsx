import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  MessageSquare, Mail, Users, BarChart3, 
  ArrowRight, Shield, Home, Moon, Ticket, Loader2, Sparkles, CreditCard, Key, Crown, Gift, Wallet, Trash2, GitMerge, UserSearch
} from "lucide-react";

export default function Admin() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  
  // Check for token in URL or sessionStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const storedToken = sessionStorage.getItem('adminToken');
    
    if (urlToken) {
      setToken(urlToken);
      // Store token in sessionStorage for navigation within admin pages
      sessionStorage.setItem('adminToken', urlToken);
    } else if (storedToken) {
      setToken(storedToken);
    } else {
      // No token found - deny access
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
        // Invalid token - clear storage
        sessionStorage.removeItem('adminToken');
      }
    }
    if (tokenValidation.error) {
      setHasAccess(false);
      setIsChecking(false);
    }
  }, [tokenValidation.data, tokenValidation.error]);
  
  // Get stats (only if has access)
  const feedbackStatsQuery = trpc.feedback.getStats.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  // Get all contact inquiries to calculate stats
  const contactQuery = trpc.contact.getAll.useQuery(undefined, {
    enabled: hasAccess,
  });
  
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
  
  const feedbackStats = feedbackStatsQuery.data;
  const contactData = contactQuery.data || [];
  
  // Calculate contact stats from data
  const pendingFeedback = feedbackStats?.statusStats?.pending || 0;
  const pendingInquiries = contactData.filter(c => c.status === "new").length;
  const totalInquiries = contactData.length;
  
  // Helper to append token to admin links
  const getAdminLink = (path: string) => {
    return `${path}?token=${token}`;
  };
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">管理者ダッシュボード</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-admin-primary/30 text-white hover:bg-admin-primary/20">
              <Home className="w-4 h-4 mr-2" />
              占いダッシュボードへ
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">ようこそ、管理者さん</h2>
          <p className="text-muted-foreground">六神ノ間の管理画面です。サイトの運営状況を確認できます。</p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未対応の意見</p>
                  <p className="text-3xl font-bold text-white">{pendingFeedback}</p>
                </div>
                <MessageSquare className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未対応の問い合わせ</p>
                  <p className="text-3xl font-bold text-white">{pendingInquiries}</p>
                </div>
                <Mail className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総意見数</p>
                  <p className="text-3xl font-bold text-white">{feedbackStats?.total || 0}</p>
                </div>
                <BarChart3 className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総問い合わせ数</p>
                  <p className="text-3xl font-bold text-white">{totalInquiries}</p>
                </div>
                <Users className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Management Cards */}
        <h3 className="text-lg font-semibold mb-4">管理メニュー</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href={getAdminLink("/admin/feedback")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">意見箱管理</CardTitle>
                    <CardDescription>ユーザーからの意見・要望を管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {pendingFeedback > 0 ? (
                      <span className="text-yellow-500">未対応: {pendingFeedback}件</span>
                    ) : (
                      <span className="text-green-500">すべて対応済み</span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/inquiries")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">問い合わせ管理</CardTitle>
                    <CardDescription>ユーザーからの問い合わせを管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {pendingInquiries > 0 ? (
                      <span className="text-yellow-500">未対応: {pendingInquiries}件</span>
                    ) : (
                      <span className="text-green-500">すべて対応済み</span>
                    )}
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/users")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">ユーザー管理</CardTitle>
                    <CardDescription>登録ユーザーの管理・編集</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ユーザーの権限・プレミアム状態を管理
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/coupons")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <Ticket className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">クーポン管理</CardTitle>
                    <CardDescription>プロモコードの作成・管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    プレミアム化・ボーナス鑑定のクーポンを発行
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/stats")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">統計ダッシュボード</CardTitle>
                    <CardDescription>ユーザー・鑑定・売上統計</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    サービス全体の統計情報を確認
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/subscription-stats")}>
            <Card className="glass-card-admin hover:border-yellow-500/50 transition-colors cursor-pointer group border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">サブスク管理</CardTitle>
                    <CardDescription>月次合言葉・更新リマインド・メール送信</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    継続ユーザーへの自動通知・合言葉管理
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/referral-analytics")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">紹介分析</CardTitle>
                    <CardDescription>占い師間の紹介・トピック分析</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    占い師間の紹介フローと相談トピックを分析
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/bank-transfers")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">振込申請管理</CardTitle>
                    <CardDescription>銀行振込申請の確認・合言葉発行</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    振込確認後、ワンクリックで合言葉を発行
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/upgrade-requests")}>
            <Card className="glass-card-admin hover:border-yellow-500/50 transition-colors cursor-pointer group border-yellow-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <Crown className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">アップグレード申請</CardTitle>
                    <CardDescription>月額プランへのアップグレード申請を承認</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    ワンクリックでプレミアム有効化
                  </div>
                  <ArrowRight className="w-5 h-5 text-yellow-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/activation-codes")}>
            <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer group">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-admin-primary/20">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-white">合言葉一覧</CardTitle>
                    <CardDescription>発行済み合言葉の管理・使用状況確認</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    全ての合言葉を検索・管理
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/monthly-code")}>
            <Card className="glass-card-admin hover:border-purple-500/50 transition-colors cursor-pointer group border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <Sparkles className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">今月の合言葉</CardTitle>
                    <CardDescription>毎月ランダムに入れ替わる合言葉を管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    1人1回のみ使用可能な合言葉を発行
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/referrals")}>
            <Card className="glass-card-admin hover:border-emerald-500/50 transition-colors cursor-pointer group border-emerald-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-emerald-500/20">
                    <Gift className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">紹介一元管理</CardTitle>
                    <CardDescription>紹介者・被紹介者の関係を一元管理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    紹介報酬のステータス・トップ紹介者を確認
                  </div>
                  <ArrowRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/withdrawals")}>
            <Card className="glass-card-admin hover:border-blue-500/50 transition-colors cursor-pointer group border-blue-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <Wallet className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">出金申請管理</CardTitle>
                    <CardDescription>出金申請の承認・振込処理</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    未処理・処理中・振込済みの出金申請を管理
                  </div>
                  <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/deleted-sessions")}>
            <Card className="glass-card-admin hover:border-red-500/50 transition-colors cursor-pointer group border-red-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <Trash2 className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">削除済み履歴</CardTitle>
                    <CardDescription>削除された鑑定履歴の管理・復元</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    犯罪防止目的で削除済み履歴を確認・復元
                  </div>
                  <ArrowRight className="w-5 h-5 text-red-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/account-merge")}>
            <Card className="glass-card-admin hover:border-purple-500/50 transition-colors cursor-pointer group border-purple-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-purple-500/20">
                    <GitMerge className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">アカウント統合</CardTitle>
                    <CardDescription>複数アカウントを1つに統合</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    電話番号・メールで別々に登録したアカウントを統合
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href={getAdminLink("/admin/suspicious-accounts")}>
            <Card className="glass-card-admin hover:border-orange-500/50 transition-colors cursor-pointer group border-orange-500/30">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-orange-500/20">
                    <UserSearch className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <CardTitle className="text-white">疑わしいアカウント</CardTitle>
                    <CardDescription>複数アカウントの不正利用を検出</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    同一デバイス・IP・名前などのパターンを検出
                  </div>
                  <ArrowRight className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
        
        {/* Footer Info */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p className="flex items-center justify-center gap-2">
            <Moon className="w-4 h-4" />
            六神ノ間 管理者ダッシュボード
          </p>
          <p className="mt-1">秘密トークンによるアクセス</p>
        </div>
      </main>
    </div>
  );
}
