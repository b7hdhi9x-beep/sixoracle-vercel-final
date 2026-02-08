import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Users, Shield, ArrowLeft, Crown, Star, Trash2, Plus, Minus,
  Check, X, Loader2, UserPlus, Key, Copy, Eye, EyeOff, Phone, Mail, Ticket, Calendar, History, FlaskConical, Info, MessageSquare
} from "lucide-react";
import AdminUserDetailDialog from "@/components/AdminUserDetailDialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function AdminUsers() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const utils = trpc.useUtils();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [bonusDialogOpen, setBonusDialogOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState(5);
  
  // Create user dialog state
  const [createUserDialogOpen, setCreateUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserIsPremium, setNewUserIsPremium] = useState(false);
  const [newUserRole, setNewUserRole] = useState<"user" | "admin">("user");
  const [showPassword, setShowPassword] = useState(false);
  const [createdUserPassword, setCreatedUserPassword] = useState<string | null>(null);
  
  // Password reset dialog state
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordResult, setResetPasswordResult] = useState<string | null>(null);
  
  // Premium grant dialog state
  const [premiumGrantDialogOpen, setPremiumGrantDialogOpen] = useState(false);
  const [premiumDurationDays, setPremiumDurationDays] = useState(30);
  const [premiumNote, setPremiumNote] = useState("");
  
  // Premium history dialog state
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [historyUserId, setHistoryUserId] = useState<number | null>(null);
  
  // User detail dialog state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<any>(null);
  
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
  
  // Get all users (admin only)
  const usersQuery = trpc.admin.getAllUsers.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("ロールを更新しました");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updatePremiumMutation = trpc.admin.updateUserPremium.useMutation({
    onSuccess: () => {
      toast.success("プレミアムステータスを更新しました");
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const addBonusMutation = trpc.admin.addBonusReadings.useMutation({
    onSuccess: () => {
      toast.success("ボーナス鑑定回数を追加しました");
      utils.admin.getAllUsers.invalidate();
      setBonusDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("ユーザーを削除しました");
      utils.admin.getAllUsers.invalidate();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Create user mutation
  const createUserMutation = trpc.emailAuth.createUser.useMutation({
    onSuccess: (data) => {
      toast.success("ユーザーを作成しました");
      utils.admin.getAllUsers.invalidate();
      setCreatedUserPassword(data.password);
      // Reset form but keep dialog open to show password
      setNewUserEmail("");
      setNewUserName("");
      setNewUserPassword("");
      setNewUserIsPremium(false);
      setNewUserRole("user");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Reset password mutation
  const resetPasswordMutation = trpc.emailAuth.resetUserPassword.useMutation({
    onSuccess: (data) => {
      toast.success("パスワードをリセットしました");
      setResetPasswordResult(data.newPassword);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Grant monthly premium mutation
  const grantMonthlyPremiumMutation = trpc.admin.grantMonthlyPremium.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Revoke monthly premium mutation
  const revokeMonthlyPremiumMutation = trpc.admin.revokeMonthlyPremium.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Update tester status mutation
  const updateTesterMutation = trpc.admin.updateUserTester.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      utils.admin.getAllUsers.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Premium grant history query
  const historyQuery = trpc.admin.getPremiumGrantHistory.useQuery(
    { userId: historyUserId || undefined, limit: 50 },
    { enabled: historyDialogOpen && hasAccess }
  );
  
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
  
  const allUsers = usersQuery.data || [];
  
  const handleRoleChange = (userId: number, newRole: "user" | "admin") => {
    updateRoleMutation.mutate({ userId, role: newRole });
  };
  
  const handlePremiumToggle = (userId: number, currentPremium: boolean) => {
    updatePremiumMutation.mutate({ userId, isPremium: !currentPremium });
  };
  
  const handleAddBonus = () => {
    if (selectedUserId && bonusAmount > 0) {
      addBonusMutation.mutate({ userId: selectedUserId, amount: bonusAmount });
    }
  };
  
  const handleDeleteUser = () => {
    if (selectedUserId) {
      deleteUserMutation.mutate({ userId: selectedUserId });
    }
  };
  
  const handleCreateUser = () => {
    if (!newUserEmail || !newUserName) {
      toast.error("メールアドレスと名前を入力してください");
      return;
    }
    createUserMutation.mutate({
      email: newUserEmail,
      name: newUserName,
      password: newUserPassword || undefined,
      isPremium: newUserIsPremium,
      role: newUserRole,
    });
  };
  
  const handleResetPassword = () => {
    if (selectedUserId) {
      resetPasswordMutation.mutate({ userId: selectedUserId });
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("コピーしました");
  };
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">ユーザー管理</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setCreateUserDialogOpen(true)}
              className="btn-admin-primary"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              新規ユーザー作成
            </Button>
            <Link href={`/admin?token=${token}`}>
              <Button variant="outline" className="border-admin-primary/30 text-white hover:bg-admin-primary/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                管理者ダッシュボードに戻る
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総ユーザー数</p>
                  <p className="text-3xl font-bold text-white">{allUsers.length}</p>
                </div>
                <Users className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">電話認証</p>
                  <p className="text-3xl font-bold text-green-400">
                    {allUsers.filter(u => u.loginMethod === 'phone').length}
                  </p>
                </div>
                <Phone className="w-10 h-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">合言葉使用済</p>
                  <p className="text-3xl font-bold text-amber-400">
                    {allUsers.filter(u => u.activationCode).length}
                  </p>
                </div>
                <Ticket className="w-10 h-10 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">プレミアム会員</p>
                  <p className="text-3xl font-bold text-white">
                    {allUsers.filter(u => u.isPremium).length}
                  </p>
                </div>
                <Crown className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">管理者</p>
                  <p className="text-3xl font-bold text-white">
                    {allUsers.filter(u => u.role === 'admin').length}
                  </p>
                </div>
                <Shield className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">テスター</p>
                  <p className="text-3xl font-bold text-cyan-400">
                    {allUsers.filter(u => u.isTester).length}
                  </p>
                </div>
                <FlaskConical className="w-10 h-10 text-cyan-400/50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Users Table */}
        <Card className="glass-card-admin">
          <CardHeader>
            <CardTitle className="text-white">ユーザー一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {usersQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">ID</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">名前</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">認証</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">メール</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">合言葉</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">ロール</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">テスター</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">プラン</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">使用状況</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">チャット</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">最終ログイン</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/10 hover:bg-white/5 cursor-pointer" onClick={() => { setDetailUser(u); setDetailDialogOpen(true); }}>
                        <td className="py-3 px-4">{u.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {u.name || u.displayName || "未設定"}
                            {u.role === 'admin' && (
                              <Shield className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1" title={u.loginMethod || "不明"}>
                            {u.loginMethod === 'phone' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                                <Phone className="w-3 h-3" />
                                電話
                              </span>
                            ) : u.loginMethod === 'email' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs">
                                <Mail className="w-3 h-3" />
                                メール
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                                不明
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{u.email || "-"}</td>
                        <td className="py-3 px-4">
                          {u.activationCode ? (
                            <div className="flex items-center gap-1" title={`使用日: ${u.activationCode.usedAt ? new Date(u.activationCode.usedAt).toLocaleDateString('ja-JP') : '不明'}`}>
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                <Ticket className="w-3 h-3" />
                                {u.activationCode.code}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <Select
                            value={u.role}
                            onValueChange={(value: "user" | "admin") => handleRoleChange(u.id, value)}
                            disabled={false}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">ユーザー</SelectItem>
                              <SelectItem value="admin">管理者</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => updateTesterMutation.mutate({ userId: u.id, isTester: !u.isTester })}
                            disabled={updateTesterMutation.isPending}
                            className={u.isTester ? "text-cyan-400" : "text-muted-foreground"}
                            title={u.isTester ? "テスター設定を解除" : "テスターに設定（プレミアム1年間付与）"}
                          >
                            {updateTesterMutation.isPending ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : u.isTester ? (
                              <FlaskConical className="w-5 h-5 fill-cyan-400" />
                            ) : (
                              <FlaskConical className="w-5 h-5" />
                            )}
                          </Button>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col items-start gap-1">
                            <div className="flex items-center gap-2">
                              {u.isPremium ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                                  <Crown className="w-3 h-3 fill-amber-400" />
                                  プレミアム
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-500/20 text-gray-400 text-xs">
                                  無料
                                </span>
                              )}
                              {u.isTester && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cyan-500/20 text-cyan-400 text-xs">
                                  <FlaskConical className="w-3 h-3" />
                                  テスター
                                </span>
                              )}
                            </div>
                            {u.isPremium && u.premiumExpiresAt && (
                              <span className="text-xs text-muted-foreground">
                                期限: {new Date(u.premiumExpiresAt).toLocaleDateString('ja-JP')}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {u.usedFreeReadings}/{u.totalFreeReadings}
                              {u.bonusReadings > 0 && (
                                <span className="text-white ml-1">+{u.bonusReadings}</span>
                              )}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setBonusDialogOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{(u as any).totalChatSessions || 0}</span>
                            <span className="text-xs text-muted-foreground">/ {(u as any).totalChatMessages || 0}msg</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs text-muted-foreground">
                            {(u as any).lastLoginAt ? new Date((u as any).lastLoginAt).toLocaleDateString('ja-JP') : '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            {/* 詳細表示ボタン */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setDetailUser(u);
                                setDetailDialogOpen(true);
                              }}
                              className="text-white hover:text-white hover:bg-white/20"
                              title="ユーザー詳細"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                            {/* プレミアム付与/取消ボタン */}
                            {u.isPremium && u.premiumExpiresAt ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => revokeMonthlyPremiumMutation.mutate({ userId: u.id })}
                                disabled={revokeMonthlyPremiumMutation.isPending}
                                className="border-amber-500 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 hover:text-amber-200 gap-1 px-2"
                                title={`プレミアム取消 (有効期限: ${new Date(u.premiumExpiresAt).toLocaleDateString('ja-JP')})`}
                              >
                                {revokeMonthlyPremiumMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Crown className="w-4 h-4 fill-amber-400" />
                                    <span className="text-xs">取消</span>
                                  </>
                                )}
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedUserId(u.id);
                                  setPremiumDurationDays(30);
                                  setPremiumNote("");
                                  setPremiumGrantDialogOpen(true);
                                }}
                                disabled={grantMonthlyPremiumMutation.isPending}
                                className="border-green-500 bg-green-500/20 text-green-300 hover:bg-green-500/30 hover:text-green-200 gap-1 px-2"
                                title="プレミアムを付与"
                              >
                                {grantMonthlyPremiumMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <Crown className="w-4 h-4" />
                                    <span className="text-xs">付与</span>
                                  </>
                                )}
                              </Button>
                            )}
                            {/* 履歴表示ボタン */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setHistoryUserId(u.id);
                                setHistoryDialogOpen(true);
                              }}
                              className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/20"
                              title="プレミアム付与履歴"
                            >
                              <History className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setResetPasswordResult(null);
                                setResetPasswordDialogOpen(true);
                              }}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                              title="パスワードリセット"
                            >
                              <Key className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setDeleteDialogOpen(true);
                              }}
                              disabled={false}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              title="ユーザー削除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      {/* Create User Dialog */}
      <Dialog open={createUserDialogOpen} onOpenChange={(open) => {
        setCreateUserDialogOpen(open);
        if (!open) {
          setCreatedUserPassword(null);
          setNewUserEmail("");
          setNewUserName("");
          setNewUserPassword("");
          setNewUserIsPremium(false);
          setNewUserRole("user");
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新規ユーザー作成</DialogTitle>
            <DialogDescription>
              管理者が新しいユーザーアカウントを作成します。
            </DialogDescription>
          </DialogHeader>
          
          {createdUserPassword ? (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-400 font-medium mb-2">ユーザーを作成しました！</p>
                <p className="text-sm text-muted-foreground mb-3">
                  以下のパスワードをユーザーに共有してください。このパスワードは一度しか表示されません。
                </p>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <code className="flex-1 text-white font-mono">{createdUserPassword}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdUserPassword)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  setCreatedUserPassword(null);
                  setCreateUserDialogOpen(false);
                }}
              >
                閉じる
              </Button>
            </div>
          ) : (
            <>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-user-email">メールアドレス *</Label>
                  <Input
                    id="new-user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-user-name">名前 *</Label>
                  <Input
                    id="new-user-name"
                    type="text"
                    placeholder="山田 太郎"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="new-user-password">
                    パスワード（空欄の場合は自動生成）
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-user-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="8文字以上"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>ロール</Label>
                  <Select
                    value={newUserRole}
                    onValueChange={(value: "user" | "admin") => setNewUserRole(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">ユーザー</SelectItem>
                      <SelectItem value="admin">管理者</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="new-user-premium"
                    checked={newUserIsPremium}
                    onCheckedChange={(checked) => setNewUserIsPremium(checked as boolean)}
                  />
                  <Label htmlFor="new-user-premium" className="cursor-pointer">
                    プレミアム会員として登録
                  </Label>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateUserDialogOpen(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleCreateUser} disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <UserPlus className="w-4 h-4 mr-2" />
                  )}
                  作成
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Password Reset Dialog */}
      <Dialog open={resetPasswordDialogOpen} onOpenChange={(open) => {
        setResetPasswordDialogOpen(open);
        if (!open) {
          setResetPasswordResult(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>パスワードリセット</DialogTitle>
            <DialogDescription>
              {resetPasswordResult 
                ? "新しいパスワードが生成されました。"
                : "このユーザーのパスワードをリセットしますか？新しいパスワードが自動生成されます。"
              }
            </DialogDescription>
          </DialogHeader>
          
          {resetPasswordResult ? (
            <div className="py-4 space-y-4">
              <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-400 font-medium mb-2">新しいパスワード</p>
                <p className="text-sm text-muted-foreground mb-3">
                  以下のパスワードをユーザーに共有してください。このパスワードは一度しか表示されません。
                </p>
                <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                  <code className="flex-1 text-white font-mono">{resetPasswordResult}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(resetPasswordResult)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => {
                  setResetPasswordResult(null);
                  setResetPasswordDialogOpen(false);
                }}
              >
                閉じる
              </Button>
            </div>
          ) : (
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetPasswordDialogOpen(false)}>
                キャンセル
              </Button>
              <Button 
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Key className="w-4 h-4 mr-2" />
                )}
                リセット
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Bonus Dialog */}
      <Dialog open={bonusDialogOpen} onOpenChange={setBonusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ボーナス鑑定回数を追加</DialogTitle>
            <DialogDescription>
              ユーザーにボーナス鑑定回数を付与します。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="bonus-amount">追加する回数</Label>
            <Input
              id="bonus-amount"
              type="number"
              min={1}
              max={100}
              value={bonusAmount}
              onChange={(e) => setBonusAmount(parseInt(e.target.value) || 1)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBonusDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAddBonus} disabled={addBonusMutation.isPending}>
              {addBonusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              追加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ユーザーを削除</DialogTitle>
            <DialogDescription>
              このユーザーを削除しますか？この操作は取り消せません。
              ユーザーの全てのデータ（チャット履歴、セッション等）も削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Premium Grant Dialog */}
      <Dialog open={premiumGrantDialogOpen} onOpenChange={setPremiumGrantDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>プレミアムを付与</DialogTitle>
            <DialogDescription>
              ユーザーにプレミアムステータスを付与します。期間を選択してください。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label>期間を選択</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button
                  variant={premiumDurationDays === 0 ? "default" : "outline"}
                  onClick={() => setPremiumDurationDays(0)}
                  className="w-full"
                >
                  今月末まで
                </Button>
                <Button
                  variant={premiumDurationDays === 7 ? "default" : "outline"}
                  onClick={() => setPremiumDurationDays(7)}
                  className="w-full"
                >
                  7日間
                </Button>
                <Button
                  variant={premiumDurationDays === 30 ? "default" : "outline"}
                  onClick={() => setPremiumDurationDays(30)}
                  className="w-full"
                >
                  30日間
                </Button>
                <Button
                  variant={premiumDurationDays === 90 ? "default" : "outline"}
                  onClick={() => setPremiumDurationDays(90)}
                  className="w-full"
                >
                  90日間
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="premium-days">カスタム日数</Label>
              <Input
                id="premium-days"
                type="number"
                min={1}
                max={365}
                value={premiumDurationDays || ""}
                onChange={(e) => setPremiumDurationDays(parseInt(e.target.value) || 0)}
                placeholder="日数を入力（0=今月末まで）"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="premium-note">メモ（任意）</Label>
              <Input
                id="premium-note"
                value={premiumNote}
                onChange={(e) => setPremiumNote(e.target.value)}
                placeholder="付与理由など"
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumGrantDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              onClick={() => {
                if (selectedUserId) {
                  grantMonthlyPremiumMutation.mutate({
                    userId: selectedUserId,
                    durationDays: premiumDurationDays || undefined,
                    note: premiumNote || undefined,
                  });
                  setPremiumGrantDialogOpen(false);
                }
              }}
              disabled={grantMonthlyPremiumMutation.isPending}
            >
              {grantMonthlyPremiumMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Calendar className="w-4 h-4 mr-2" />
              )}
              付与
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* User Detail Dialog */}
      <AdminUserDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        user={detailUser}
      />
      
      {/* Premium History Dialog */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>プレミアム付与履歴</DialogTitle>
            <DialogDescription>
              このユーザーのプレミアム付与履歴を表示します。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {historyQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : historyQuery.data && historyQuery.data.length > 0 ? (
              <div className="space-y-3">
                {historyQuery.data.map((h) => (
                  <div key={h.id} className="p-4 bg-muted/50 rounded-lg border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {h.grantType === "manual" && "管理者付与"}
                        {h.grantType === "code" && "合言葉使用"}
                        {h.grantType === "subscription" && "サブスクリプション"}
                        {h.grantType === "referral" && "紹介報酬"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(h.createdAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">期間: </span>
                        <span>{h.durationDays}日間</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">終了日: </span>
                        <span>{new Date(h.endDate).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>
                    {h.note && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        メモ: {h.note}
                      </div>
                    )}
                    {h.relatedCode && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        コード: {h.relatedCode}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                履歴がありません
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryDialogOpen(false)}>
              閉じる
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
