import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, Loader2, Crown, Check, X, Clock, 
  RefreshCw, Search, User, Calendar
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

export default function AdminUpgradeRequests() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [durationDays, setDurationDays] = useState(30);
  const [rejectionReason, setRejectionReason] = useState("");
  
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
  
  // Get pending upgrade requests
  const pendingRequestsQuery = trpc.admin.getPendingUpgradeRequests.useQuery(undefined, {
    enabled: hasAccess,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Approve upgrade request mutation
  const approveRequestMutation = trpc.admin.approveUpgradeRequest.useMutation({
    onSuccess: (data) => {
      toast.success(`プレミアムプランを有効化しました！\n${data.userName}さん`);
      pendingRequestsQuery.refetch();
      setShowApproveDialog(false);
      setSelectedRequest(null);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Reject upgrade request mutation
  const rejectRequestMutation = trpc.admin.rejectUpgradeRequest.useMutation({
    onSuccess: () => {
      toast.success("申請を却下しました");
      pendingRequestsQuery.refetch();
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const handleApprove = () => {
    if (!selectedRequest) return;
    approveRequestMutation.mutate({
      requestId: selectedRequest.id,
      durationDays: durationDays,
    });
  };
  
  const handleReject = () => {
    if (!selectedRequest) return;
    rejectRequestMutation.mutate({
      requestId: selectedRequest.id,
      rejectionReason: rejectionReason || undefined,
    });
  };
  
  // Filter requests by search query
  const filteredRequests = pendingRequestsQuery.data?.filter(request => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      request.userName?.toLowerCase().includes(query) ||
      request.userDisplayName?.toLowerCase().includes(query) ||
      request.userEmail?.toLowerCase().includes(query) ||
      request.userId?.toString().includes(query)
    );
  }) || [];
  
  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Shield className="w-5 h-5" />
              アクセス権限がありません
            </CardTitle>
            <CardDescription>
              このページにアクセスするには管理者権限が必要です。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                ホームに戻る
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Crown className="w-6 h-6 text-yellow-500" />
                アップグレード申請管理
              </h1>
              <p className="text-muted-foreground text-sm">
                プレミアムプランへのアップグレード申請を管理
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pendingRequestsQuery.refetch()}
            disabled={pendingRequestsQuery.isFetching}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${pendingRequestsQuery.isFetching ? 'animate-spin' : ''}`} />
            更新
          </Button>
        </div>
        
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ユーザー名、メールアドレス、IDで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">承認待ち</p>
                  <p className="text-2xl font-bold">{filteredRequests.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-500" />
              承認待ちの申請
            </CardTitle>
            <CardDescription>
              ワンクリックでプレミアムプランを有効化できます
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequestsQuery.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                承認待ちの申請はありません
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {request.userDisplayName || request.userName || '名前未設定'}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            ID: {request.userId}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              申請日: {new Date(request.createdAt).toLocaleString('ja-JP')}
                            </span>
                          </div>
                          {request.userEmail && (
                            <div className="flex items-center gap-2">
                              <span>📧 {request.userEmail}</span>
                            </div>
                          )}
                        </div>
                        
                        {request.message && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                            💬 {request.message}
                          </div>
                        )}
                        
                        <div className="mt-2">
                          <Badge variant={request.userIsPremium ? "default" : "secondary"}>
                            現在: {request.userIsPremium ? 'プレミアム' : request.userPlanType || 'フリー'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveDialog(true);
                          }}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          承認
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                        >
                          <X className="w-4 h-4 mr-1" />
                          却下
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              プレミアムプランを有効化
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.userDisplayName || selectedRequest?.userName || 'ユーザー'}さんのプレミアムプランを有効化します。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">有効期間（日数）</label>
              <Input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(parseInt(e.target.value) || 30)}
                min={1}
                max={365}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                デフォルト: 30日（1ヶ月）
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              キャンセル
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleApprove}
              disabled={approveRequestMutation.isPending}
            >
              {approveRequestMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              承認して有効化
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <X className="w-5 h-5" />
              申請を却下
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.userDisplayName || selectedRequest?.userName || 'ユーザー'}さんの申請を却下します。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">却下理由（任意）</label>
              <Input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="却下理由を入力..."
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectRequestMutation.isPending}
            >
              {rejectRequestMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
