import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { 
  Ticket, Shield, ArrowLeft, Plus, Trash2, Copy, Check,
  Loader2, Crown, Gift, Calendar, Users, ToggleLeft, ToggleRight
} from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";

type CouponType = "premium_monthly" | "premium_lifetime" | "bonus_readings";

export default function AdminCoupons() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const utils = trpc.useUtils();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    description: "",
    type: "premium_monthly" as CouponType,
    value: 5,
    durationDays: 30,
    maxUses: undefined as number | undefined,
  });
  
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
  
  // Get all coupons (admin only)
  const couponsQuery = trpc.admin.getAllCoupons.useQuery(undefined, {
    enabled: hasAccess,
  });
  
  const createCouponMutation = trpc.admin.createCoupon.useMutation({
    onSuccess: () => {
      toast.success("クーポンを作成しました");
      utils.admin.getAllCoupons.invalidate();
      setCreateDialogOpen(false);
      setNewCoupon({
        code: "",
        description: "",
        type: "premium_monthly",
        value: 5,
        durationDays: 30,
        maxUses: undefined,
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateCouponMutation = trpc.admin.updateCoupon.useMutation({
    onSuccess: () => {
      toast.success("クーポンを更新しました");
      utils.admin.getAllCoupons.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteCouponMutation = trpc.admin.deleteCoupon.useMutation({
    onSuccess: () => {
      toast.success("クーポンを削除しました");
      utils.admin.getAllCoupons.invalidate();
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
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
  
  const allCoupons = couponsQuery.data || [];
  
  const handleCreateCoupon = () => {
    if (!newCoupon.code.trim()) {
      toast.error("クーポンコードを入力してください");
      return;
    }
    
    createCouponMutation.mutate({
      code: newCoupon.code,
      description: newCoupon.description || undefined,
      type: newCoupon.type,
      value: newCoupon.type === "bonus_readings" ? newCoupon.value : 0,
      durationDays: newCoupon.type === "premium_monthly" ? newCoupon.durationDays : undefined,
      maxUses: newCoupon.maxUses,
    });
  };
  
  const handleToggleActive = (couponId: number, currentActive: boolean) => {
    updateCouponMutation.mutate({ id: couponId, isActive: !currentActive });
  };
  
  const handleDeleteCoupon = () => {
    if (selectedCouponId) {
      deleteCouponMutation.mutate({ id: selectedCouponId });
    }
  };
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("コードをコピーしました");
    setTimeout(() => setCopiedCode(null), 2000);
  };
  
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "premium_monthly": return "期間限定プレミアム";
      case "premium_lifetime": return "永久プレミアム";
      case "bonus_readings": return "ボーナス鑑定";
      default: return type;
    }
  };
  
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "premium_monthly": return <Calendar className="w-4 h-4" />;
      case "premium_lifetime": return <Crown className="w-4 h-4" />;
      case "bonus_readings": return <Gift className="w-4 h-4" />;
      default: return <Ticket className="w-4 h-4" />;
    }
  };
  
  return (
    <div className="min-h-screen bg-background admin-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">クーポン管理</h1>
          </div>
          <Link href={`/admin?token=${token}`}>
            <Button variant="outline" className="border-admin-primary/30 text-white hover:bg-admin-primary/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              管理者ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総クーポン数</p>
                  <p className="text-3xl font-bold text-white">{allCoupons.length}</p>
                </div>
                <Ticket className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">有効なクーポン</p>
                  <p className="text-3xl font-bold text-white">
                    {allCoupons.filter(c => c.isActive).length}
                  </p>
                </div>
                <Check className="w-10 h-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card-admin">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">総使用回数</p>
                  <p className="text-3xl font-bold text-white">
                    {allCoupons.reduce((sum, c) => sum + c.usedCount, 0)}
                  </p>
                </div>
                <Users className="w-10 h-10 text-white/50" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Create Button */}
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="btn-admin-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規クーポン作成
          </Button>
        </div>
        
        {/* Coupons Table */}
        <Card className="glass-card-admin">
          <CardHeader>
            <CardTitle className="text-white">クーポン一覧</CardTitle>
          </CardHeader>
          <CardContent>
            {couponsQuery.isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : allCoupons.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                クーポンがありません。新規作成してください。
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">コード</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">種類</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">説明</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">使用状況</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">状態</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allCoupons.map((coupon) => (
                      <tr key={coupon.id} className="border-b border-border/10 hover:bg-white/5">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-admin-primary/20 px-2 py-1 rounded text-white font-mono">
                              {coupon.code}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(coupon.code)}
                              className="h-8 w-8 p-0"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-4 h-4 text-green-500" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(coupon.type)}
                            <span className="text-sm">{getTypeLabel(coupon.type)}</span>
                            {coupon.type === "premium_monthly" && coupon.durationDays && (
                              <span className="text-xs text-muted-foreground">({coupon.durationDays}日)</span>
                            )}
                            {coupon.type === "bonus_readings" && (
                              <span className="text-xs text-muted-foreground">(+{coupon.value}回)</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-sm max-w-xs truncate">
                          {coupon.description || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm">
                            {coupon.usedCount}
                            {coupon.maxUses && <span className="text-muted-foreground">/{coupon.maxUses}</span>}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                            className={coupon.isActive ? "text-green-500" : "text-muted-foreground"}
                          >
                            {coupon.isActive ? (
                              <ToggleRight className="w-6 h-6" />
                            ) : (
                              <ToggleLeft className="w-6 h-6" />
                            )}
                          </Button>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCouponId(coupon.id);
                              setDeleteDialogOpen(true);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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
      
      {/* Create Coupon Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新規クーポン作成</DialogTitle>
            <DialogDescription>
              ユーザーに配布するクーポンコードを作成します。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="coupon-code">クーポンコード</Label>
              <Input
                id="coupon-code"
                placeholder="例: WELCOME2024"
                value={newCoupon.code}
                onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                className="mt-2 font-mono"
              />
              <p className="text-xs text-muted-foreground mt-1">自動的に大文字に変換されます</p>
            </div>
            
            <div>
              <Label htmlFor="coupon-type">クーポン種類</Label>
              <Select
                value={newCoupon.type}
                onValueChange={(value: CouponType) => setNewCoupon({ ...newCoupon, type: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium_monthly">期間限定プレミアム</SelectItem>
                  <SelectItem value="premium_lifetime">永久プレミアム</SelectItem>
                  <SelectItem value="bonus_readings">ボーナス鑑定回数</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newCoupon.type === "premium_monthly" && (
              <div>
                <Label htmlFor="duration-days">有効期間（日数）</Label>
                <Input
                  id="duration-days"
                  type="number"
                  min={1}
                  max={365}
                  value={newCoupon.durationDays}
                  onChange={(e) => setNewCoupon({ ...newCoupon, durationDays: parseInt(e.target.value) || 30 })}
                  className="mt-2"
                />
              </div>
            )}
            
            {newCoupon.type === "bonus_readings" && (
              <div>
                <Label htmlFor="bonus-value">追加する鑑定回数</Label>
                <Input
                  id="bonus-value"
                  type="number"
                  min={1}
                  max={100}
                  value={newCoupon.value}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: parseInt(e.target.value) || 5 })}
                  className="mt-2"
                />
              </div>
            )}
            
            <div>
              <Label htmlFor="max-uses">使用上限（任意）</Label>
              <Input
                id="max-uses"
                type="number"
                min={1}
                placeholder="無制限"
                value={newCoupon.maxUses || ""}
                onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: e.target.value ? parseInt(e.target.value) : undefined })}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">空欄の場合は無制限</p>
            </div>
            
            <div>
              <Label htmlFor="description">説明（任意）</Label>
              <Textarea
                id="description"
                placeholder="例: 新規登録キャンペーン用"
                value={newCoupon.description}
                onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              キャンセル
            </Button>
            <Button onClick={handleCreateCoupon} disabled={createCouponMutation.isPending}>
              {createCouponMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              作成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>クーポンを削除</DialogTitle>
            <DialogDescription>
              このクーポンを削除しますか？この操作は取り消せません。
              使用履歴も削除されます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              キャンセル
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCoupon}
              disabled={deleteCouponMutation.isPending}
            >
              {deleteCouponMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
