import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Users, Crown, UserPlus, MessageSquare, 
  Ticket, Gift, ArrowLeft, Shield, TrendingUp,
  BarChart3
} from "lucide-react";

export default function AdminStats() {
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
    { enabled: !!token, retry: false }
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
  
  // Get stats (only for admins)
  const statsQuery = trpc.admin.getStats.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  // Show loading spinner while checking token
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background admin-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
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
  
  const stats = statsQuery.data;
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/admin?token=${token}`}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-admin-primary/20">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <BarChart3 className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">統計ダッシュボード</h1>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {statsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-primary"></div>
          </div>
        ) : (
          <>
            {/* User Statistics */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-white" />
              ユーザー統計
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">総ユーザー数</p>
                      <p className="text-3xl font-bold text-white">{stats?.users.total || 0}</p>
                    </div>
                    <Users className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">プレミアム会員</p>
                      <p className="text-3xl font-bold text-white">{stats?.users.premium || 0}</p>
                    </div>
                    <Crown className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">スタンダード会員</p>
                      <p className="text-3xl font-bold text-white">{stats?.users.standard || 0}</p>
                    </div>
                    <Users className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">本日の新規</p>
                      <p className="text-3xl font-bold text-green-400">{stats?.users.newToday || 0}</p>
                    </div>
                    <UserPlus className="w-10 h-10 text-green-400/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Chat Statistics */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-white" />
              鑑定統計
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">総セッション数</p>
                      <p className="text-3xl font-bold text-white">{stats?.chat.totalSessions || 0}</p>
                    </div>
                    <MessageSquare className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">総メッセージ数</p>
                      <p className="text-3xl font-bold text-white">{stats?.chat.totalMessages || 0}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Coupon & Referral Statistics */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ticket className="w-5 h-5 text-white" />
              クーポン・紹介統計
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">有効クーポン数</p>
                      <p className="text-3xl font-bold text-white">{stats?.coupons.active || 0}</p>
                    </div>
                    <Ticket className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">クーポン使用回数</p>
                      <p className="text-3xl font-bold text-white">{stats?.coupons.totalRedemptions || 0}</p>
                    </div>
                    <TrendingUp className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">紹介成功数</p>
                      <p className="text-3xl font-bold text-white">{stats?.referrals.total || 0}</p>
                    </div>
                    <Gift className="w-10 h-10 text-white/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Links */}
            <h2 className="text-lg font-semibold mb-4">クイックリンク</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/admin/users?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-white" />
                    <span>ユーザー管理</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/admin/coupons?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Ticket className="w-5 h-5 text-white" />
                    <span>クーポン管理</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/admin?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Shield className="w-5 h-5 text-white" />
                    <span>管理者トップ</span>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
