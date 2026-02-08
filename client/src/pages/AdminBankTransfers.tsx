import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, Loader2, CreditCard, Check, X, Clock, 
  Copy, RefreshCw, Search, User, Calendar, Banknote, Plus, Key
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

export default function AdminBankTransfers() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showIssueCodeDialog, setShowIssueCodeDialog] = useState(false);
  const [issueCodePlanType, setIssueCodePlanType] = useState<'monthly' | 'yearly'>('monthly');
  const [newCodeCustomerEmail, setNewCodeCustomerEmail] = useState('');
  const [newCodeCustomerName, setNewCodeCustomerName] = useState('');
  const [newCodeAdminNote, setNewCodeAdminNote] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  
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
  
  // Get pending bank transfer requests
  const pendingRequestsQuery = trpc.admin.getPendingBankTransferRequests.useQuery(undefined, {
    enabled: hasAccess,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Issue activation code mutation
  const issueCodeMutation = trpc.admin.issueActivationCode.useMutation({
    onSuccess: (data) => {
      toast.success(`合言葉を発行しました: ${data.code}`);
      pendingRequestsQuery.refetch();
      setShowApproveDialog(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Create activation code mutation (for direct issuance)
  const createCodeMutation = trpc.admin.createActivationCode.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      toast.success(`合言葉を発行しました: ${data.code}`);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Direct activate mutation (one-click activation without activation code)
  const directActivateMutation = trpc.admin.confirmAndDirectActivate.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      pendingRequestsQuery.refetch();
      setShowApproveDialog(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Reject request mutation
  const rejectRequestMutation = trpc.admin.rejectBankTransferRequest.useMutation({
    onSuccess: () => {
      toast.success("申請を却下しました");
      pendingRequestsQuery.refetch();
      setShowRejectDialog(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Helper to append token to admin links
  const getAdminLink = (path: string) => {
    return `${path}?token=${token}`;
  };
  
  // Filter requests by search query
  const filteredRequests = (pendingRequestsQuery.data || []).filter((req: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.userName?.toLowerCase().includes(query) ||
      req.userEmail?.toLowerCase().includes(query) ||
      req.userId?.toString().includes(query)
    );
  });
  
  // Format date
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
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
  
  const pendingCount = pendingRequestsQuery.data?.length || 0;
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={getAdminLink("/admin")} className="text-white hover:text-white/80">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <CreditCard className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">振込申請管理</h1>
          </div>
          <Button 
            variant="outline" 
            className="border-admin-primary/30 text-white hover:bg-admin-primary/20"
            onClick={() => pendingRequestsQuery.refetch()}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${pendingRequestsQuery.isFetching ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Issue Code Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Key className="w-5 h-5" />
            合言葉発行
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setIssueCodePlanType('monthly');
                setNewCodeCustomerEmail('');
                setNewCodeCustomerName('');
                setNewCodeAdminNote('');
                setGeneratedCode(null);
                setShowIssueCodeDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              月額プラン用合言葉を発行
              <Badge className="ml-2 bg-blue-500/30">¥1,980 / 30日</Badge>
            </Button>

          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">未処理の申請</p>
                  <p className="text-3xl font-bold text-white">{pendingCount}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">振込金額</p>
                  <p className="text-lg font-bold text-white">¥1,980 / 30日</p>
                </div>
                <Banknote className="w-10 h-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">振込先</p>
                  <p className="text-lg font-bold text-white">楽天銀行 エンカ支店</p>
                  <p className="text-sm text-muted-foreground">普通 1479015</p>
                </div>
                <CreditCard className="w-10 h-10 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ユーザー名・メールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background/50 border-border/30"
            />
          </div>
        </div>
        
        {/* Requests List */}
        <Card className="glass-card-admin">
          <CardHeader>
            <CardTitle className="text-white">振込申請一覧</CardTitle>
            <CardDescription>振込確認後、「合言葉を発行」をクリックしてください</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequestsQuery.isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>未処理の振込申請はありません</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 rounded-lg bg-background/30 border border-border/20 hover:border-admin-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-white">{request.userName || "名前未設定"}</span>
                          <Badge variant="outline" className="text-xs">
                            ID: {request.userId}
                          </Badge>
                          {request.transferReported && (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              ✅ 振込完了報告済み
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>メール: {request.userEmail}</p>
                          <p>プラン: <Badge className="bg-blue-500/20 text-blue-400">
                            月額プラン (¥1,980 / 30日)
                          </Badge></p>
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            申請日時: {formatDate(request.createdAt)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/20"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          却下
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveDialog(true);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          ワンクリック有効化
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Approve Dialog - Direct Activation */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ワンクリック有効化</DialogTitle>
            <DialogDescription>
              振込を確認しましたか？月額プランを直接有効化します。
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 space-y-2">
                <p><strong>ユーザー:</strong> {selectedRequest.userName || "名前未設定"}</p>
                <p><strong>メール:</strong> {selectedRequest.userEmail}</p>
                <p><strong>プラン:</strong> 月額プラン</p>
                <p><strong>金額:</strong> ¥1,980</p>
                <p><strong>有効期間:</strong> 30日間</p>
              </div>
              <p className="text-sm text-muted-foreground mt-3">
                ※ 合言葉なしでプランが即時有効化されます
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              キャンセル
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (selectedRequest) {
                  directActivateMutation.mutate({ 
                    requestId: selectedRequest.id,
                  });
                }
              }}
              disabled={directActivateMutation.isPending}
            >
              {directActivateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              有効化する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Issue Code Dialog */}
      <Dialog open={showIssueCodeDialog} onOpenChange={(open) => {
        setShowIssueCodeDialog(open);
        if (!open) setGeneratedCode(null);
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
月額プラン用合言葉を発行
            </DialogTitle>
            <DialogDescription>
              月額プラン（¥1,980 / 30日間）の合言葉を発行します。
            </DialogDescription>
          </DialogHeader>
          
          {generatedCode ? (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-center">
                <p className="text-sm text-muted-foreground mb-2">発行された合言葉</p>
                <p className="text-2xl font-mono font-bold text-green-400 mb-3">{generatedCode}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    toast.success('合言葉をコピーしました');
                  }}
                >
                  <Copy className="w-4 h-4 mr-2" />
                  コピー
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                この合言葉をお客様にお伝えください。
                <br />有効期限: 7日間
              </p>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-lg bg-muted/50">
                <p className="text-sm mb-2">
                  <strong>プラン:</strong> 月額プラン
                </p>
                <p className="text-sm mb-2">
                  <strong>金額:</strong> ¥1,980
                </p>
                <p className="text-sm">
                  <strong>有効期間:</strong> 30日間
                </p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">お客様メール（任意）</label>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    value={newCodeCustomerEmail}
                    onChange={(e) => setNewCodeCustomerEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">お客様名（任意）</label>
                  <Input
                    placeholder="山田太郎"
                    value={newCodeCustomerName}
                    onChange={(e) => setNewCodeCustomerName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">管理者メモ（任意）</label>
                  <Input
                    placeholder="振込確認済みなど"
                    value={newCodeAdminNote}
                    onChange={(e) => setNewCodeAdminNote(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowIssueCodeDialog(false)}>
              {generatedCode ? '閉じる' : 'キャンセル'}
            </Button>
            {!generatedCode && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  createCodeMutation.mutate({
                    planType: issueCodePlanType,
                    customerEmail: newCodeCustomerEmail || undefined,
                    customerName: newCodeCustomerName || undefined,
                    adminNote: newCodeAdminNote || undefined,
                  });
                }}
                disabled={createCodeMutation.isPending}
              >
                {createCodeMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                合言葉を発行
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>申請を却下</DialogTitle>
            <DialogDescription>
              この振込申請を却下しますか？ユーザーに通知は送信されません。
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p><strong>ユーザー:</strong> {selectedRequest.userName || "名前未設定"}</p>
                <p><strong>メール:</strong> {selectedRequest.userEmail}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedRequest) {
                  rejectRequestMutation.mutate({ requestId: selectedRequest.id });
                }
              }}
              disabled={rejectRequestMutation.isPending}
            >
              {rejectRequestMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              却下する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
