import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Crown, Clock, AlertTriangle, Bell, 
  ArrowLeft, Shield, RefreshCw, Loader2,
  Calendar, Users, CheckCircle, XCircle,
  Mail, Send, Settings, Play
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSubscriptionStats() {
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
  
  // Get subscription stats
  // @ts-expect-error - tRPC types may not be fully updated yet
  const statsQuery = trpc.rewards.getSubscriptionStats.useQuery(undefined, {
    enabled: hasAccess,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Get current monthly code
  // @ts-expect-error - tRPC types may not be fully updated yet
  const monthlyCodeQuery = trpc.rewards.getCurrentMonthlyCode.useQuery(undefined, {
    enabled: hasAccess,
  }) as { data: { code: string | null } | undefined; refetch: () => void; isLoading: boolean };
  
  // Get email configuration status
  // @ts-expect-error - tRPC types may not be fully updated yet
  const emailConfigQuery = trpc.rewards.getEmailConfigStatus.useQuery(undefined, {
    enabled: hasAccess,
  }) as { data: { configured: boolean; service: string | null; user: string | null } | undefined; isLoading: boolean };
  
  // Mutations
  // @ts-expect-error - tRPC types may not be fully updated yet
  const runDailyTasksMutation = trpc.rewards.runAllDailyTasks.useMutation({
    onSuccess: (data: { reminders: { sent: number }; expired: { processed: number } }) => {
      toast.success(`日次タスク完了: リマインド${data.reminders.sent}件, 期限切れ処理${data.expired.processed}件`);
      statsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // @ts-expect-error - tRPC types may not be fully updated yet
  const generateMonthlyCodeMutation = trpc.rewards.generateMonthlyCode.useMutation({
    onSuccess: (data: { code: string }) => {
      toast.success(`月次合言葉を生成しました: ${data.code}`);
      monthlyCodeQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // @ts-expect-error - tRPC types may not be fully updated yet
  const sendRemindersMutation = trpc.rewards.sendRenewalReminders.useMutation({
    onSuccess: (data: { sent: number }) => {
      toast.success(`${data.sent}件のリマインドを送信しました`);
      statsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // @ts-expect-error - tRPC types may not be fully updated yet
  const processExpiredMutation = trpc.rewards.processExpiredSubscriptions.useMutation({
    onSuccess: (data: { processed: number }) => {
      toast.success(`${data.processed}件の期限切れを処理しました`);
      statsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // @ts-expect-error - tRPC types may not be fully updated yet
  const testEmailMutation = trpc.rewards.testEmailConfig.useMutation({
    onSuccess: (data: { success: boolean; error?: string }) => {
      if (data.success) {
        toast.success("メール設定は正常です");
      } else {
        toast.error(`メール設定エラー: ${data.error}`);
      }
    },
    onError: (error: Error) => {
      toast.error(`エラー: ${error.message}`);
    },
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
  const monthlyCode = monthlyCodeQuery.data;
  const emailConfig = emailConfigQuery.data;
  
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
            <Crown className="w-6 h-6 text-yellow-400" />
            <h1 className="text-xl font-bold text-white">サブスクリプション管理</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => statsQuery.refetch()}
            disabled={statsQuery.isFetching}
            className="border-admin-primary/30 text-white hover:bg-admin-primary/20"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {statsQuery.isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-admin-primary" />
          </div>
        ) : (
          <>
            {/* Email Configuration Status */}
            <Card className={`glass-card-admin mb-6 ${emailConfig?.configured ? 'border-green-500/30' : 'border-yellow-500/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className={`w-5 h-5 ${emailConfig?.configured ? 'text-green-400' : 'text-yellow-400'}`} />
                    <div>
                      <p className="font-medium text-white">
                        メール送信: {emailConfig?.configured ? '設定済み' : '未設定'}
                      </p>
                      {emailConfig?.configured && (
                        <p className="text-sm text-muted-foreground">
                          {emailConfig.service} ({emailConfig.user})
                        </p>
                      )}
                      {!emailConfig?.configured && (
                        <p className="text-sm text-yellow-400">
                          環境変数 EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD を設定してください
                        </p>
                      )}
                    </div>
                  </div>
                  {emailConfig?.configured && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testEmailMutation.mutate()}
                      disabled={testEmailMutation.isPending}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/20"
                    >
                      {testEmailMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Settings className="w-4 h-4 mr-2" />
                          接続テスト
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Code Section */}
            <Card className="glass-card-admin mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  今月の合言葉
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    {monthlyCode?.code ? (
                      <div className="flex items-center gap-4">
                        <code className="text-2xl font-mono bg-white/10 px-4 py-2 rounded-lg text-yellow-400">
                          {monthlyCode.code}
                        </code>
                        <span className="text-sm text-muted-foreground">
                          継続ユーザーに送信する合言葉
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">今月の合言葉はまだ生成されていません</p>
                    )}
                  </div>
                  <Button
                    onClick={() => generateMonthlyCodeMutation.mutate()}
                    disabled={generateMonthlyCodeMutation.isPending}
                    className="btn-admin-primary"
                  >
                    {generateMonthlyCodeMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    新規生成
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Statistics Cards */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <Users className="w-5 h-5" />
              サブスクリプション統計
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">プレミアム会員</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats?.totalPremium || 0}</p>
                    </div>
                    <Crown className="w-10 h-10 text-yellow-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin border-orange-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">3日以内に期限切れ</p>
                      <p className="text-3xl font-bold text-orange-400">{stats?.expiringIn3Days || 0}</p>
                    </div>
                    <AlertTriangle className="w-10 h-10 text-orange-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin border-yellow-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">7日以内に期限切れ</p>
                      <p className="text-3xl font-bold text-yellow-400">{stats?.expiringIn7Days || 0}</p>
                    </div>
                    <Clock className="w-10 h-10 text-yellow-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin border-red-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">本日期限切れ</p>
                      <p className="text-3xl font-bold text-red-400">{stats?.expiredToday || 0}</p>
                    </div>
                    <XCircle className="w-10 h-10 text-red-400/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Notification Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">リマインド送信済み</p>
                      <p className="text-3xl font-bold text-green-400">{stats?.renewalRemindersSent || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">今月の更新リマインド</p>
                    </div>
                    <Bell className="w-10 h-10 text-green-400/50" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">リマインド未送信</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {(stats?.expiringIn3Days || 0) - (stats?.renewalRemindersSent || 0) > 0 
                          ? (stats?.expiringIn3Days || 0) - (stats?.renewalRemindersSent || 0)
                          : 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">3日以内期限切れで未送信</p>
                    </div>
                    <Send className="w-10 h-10 text-blue-400/50" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Action Buttons */}
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <Play className="w-5 h-5" />
              手動実行
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">日次タスク一括実行</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    リマインド送信と期限切れ処理を一括実行します
                  </p>
                  <Button
                    onClick={() => runDailyTasksMutation.mutate()}
                    disabled={runDailyTasksMutation.isPending}
                    className="w-full btn-admin-primary"
                  >
                    {runDailyTasksMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    実行
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">リマインド送信</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    3日以内に期限切れのユーザーに通知を送信
                  </p>
                  <Button
                    onClick={() => sendRemindersMutation.mutate()}
                    disabled={sendRemindersMutation.isPending}
                    variant="outline"
                    className="w-full border-orange-500/30 text-orange-400 hover:bg-orange-500/20"
                  >
                    {sendRemindersMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    送信
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="glass-card-admin">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-white mb-2">期限切れ処理</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    期限切れユーザーをダウングレード
                  </p>
                  <Button
                    onClick={() => processExpiredMutation.mutate()}
                    disabled={processExpiredMutation.isPending}
                    variant="outline"
                    className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    {processExpiredMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <XCircle className="w-4 h-4 mr-2" />
                    )}
                    実行
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Links */}
            <h2 className="text-lg font-semibold mb-4 text-white">関連ページ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href={`/admin/bank-transfers?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">振込申請管理</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/admin/activation-codes?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">合言葉一覧</span>
                  </CardContent>
                </Card>
              </Link>
              <Link href={`/admin/users?token=${token}`}>
                <Card className="glass-card-admin hover:border-admin-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Users className="w-5 h-5 text-blue-400" />
                    <span className="text-white">ユーザー管理</span>
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
