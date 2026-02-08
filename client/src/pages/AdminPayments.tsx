import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, Loader2, CreditCard, Check, X, Clock, 
  RefreshCw, Search, User, Calendar, Banknote, ExternalLink,
  AlertCircle, CheckCircle, XCircle, Eye
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export default function AdminPayments() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [activationMonths, setActivationMonths] = useState(1);
  const [activationNotes, setActivationNotes] = useState("");
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<any>(null);
  
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
  
  // Get payment links
  const paymentLinksQuery = trpc.payment.getAllPaymentLinks.useQuery(
    { 
      status: statusFilter === "all" ? undefined : statusFilter as any,
      limit: 100,
    },
    {
      enabled: hasAccess,
      refetchInterval: 30000,
    }
  );
  
  // Get webhook logs
  const webhookLogsQuery = trpc.payment.getWebhookLogs.useQuery(
    { limit: 50 },
    {
      enabled: hasAccess,
    }
  );
  
  // Manual activation mutation
  const manualActivationMutation = trpc.payment.manualActivation.useMutation({
    onSuccess: (data) => {
      toast.success(`プランを有効化しました（${data.months}ヶ月）`);
      paymentLinksQuery.refetch();
      setShowActivateDialog(false);
      setSelectedLink(null);
      setActivationNotes("");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Filter payment links
  const filteredLinks = paymentLinksQuery.data?.filter(link => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      link.linkId.toLowerCase().includes(query) ||
      link.user?.name?.toLowerCase().includes(query) ||
      link.user?.email?.toLowerCase().includes(query)
    );
  }) || [];
  
  const handleActivate = () => {
    if (!selectedLink) return;
    
    manualActivationMutation.mutate({
      userId: selectedLink.userId,
      linkId: selectedLink.linkId,
      months: activationMonths,
      notes: activationNotes || undefined,
    });
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />保留中</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />完了</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30"><XCircle className="w-3 h-3 mr-1" />期限切れ</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30"><X className="w-3 h-3 mr-1" />キャンセル</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const getWebhookStatusBadge = (status: string) => {
    switch (status) {
      case 'received':
        return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/30">受信</Badge>;
      case 'processed':
        return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">処理済</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/30">失敗</Badge>;
      case 'ignored':
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/30">無視</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Loading state
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">認証を確認中...</p>
        </div>
      </div>
    );
  }
  
  // Access denied
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-4 text-red-500" />
            <CardTitle>アクセス拒否</CardTitle>
            <CardDescription>
              このページにアクセスする権限がありません。
              管理者用のアクセストークンが必要です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">ホームに戻る</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin?token=${token}`}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              決済管理
            </h1>
            <p className="text-muted-foreground">決済リンクとWebhookの管理</p>
          </div>
        </div>
        
        <Tabs defaultValue="links" className="space-y-6">
          <TabsList>
            <TabsTrigger value="links">決済リンク</TabsTrigger>
            <TabsTrigger value="webhooks">Webhookログ</TabsTrigger>
          </TabsList>
          
          {/* Payment Links Tab */}
          <TabsContent value="links" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="リンクID、ユーザー名、メールで検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="ステータス" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべて</SelectItem>
                      <SelectItem value="pending">保留中</SelectItem>
                      <SelectItem value="completed">完了</SelectItem>
                      <SelectItem value="expired">期限切れ</SelectItem>
                      <SelectItem value="cancelled">キャンセル</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => paymentLinksQuery.refetch()}
                    disabled={paymentLinksQuery.isFetching}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${paymentLinksQuery.isFetching ? 'animate-spin' : ''}`} />
                    更新
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Payment Links List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>決済リンク一覧</span>
                  <Badge variant="secondary">{filteredLinks.length}件</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {paymentLinksQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : filteredLinks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    決済リンクがありません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLinks.map((link) => (
                      <div
                        key={link.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(link.status)}
                              <span className="font-mono text-sm text-muted-foreground">
                                {link.linkId.substring(0, 16)}...
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {link.user?.name || link.user?.email || `ID: ${link.userId}`}
                              </span>
                              <span className="flex items-center gap-1">
                                <Banknote className="w-4 h-4" />
                                ¥{link.amount.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {formatDate(link.createdAt)}
                              </span>
                            </div>
                            {link.provider && (
                              <div className="text-sm text-muted-foreground">
                                決済代行: {link.provider}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {link.status === 'pending' && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedLink(link);
                                  setShowActivateDialog(true);
                                }}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                手動有効化
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Webhook Logs Tab */}
          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Webhookログ</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => webhookLogsQuery.refetch()}
                    disabled={webhookLogsQuery.isFetching}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${webhookLogsQuery.isFetching ? 'animate-spin' : ''}`} />
                    更新
                  </Button>
                </CardTitle>
                <CardDescription>
                  決済代行業者からのWebhook通知のログ
                </CardDescription>
              </CardHeader>
              <CardContent>
                {webhookLogsQuery.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : !webhookLogsQuery.data || webhookLogsQuery.data.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Webhookログがありません
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhookLogsQuery.data.map((log) => (
                      <div
                        key={log.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedWebhook(log);
                          setShowWebhookDialog(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {getWebhookStatusBadge(log.status)}
                              <Badge variant="outline">{log.provider}</Badge>
                              {log.eventType && (
                                <span className="text-sm text-muted-foreground">
                                  {log.eventType}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(log.createdAt)}
                              {log.sourceIp && ` • IP: ${log.sourceIp}`}
                            </div>
                            {log.errorMessage && (
                              <div className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {log.errorMessage}
                              </div>
                            )}
                          </div>
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Manual Activation Dialog */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>手動プラン有効化</DialogTitle>
            <DialogDescription>
              このユーザーのプレミアムプランを手動で有効化します。
              銀行振込の確認後などに使用してください。
            </DialogDescription>
          </DialogHeader>
          
          {selectedLink && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ユーザー</span>
                  <span>{selectedLink.user?.name || selectedLink.user?.email || `ID: ${selectedLink.userId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">金額</span>
                  <span>¥{selectedLink.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">リンクID</span>
                  <span className="font-mono text-sm">{selectedLink.linkId.substring(0, 16)}...</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">有効化期間</label>
                <Select
                  value={activationMonths.toString()}
                  onValueChange={(v) => setActivationMonths(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 6, 12].map((m) => (
                      <SelectItem key={m} value={m.toString()}>
                        {m}ヶ月 (¥{(1980 * m).toLocaleString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">メモ（任意）</label>
                <Textarea
                  placeholder="振込確認日、担当者名など..."
                  value={activationNotes}
                  onChange={(e) => setActivationNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowActivateDialog(false);
                setSelectedLink(null);
                setActivationNotes("");
              }}
            >
              キャンセル
            </Button>
            <Button
              onClick={handleActivate}
              disabled={manualActivationMutation.isPending}
            >
              {manualActivationMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              有効化する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Webhook Detail Dialog */}
      <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Webhook詳細</DialogTitle>
          </DialogHeader>
          
          {selectedWebhook && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">プロバイダー</label>
                  <p className="font-medium">{selectedWebhook.provider}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">ステータス</label>
                  <p>{getWebhookStatusBadge(selectedWebhook.status)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">イベントタイプ</label>
                  <p className="font-medium">{selectedWebhook.eventType || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">受信日時</label>
                  <p className="font-medium">{formatDate(selectedWebhook.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">送信元IP</label>
                  <p className="font-medium font-mono">{selectedWebhook.sourceIp || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">決済リンクID</label>
                  <p className="font-medium">{selectedWebhook.paymentLinkId || '-'}</p>
                </div>
              </div>
              
              {selectedWebhook.errorMessage && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <label className="text-sm text-red-500 font-medium">エラーメッセージ</label>
                  <p className="text-red-500">{selectedWebhook.errorMessage}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm text-muted-foreground">ペイロード</label>
                <pre className="mt-2 bg-muted rounded-lg p-4 overflow-auto max-h-64 text-xs">
                  {JSON.stringify(JSON.parse(selectedWebhook.payload || '{}'), null, 2)}
                </pre>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowWebhookDialog(false);
                setSelectedWebhook(null);
              }}
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
