import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, Loader2, Key, Check, X, Clock, 
  Copy, RefreshCw, Search, User, Calendar, Plus, AlertTriangle
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

export default function AdminActivationCodes() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [planFilter, setPlanFilter] = useState<string>("all");
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
      setHasAccess(false);
    }
  }, []);
  
  // Validate token with server
  const tokenValidation = trpc.adminAccess.validateToken.useQuery(
    { token: token || '' },
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
  
  // Get all activation codes
  const codesQuery = trpc.admin.getAllActivationCodes.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  // Create activation code mutation
  const createCodeMutation = trpc.admin.createActivationCode.useMutation({
    onSuccess: (data) => {
      setGeneratedCode(data.code);
      toast.success(`合言葉を発行しました: ${data.code}`);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Check expiration warnings mutation
  const checkExpirationMutation = trpc.admin.checkActivationCodeExpirations.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Generate monthly codes mutation
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [monthlyCount, setMonthlyCount] = useState(10);
  const [yearlyCount, setYearlyCount] = useState(5);
  
  const generateMonthlyMutation = trpc.admin.generateMonthlyActivationCodes.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowGenerateDialog(false);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const getAdminLink = (path: string) => {
    return token ? `${path}?token=${token}` : path;
  };
  
  // Filter codes
  const filteredCodes = codesQuery.data?.filter(code => {
    const matchesSearch = searchQuery === "" || 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.usedByUserEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.usedByUserName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || code.status === statusFilter;
    const matchesPlan = planFilter === "all" || code.planType === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  }) || [];
  
  // Calculate stats
  const stats = {
    total: codesQuery.data?.length || 0,
    active: codesQuery.data?.filter(c => c.status === 'pending').length || 0,
    used: codesQuery.data?.filter(c => c.status === 'used').length || 0,
    expired: codesQuery.data?.filter(c => c.status === 'expired' || (c.expiresAt && new Date(c.expiresAt) < new Date() && c.status === 'pending')).length || 0,
    monthly: codesQuery.data?.filter(c => c.planType === 'monthly').length || 0,
    yearly: codesQuery.data?.filter(c => c.planType === 'yearly').length || 0,
  };
  
  // Check if code is expiring soon (within 2 days)
  const isExpiringSoon = (expiresAt: Date | null) => {
    if (!expiresAt) return false;
    const now = new Date();
    const expiry = new Date(expiresAt);
    const twoDaysFromNow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    return expiry > now && expiry <= twoDaysFromNow;
  };
  
  if (isChecking || tokenValidation.isLoading) {
    return (
      <div className="min-h-screen bg-admin-gradient flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-muted-foreground">認証確認中...</p>
        </div>
      </div>
    );
  }
  
  if (!hasAccess) {
    return null;
  }
  
  return (
    <div className="min-h-screen bg-admin-gradient">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={getAdminLink("/admin")}>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  管理者ダッシュボード
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-white" />
                <h1 className="text-xl font-bold text-white">合言葉一覧</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">管理者アクセス</span>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Issue Code Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新規発行
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

            <Button
              variant="outline"
              className="border-green-500/50 text-green-400 hover:bg-green-500/10"
              onClick={() => setShowGenerateDialog(true)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              月次合言葉を一括生成
            </Button>
            <Button
              variant="outline"
              className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => checkExpirationMutation.mutate()}
              disabled={checkExpirationMutation.isPending}
            >
              {checkExpirationMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="w-4 h-4 mr-2" />
              )}
              有効期限チェック
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-muted-foreground">総発行数</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              <p className="text-sm text-muted-foreground">有効</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.used}</p>
              <p className="text-sm text-muted-foreground">使用済み</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
              <p className="text-sm text-muted-foreground">期限切れ</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.monthly}</p>
              <p className="text-sm text-muted-foreground">月額プラン</p>
            </CardContent>
          </Card>

        </div>
        
        {/* Filters */}
        <Card className="glass-card-admin mb-8">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="合言葉、メール、名前で検索..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10">
                  <SelectValue placeholder="ステータス" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="active">有効</SelectItem>
                  <SelectItem value="used">使用済み</SelectItem>
                  <SelectItem value="expired">期限切れ</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-[150px] bg-white/5 border-white/10">
                  <SelectValue placeholder="プラン" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">すべて</SelectItem>
                  <SelectItem value="monthly">月額プラン</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={() => codesQuery.refetch()}
                className="border-white/10 hover:bg-white/10"
              >
                <RefreshCw className={`w-4 h-4 ${codesQuery.isRefetching ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Codes List */}
        <Card className="glass-card-admin">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              発行済み合言葉 ({filteredCodes.length}件)
            </CardTitle>
            <CardDescription>
              すべての合言葉の一覧と使用状況
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codesQuery.isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">読み込み中...</p>
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="text-center py-8">
                <Key className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all" || planFilter !== "all" 
                    ? "条件に一致する合言葉がありません" 
                    : "発行済みの合言葉がありません"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCodes.map((code) => {
                  const isExpired = code.expiresAt && new Date(code.expiresAt) < new Date() && code.status === 'pending';
                  const expiringSoon = isExpiringSoon(code.expiresAt);
                  
                  return (
                    <div
                      key={code.id}
                      className={`p-4 rounded-lg border ${
                        code.status === 'used' 
                          ? 'bg-blue-500/10 border-blue-500/30' 
                          : isExpired 
                            ? 'bg-red-500/10 border-red-500/30'
                            : expiringSoon
                              ? 'bg-yellow-500/10 border-yellow-500/30'
                              : 'bg-green-500/10 border-green-500/30'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-white">{code.code}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(code.code);
                                toast.success('合言葉をコピーしました');
                              }}
                              className="h-6 w-6 p-0"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Badge className="bg-blue-500/30">
                              月額
                            </Badge>
                            <Badge className={
                              code.status === 'used' 
                                ? 'bg-blue-500/30' 
                                : isExpired 
                                  ? 'bg-red-500/30' 
                                  : expiringSoon
                                    ? 'bg-yellow-500/30'
                                    : 'bg-green-500/30'
                            }>
                              {code.status === 'used' 
                                ? '使用済み' 
                                : isExpired 
                                  ? '期限切れ' 
                                  : expiringSoon
                                    ? '期限間近'
                                    : '有効'}
                            </Badge>
                            {expiringSoon && (
                              <AlertTriangle className="w-4 h-4 text-yellow-400" />
                            )}
                          </div>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              有効期間: {code.durationDays}日
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              発行: {new Date(code.createdAt!).toLocaleDateString('ja-JP')}
                            </span>
                            {code.expiresAt && (
                              <span className={`flex items-center gap-1 ${expiringSoon ? 'text-yellow-400' : ''}`}>
                                <Clock className="w-3 h-3" />
                                期限: {new Date(code.expiresAt).toLocaleDateString('ja-JP')}
                              </span>
                            )}
                          </div>
                          
                          {(code.customerEmail || code.customerName) && (
                            <div className="text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                発行先: {code.customerName || ''} {code.customerEmail ? `<${code.customerEmail}>` : ''}
                              </span>
                            </div>
                          )}
                          
                          {code.adminNote && (
                            <div className="text-sm text-muted-foreground italic">
                              メモ: {code.adminNote}
                            </div>
                          )}
                          
                          {code.status === 'used' && code.usedByUserName && (
                            <div className="text-sm text-blue-400">
                              <span className="flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                使用者: {code.usedByUserName} {code.usedByUserEmail ? `<${code.usedByUserEmail}>` : ''}
                                {code.usedAt && ` (${new Date(code.usedAt).toLocaleDateString('ja-JP')})`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
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
      
      {/* Generate Monthly Codes Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              月次合言葉を一括生成
            </DialogTitle>
            <DialogDescription>
              今月分の合言葉をまとめて生成します。
              生成された合言葉は30日間有効です。
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">月額プラン用合言葉数</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={monthlyCount}
                onChange={(e) => setMonthlyCount(parseInt(e.target.value) || 10)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">¥1,980 / 30日間</p>
            </div>

            
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm">
                <strong>合計:</strong> {monthlyCount}件の合言葉を生成
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                合言葉は「MON202601001XX」の形式で生成されます
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              キャンセル
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                generateMonthlyMutation.mutate({
                  monthlyCount,
                  yearlyCount: 0,
                });
              }}
              disabled={generateMonthlyMutation.isPending}
            >
              {generateMonthlyMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              生成する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
