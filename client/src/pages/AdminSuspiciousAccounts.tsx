import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, AlertTriangle, Users, Check, X, 
  Loader2, RefreshCw, Eye, Ban, CheckCircle, Clock
} from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminSuspiciousAccounts() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedPattern, setSelectedPattern] = useState<any>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewStatus, setReviewStatus] = useState<string>("");
  
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
      sessionStorage.removeItem('adminToken');
    }
  }, [tokenValidation.data, tokenValidation.error]);
  
  // Get suspicious patterns
  const { data: patterns, isLoading, refetch } = trpc.admin.getSuspiciousPatterns.useQuery(
    { 
      status: statusFilter === "all" ? undefined : statusFilter as any,
      limit: 50 
    },
    { enabled: hasAccess }
  );
  
  // Review mutation
  const reviewMutation = trpc.admin.reviewSuspiciousPattern.useMutation({
    onSuccess: () => {
      toast.success("レビューを保存しました");
      setReviewDialogOpen(false);
      setSelectedPattern(null);
      setReviewNote("");
      refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const handleReview = (pattern: any, status: string) => {
    setSelectedPattern(pattern);
    setReviewStatus(status);
    setReviewDialogOpen(true);
  };
  
  const confirmReview = () => {
    if (!selectedPattern) return;
    
    reviewMutation.mutate({
      patternId: selectedPattern.id,
      status: reviewStatus as any,
      note: reviewNote || undefined,
    });
  };
  
  const getPatternTypeLabel = (type: string) => {
    switch (type) {
      case 'same_device': return '同一デバイス';
      case 'same_ip': return '同一IPアドレス';
      case 'similar_name': return '類似した名前';
      case 'same_email_domain': return '同一メールドメイン';
      default: return type;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            未確認
          </span>
        );
      case 'dismissed':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs">
            <X className="w-3 h-3" />
            却下
          </span>
        );
      case 'confirmed_fraud':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs">
            <Ban className="w-3 h-3" />
            不正確認
          </span>
        );
      case 'confirmed_legitimate':
        return (
          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            正当確認
          </span>
        );
      default:
        return null;
    }
  };
  
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }
  
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="glass-card max-w-md">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              アクセス拒否
            </CardTitle>
            <CardDescription>
              このページにアクセスする権限がありません。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="outline">ホームに戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/admin?token=${token}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-serif font-bold">疑わしいアカウント検出</h1>
              <p className="text-sm text-muted-foreground">複数アカウントの不正利用を検出・管理</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            更新
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">ステータス:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="pending">未確認</SelectItem>
                <SelectItem value="dismissed">却下</SelectItem>
                <SelectItem value="confirmed_fraud">不正確認</SelectItem>
                <SelectItem value="confirmed_legitimate">正当確認</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Patterns List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gold" />
          </div>
        ) : patterns && patterns.length > 0 ? (
          <div className="space-y-4">
            {patterns.map((pattern: any) => (
              <Card key={pattern.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        <span className="font-medium">{getPatternTypeLabel(pattern.patternType)}</span>
                        {getStatusBadge(pattern.status)}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>パターン値: <span className="text-white">{pattern.patternValue}</span></p>
                        <p>関連アカウント数: <span className="text-white">{pattern.accountCount}</span></p>
                        <p>関連アカウントID: <span className="text-white">{pattern.accountIds}</span></p>
                        <p>検出日時: {new Date(pattern.createdAt).toLocaleString('ja-JP')}</p>
                        {pattern.reviewedAt && (
                          <p>レビュー日時: {new Date(pattern.reviewedAt).toLocaleString('ja-JP')}</p>
                        )}
                        {pattern.reviewNote && (
                          <p>メモ: {pattern.reviewNote}</p>
                        )}
                      </div>
                    </div>
                    
                    {pattern.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                          onClick={() => handleReview(pattern, 'confirmed_legitimate')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          正当
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleReview(pattern, 'confirmed_fraud')}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          不正
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-500/30 text-gray-400 hover:bg-gray-500/10"
                          onClick={() => handleReview(pattern, 'dismissed')}
                        >
                          <X className="w-4 h-4 mr-1" />
                          却下
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                {statusFilter === "pending" 
                  ? "未確認の疑わしいパターンはありません" 
                  : "該当するパターンはありません"}
              </p>
            </CardContent>
          </Card>
        )}
        
        {/* Info Card */}
        <Card className="glass-card mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              検出パターンについて
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p><strong>同一デバイス:</strong> 同じデバイスから複数のアカウントが登録された場合</p>
            <p><strong>同一IPアドレス:</strong> 同じIPアドレスから複数のアカウントが登録された場合</p>
            <p><strong>類似した名前:</strong> 非常に似た名前のアカウントが複数存在する場合</p>
            <p><strong>同一メールドメイン:</strong> 同じメールドメインで複数のアカウントが登録された場合（フリーメール除く）</p>
          </CardContent>
        </Card>
      </main>
      
      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle>パターンのレビュー</DialogTitle>
            <DialogDescription>
              このパターンについてのレビューを記録します。
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">ステータス:</p>
              <p className="font-medium">
                {reviewStatus === 'confirmed_legitimate' && '正当なアカウント'}
                {reviewStatus === 'confirmed_fraud' && '不正なアカウント'}
                {reviewStatus === 'dismissed' && '却下（問題なし）'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-2">メモ（任意）:</p>
              <Textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="レビューに関するメモを入力..."
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={confirmReview}
              disabled={reviewMutation.isPending}
              className={
                reviewStatus === 'confirmed_fraud' 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : reviewStatus === 'confirmed_legitimate'
                  ? 'bg-green-500 hover:bg-green-600'
                  : ''
              }
            >
              {reviewMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              確定
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
