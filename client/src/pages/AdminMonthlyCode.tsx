import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { 
  ArrowLeft, Shield, Loader2, Key, Check, X, Clock, 
  Copy, RefreshCw, Search, User, Calendar, Plus, Shuffle,
  Users, CheckCircle, XCircle
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminMonthlyCode() {
  const [, setLocation] = useLocation();
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showUsageDialog, setShowUsageDialog] = useState(false);
  const [selectedCodeId, setSelectedCodeId] = useState<number | null>(null);
  const [newCodeMaxUses, setNewCodeMaxUses] = useState<string>("");
  const [newCodeAdminNote, setNewCodeAdminNote] = useState("");
  
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
  
  // Get all monthly codes (token-based auth)
  const codesQuery = trpc.adminAccess.getMonthlyActivationCodes.useQuery(
    { token: token || '' },
    { enabled: hasAccess && !!token }
  );
  
  // Get usage for selected code (token-based auth)
  const usageQuery = trpc.adminAccess.getMonthlyCodeUsages.useQuery(
    { token: token || '', codeId: selectedCodeId || undefined },
    { enabled: hasAccess && showUsageDialog && selectedCodeId !== null && !!token }
  );
  
  // Create monthly code mutation (token-based auth)
  const createCodeMutation = trpc.adminAccess.createMonthlyActivationCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowCreateDialog(false);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Generate random code mutation (token-based auth)
  const generateRandomMutation = trpc.adminAccess.generateRandomMonthlyCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Deactivate code mutation (token-based auth)
  const deactivateMutation = trpc.adminAccess.deactivateMonthlyCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  // Activate code mutation (token-based auth)
  const activateMutation = trpc.adminAccess.activateMonthlyCode.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      codesQuery.refetch();
    },
    onError: (error) => {
      toast.error(`エラー: ${error.message}`);
    },
  });
  
  const getAdminLink = (path: string) => {
    return token ? `${path}?token=${token}` : path;
  };
  
  // Get current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  
  // Filter codes
  const filteredCodes = codesQuery.data?.filter(code => {
    const matchesSearch = searchQuery === "" || 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.adminNote?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || code.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];
  
  // Calculate stats
  const thisMonthCodes = codesQuery.data?.filter(c => c.validMonth === currentMonth) || [];
  const stats = {
    total: codesQuery.data?.length || 0,
    thisMonth: thisMonthCodes.length,
    active: thisMonthCodes.filter(c => c.status === 'active').length,
    inactive: thisMonthCodes.filter(c => c.status === 'inactive').length,
    totalUses: thisMonthCodes.reduce((sum, c) => sum + c.currentUses, 0),
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("コピーしました");
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
                <Calendar className="w-5 h-5 text-white" />
                <h1 className="text-xl font-bold text-white">今月の合言葉</h1>
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
        {/* Action Buttons */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            新規発行
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setNewCodeMaxUses("");
                setNewCodeAdminNote("");
                setShowCreateDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              今月の合言葉を発行
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => generateRandomMutation.mutate({ token: token || '' })}
              disabled={generateRandomMutation.isPending}
            >
              {generateRandomMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Shuffle className="w-4 h-4 mr-2" />
              )}
              ランダム合言葉を生成
            </Button>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-sm text-muted-foreground">総発行数</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.thisMonth}</p>
              <p className="text-sm text-muted-foreground">今月の合言葉</p>
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
              <p className="text-2xl font-bold text-red-400">{stats.inactive}</p>
              <p className="text-sm text-muted-foreground">無効</p>
            </CardContent>
          </Card>
          <Card className="glass-card-admin">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{stats.totalUses}</p>
              <p className="text-sm text-muted-foreground">今月の使用数</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="合言葉を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="ステータス" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              <SelectItem value="active">有効</SelectItem>
              <SelectItem value="inactive">無効</SelectItem>
              <SelectItem value="expired">期限切れ</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={() => codesQuery.refetch()}
            className="border-white/10 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 ${codesQuery.isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {/* Codes Table */}
        <Card className="glass-card-admin">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              合言葉一覧
            </CardTitle>
            <CardDescription>
              今月の合言葉: {currentMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {codesQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : filteredCodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                合言葉がありません
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">合言葉</TableHead>
                      <TableHead className="text-white">有効月</TableHead>
                      <TableHead className="text-white">使用数</TableHead>
                      <TableHead className="text-white">上限</TableHead>
                      <TableHead className="text-white">ステータス</TableHead>
                      <TableHead className="text-white">メモ</TableHead>
                      <TableHead className="text-white">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCodes.map((code) => (
                      <TableRow key={code.id} className="border-white/10">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="bg-white/10 px-2 py-1 rounded text-white font-mono">
                              {code.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-white"
                              onClick={() => copyToClipboard(code.code)}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={code.validMonth === currentMonth ? "default" : "secondary"}>
                            {code.validMonth}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-white font-medium">{code.currentUses}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {code.maxUses || "無制限"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {code.status === 'active' ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              有効
                            </Badge>
                          ) : code.status === 'inactive' ? (
                            <Badge className="bg-red-500/20 text-red-400">
                              <XCircle className="w-3 h-3 mr-1" />
                              無効
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-500/20 text-gray-400">
                              <Clock className="w-3 h-3 mr-1" />
                              期限切れ
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground text-sm">
                            {code.adminNote || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                              onClick={() => {
                                setSelectedCodeId(code.id);
                                setShowUsageDialog(true);
                              }}
                            >
                              <Users className="w-4 h-4 mr-1" />
                              使用履歴
                            </Button>
                            {code.status === 'active' ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => deactivateMutation.mutate({ token: token || '', id: code.id })}
                                disabled={deactivateMutation.isPending}
                              >
                                <X className="w-4 h-4 mr-1" />
                                無効化
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                onClick={() => activateMutation.mutate({ token: token || '', id: code.id })}
                                disabled={activateMutation.isPending}
                              >
                                <Check className="w-4 h-4 mr-1" />
                                有効化
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Create Code Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>今月の合言葉を発行</DialogTitle>
            <DialogDescription>
              新しい合言葉を発行します。1人1回のみ使用可能です。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                使用上限（空欄で無制限）
              </label>
              <Input
                type="number"
                placeholder="例: 100"
                value={newCodeMaxUses}
                onChange={(e) => setNewCodeMaxUses(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">
                管理者メモ（任意）
              </label>
              <Input
                placeholder="例: 2月キャンペーン用"
                value={newCodeAdminNote}
                onChange={(e) => setNewCodeAdminNote(e.target.value)}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              キャンセル
            </Button>
            <Button
              onClick={() => createCodeMutation.mutate({
                token: token || '',
                maxUses: newCodeMaxUses ? parseInt(newCodeMaxUses) : undefined,
                adminNote: newCodeAdminNote || undefined,
              })}
              disabled={createCodeMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createCodeMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              発行
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Usage History Dialog */}
      <Dialog open={showUsageDialog} onOpenChange={setShowUsageDialog}>
        <DialogContent className="bg-gray-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>使用履歴</DialogTitle>
            <DialogDescription>
              この合言葉を使用したユーザー一覧
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {usageQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : usageQuery.data?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                まだ使用されていません
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-white">ユーザー</TableHead>
                      <TableHead className="text-white">メール</TableHead>
                      <TableHead className="text-white">使用日時</TableHead>
                      <TableHead className="text-white">有効期限</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageQuery.data?.map((usage) => (
                      <TableRow key={usage.id} className="border-white/10">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-white">{usage.userName || "不明"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{usage.userEmail || "-"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {usage.createdAt ? new Date(usage.createdAt).toLocaleString('ja-JP') : "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {usage.premiumExpiresAt ? new Date(usage.premiumExpiresAt).toLocaleDateString('ja-JP') : "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUsageDialog(false)}
              className="border-white/10 text-white hover:bg-white/10"
            >
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
