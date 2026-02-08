import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  CreditCard, 
  Crown, 
  ArrowLeft, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  XCircle,
  Info,
  Gift,
  Users,
  Copy,
  Check,
  Sparkles,
  Zap,
  Key,
  Undo2,
  Star,
  MessageCircle,
  Heart
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MobileNav from "@/components/MobileNav";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

// 解約理由の選択肢
const CANCELLATION_REASONS = [
  { value: "price", label: "料金が高い", icon: "💰" },
  { value: "not_useful", label: "あまり使わなかった", icon: "📉" },
  { value: "not_accurate", label: "鑑定結果に満足できなかった", icon: "🎯" },
  { value: "found_alternative", label: "他のサービスを見つけた", icon: "🔄" },
  { value: "temporary", label: "一時的に休止したい", icon: "⏸️" },
  { value: "other", label: "その他", icon: "📝" },
] as const;

type CancellationReason = typeof CANCELLATION_REASONS[number]["value"];

// 振込先情報の行コンポーネント
function BankInfoRow({ 
  label, 
  value, 
  code, 
  codeLabel, 
  copyable 
}: { 
  label: string; 
  value: string; 
  code?: string; 
  codeLabel?: string; 
  copyable?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(`${label}をコピーしました`);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground w-24">{label}</span>
        <span className="font-medium">{value}</span>
        {code && (
          <span className="text-xs text-muted-foreground">({codeLabel}: {code})</span>
        )}
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(value)}
          className="h-7 px-2 text-gold hover:bg-gold/10"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      )}
      {code && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(code)}
          className="h-7 px-2 text-muted-foreground hover:bg-white/10"
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        </Button>
      )}
    </div>
  );
}

export default function Subscription() {
  const { user, loading: authLoading } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [referralCodeInput, setReferralCodeInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationCodeInput, setActivationCodeInput] = useState("");
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  
  // 解約ダイアログ関連のstate
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancellationReason | "">("");
  const [cancelComment, setCancelComment] = useState("");
  const [cancelStep, setCancelStep] = useState<"confirm" | "reason">("confirm");
  
  const { data: subscriptionDetails, isLoading: detailsLoading, refetch: refetchDetails } = 
    trpc.subscription.getDetails.useQuery(undefined, {
      enabled: !!user,
    });
  
  const { data: paymentInfo } = trpc.subscription.getPaymentHistory.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: paymentUrlData } = trpc.subscription.getPaymentUrl.useQuery(
    { planType: "premium" },
    { enabled: !!user }
  );

  const { data: remainingReadings, refetch: refetchReadings } = trpc.subscription.getRemainingReadings.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: referralData, refetch: refetchReferral } = trpc.subscription.getReferralCode.useQuery(undefined, {
    enabled: !!user,
  });

  const cancelSubscription = trpc.subscription.cancelSubscription.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowCancelDialog(false);
      setCancelReason("");
      setCancelComment("");
      setCancelStep("confirm");
      refetchDetails();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // 解約撤回のmutation
  const revertCancellation = trpc.subscription.revertCancellation.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchDetails();
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const applyReferralCode = trpc.subscription.applyReferralCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        refetchReadings();
        refetchReferral();
        setReferralCodeInput("");
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const reactivateSubscription = trpc.subscription.reactivateSubscription.useMutation({
    onSuccess: (data) => {
      if (data.paymentUrl) {
        toast.info(data.message);
        window.open(data.paymentUrl, "_blank");
      } else {
        toast.info(data.message);
      }
      refetchDetails();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Report bank transfer completion mutation
  const reportBankTransferMutation = trpc.subscription.reportBankTransferComplete.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
    },
  });

  // Apply activation code mutation
  const applyActivationCodeMutation = trpc.subscription.applyActivationCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(data.message);
        setShowActivationDialog(false);
        setActivationCodeInput("");
        refetchDetails();
        refetchReadings();
      } else {
        toast.error(data.message);
      }
      setIsApplyingCode(false);
    },
    onError: (error) => {
      toast.error(error.message || "エラーが発生しました");
      setIsApplyingCode(false);
    },
  });

  const handleApplyActivationCode = () => {
    if (!activationCodeInput.trim()) {
      toast.error("合言葉を入力してください");
      return;
    }
    setIsApplyingCode(true);
    applyActivationCodeMutation.mutate({ code: activationCodeInput.trim() });
  };

  const handleUpgrade = () => {
    setIsUpgrading(true);
    
    if (paymentUrlData?.isConfigured && paymentUrlData.url) {
      toast.info("決済ページへ移動します...");
      window.open(paymentUrlData.url, "_blank");
    } else {
      // Show activation code dialog instead of "coming soon"
      setShowActivationDialog(true);
    }
    
    setIsUpgrading(false);
  };

  // 解約ボタンクリック時 - 確認ダイアログを表示
  const handleCancelClick = () => {
    setCancelStep("confirm");
    setShowCancelDialog(true);
  };

  // 解約確認後 - 理由選択へ進む
  const handleProceedToReason = () => {
    setCancelStep("reason");
  };

  // 解約実行
  const handleConfirmCancel = () => {
    if (!cancelReason) {
      toast.error("解約理由を選択してください");
      return;
    }
    cancelSubscription.mutate({ 
      reason: cancelReason, 
      comment: cancelComment || undefined 
    });
  };

  // 解約撤回
  const handleRevertCancellation = () => {
    revertCancellation.mutate();
  };

  const handleReactivate = () => {
    reactivateSubscription.mutate();
  };

  const handleCopyReferralLink = () => {
    if (referralData?.url) {
      navigator.clipboard.writeText(referralData.url);
      setCopied(true);
      toast.success("紹介リンクをコピーしました！");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApplyReferralCode = () => {
    if (referralCodeInput.trim()) {
      applyReferralCode.mutate({ code: referralCodeInput.trim() });
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">有効</Badge>;
      case "canceled":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">解約予定</Badge>;
      case "past_due":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">支払い遅延</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">未加入</Badge>;
    }
  };

  const isPremiumUser = () => {
    const pt = remainingReadings?.planType;
    return pt === "premium" || pt === "premium_unlimited" || pt === "standard";
  };

  const getPlanName = () => {
    if (isPremiumUser()) return "プレミアムプラン";
    if (remainingReadings?.planType === "trial") return "無料体験";
    return "無料体験";
  };

  const getPlanPrice = () => {
    if (isPremiumUser()) return "¥1,980";
    return "¥0";
  };

  const getPlanLimit = () => {
    if (isPremiumUser()) return "無制限";
    if (remainingReadings?.planType === "trial") return "各占い師と3往復無料";
    return `残り${remainingReadings?.remaining || 0}回`;
  };

  // 残り利用期間を計算
  const getRemainingDays = () => {
    if (!subscriptionDetails?.currentPeriodEnd) return null;
    const endDate = new Date(subscriptionDetails.currentPeriodEnd);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background mystical-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mystical-bg">
      <MobileNav />
      
      <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">サブスクリプション管理</h1>
            <p className="text-muted-foreground">プランの確認・変更</p>
          </div>
        </div>

        {/* Current Plan Status */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-gold" />
              現在のプラン
            </CardTitle>
          </CardHeader>
          <CardContent>
            {detailsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-4 w-40" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl font-bold">{getPlanName()}</span>
                      {getStatusBadge(subscriptionDetails?.subscriptionStatus || null)}
                    </div>
                    <p className="text-muted-foreground">{getPlanLimit()}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gold">{getPlanPrice()}</div>
                    <p className="text-sm text-muted-foreground">/ 月</p>
                  </div>
                </div>

                {/* Canceled Subscription Info */}
                {subscriptionDetails?.subscriptionStatus === "canceled" && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-yellow-400">解約しました</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      来月（次回請求日）まではサービスをご利用いただけます。
                      {subscriptionDetails?.currentPeriodEnd && (
                        <span className="block mt-1 text-yellow-400">
                          ご利用期限: {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleRevertCancellation}
                      disabled={revertCancellation.isPending}
                      className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                    >
                      {revertCancellation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Undo2 className="w-4 h-4 mr-2" />
                      )}
                      解約を取り消す
                    </Button>
                  </div>
                )}

                {/* Trial Users Info */}
                {(remainingReadings?.planType === "trial" || remainingReadings?.planType === "free") && subscriptionDetails?.subscriptionStatus !== "canceled" && (
                  <div className="p-4 rounded-lg bg-gold/5 border border-gold/20">
                    <p className="text-sm text-muted-foreground">
                      各占い師と<span className="text-gold font-bold">3往復</span>の相談が無料で体験できます。
                      本格的な鑑定を楽しむには、プレミアムプランへの登録が必要です。
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4">
                  {(remainingReadings?.planType === "trial" || remainingReadings?.planType === "free") && (
                    <Button 
                      onClick={() => setShowActivationDialog(true)}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Key className="w-4 h-4 mr-2" />
                      合言葉を入力してプレミアムを有効化
                    </Button>
                  )}
                  {isPremiumUser() && subscriptionDetails?.subscriptionStatus !== "canceled" && (
                    <Button 
                      variant="outline"
                      onClick={handleCancelClick}
                      disabled={cancelSubscription.isPending}
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      {cancelSubscription.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      解約する
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trial Experience Info */}
        <Card className="glass-card mb-8 border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gold" />
              無料体験について
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gold/5 border border-gold/20 mb-6">
              <p className="text-sm text-muted-foreground">
                各占い師と<span className="text-gold font-bold">3往復</span>の相談が無料で体験できます。
                あなたに合った占い師を見つけてから、本格的な鑑定をお楽しみください。
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Plan Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Standard Plan */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                スタンダードプラン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">スタンダード</h3>
                    <p className="text-muted-foreground">毎日の占いを楽しむ</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-blue-400">¥980<span className="text-sm">/月</span></p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>1日10回までの鑑定</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>全占い師と相談可能</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>親密度システム・特典解放</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>鑑定履歴の保存</span>
                  </li>
                </ul>
                {!isPremiumUser() && remainingReadings?.planType !== 'standard' && (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  >
                    {isUpgrading ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />処理中...</>
                    ) : (
                      <><Zap className="w-4 h-4 mr-2" />スタンダードにアップグレード</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="glass-card border-gold/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold" />
                  プレミアムプラン
                </CardTitle>
                <Badge className="bg-gold/20 text-gold">おすすめ</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="p-6 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold">プレミアム</h3>
                    <p className="text-muted-foreground">すべての機能が使い放題</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gold">¥1,980<span className="text-sm">/月</span></p>
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="font-bold text-gold">鑑定無制限（回数制限なし）</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>全占い師と相談可能</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>音声通話・画像機能</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>鑑定履歴の無期限保存</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>優先サポート</span>
                  </li>
                </ul>
                {!isPremiumUser() && (
                  <Button 
                    onClick={handleUpgrade}
                    disabled={isUpgrading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isUpgrading ? (
                      <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />処理中...</>
                    ) : (
                      <><Zap className="w-4 h-4 mr-2" />プレミアムにアップグレード</>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Section */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-gold" />
              友達紹介プログラム
            </CardTitle>
            <CardDescription>
              友達を紹介して、お互いにボーナス鑑定回数をゲット！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Your Referral Link */}
              <div className="p-4 rounded-lg bg-white/5 border border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-gold" />
                  <span className="font-medium">あなたの紹介リンク</span>
                </div>
                {referralData?.url ? (
                  <div className="flex gap-2">
                    <Input 
                      value={referralData.url} 
                      readOnly 
                      className="bg-white/5 border-white/20 text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCopyReferralLink}
                      className="border-gold/30 text-gold hover:bg-gold/10 shrink-0"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">紹介リンクを生成中...</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  紹介された方が登録すると、お互いに3回分のボーナス鑑定がもらえます！
                </p>
              </div>

              {/* Apply Referral Code */}
              <div className="p-4 rounded-lg bg-white/5 border border-border/20">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-gold" />
                  <span className="font-medium">紹介コードを入力</span>
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="紹介コードを入力"
                    value={referralCodeInput}
                    onChange={(e) => setReferralCodeInput(e.target.value)}
                    className="bg-white/5 border-white/20"
                  />
                  <Button 
                    variant="outline"
                    onClick={handleApplyReferralCode}
                    disabled={applyReferralCode.isPending || !referralCodeInput.trim()}
                    className="border-gold/30 text-gold hover:bg-gold/10 shrink-0"
                  >
                    {applyReferralCode.isPending ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      "適用"
                    )}
                  </Button>
                </div>
              </div>

              {/* Referral Stats */}
              {referralData && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-white/5 border border-border/20 text-center">
                    <p className="text-2xl font-bold text-gold">{referralData.usedCount || 0}</p>
                    <p className="text-sm text-muted-foreground">紹介した人数</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/5 border border-border/20 text-center">
                    <p className="text-2xl font-bold text-gold">{referralData.bonusReadings || 0}</p>
                    <p className="text-sm text-muted-foreground">獲得ボーナス回数</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Continuation Bonus Section */}
        <Card className="glass-card mb-8 border-gold/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-gold" />
              継続ボーナス特典
            </CardTitle>
            <CardDescription>
              プレミアムプランを継続して報酬をゲット！
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 rounded-lg bg-gradient-to-br from-gold/10 to-amber-500/10 border border-gold/30 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-5 h-5 text-gold" />
                <span className="font-medium text-gold">継続すればするほどお得！</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">3</div>
                    <span>3ヶ月継続</span>
                  </div>
                  <span className="font-bold text-gold">¥500</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">6</div>
                    <span>6ヶ月継続</span>
                  </div>
                  <span className="font-bold text-gold">¥1,000</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold font-bold">12</div>
                    <span>12ヶ月継続</span>
                  </div>
                  <span className="font-bold text-gold">¥2,000</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              ※ 報酬は自動で付与され、「紹介報酬」ページから出金申請できます。
            </p>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gold" />
              お支払い情報
            </CardTitle>
            <CardDescription>
              振込先口座情報
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 振込先情報 */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-gold/10 to-amber-500/10 border border-gold/30">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-gold" />
                  <span className="font-medium text-gold">振込先口座</span>
                </div>
                <div className="space-y-3">
                  <BankInfoRow label="金融機関名" value="楽天銀行" code="0036" codeLabel="金融機関コード" />
                  <BankInfoRow label="支店名" value="エンカ支店" code="216" codeLabel="支店コード" />
                  <BankInfoRow label="預金種別" value="普通預金" />
                  <BankInfoRow label="口座番号" value="1479015" copyable />
                  <BankInfoRow label="口座名義" value="タケベケイサク" />
                </div>
              </div>
              
              {/* 振込時の注意事項 */}
              <div className="p-4 rounded-lg bg-white/5 border border-border/20">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="font-medium mb-2">振込時の注意事項</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>・振込人名の前に会員番号（ID: {user?.id || '---'}）を記載してください</li>
                      <li>・振込手数料はお客様のご負担となります</li>
                      <li>・振込完了後、下のボタンを押してください</li>
                      <li>・確認後、プレミアムプランが自動で有効になります</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* 振込完了報告ボタン */}
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-400" />
                    <span className="font-medium text-green-400">振込が完了したら</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    振込が完了したら、下のボタンを押してお知らせください。
                    確認後、プレミアムプランが自動で有効になります。
                  </p>
                  <Button
                    onClick={() => reportBankTransferMutation.mutate()}
                    disabled={reportBankTransferMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    {reportBankTransferMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 mr-2" />
                    )}
                    振込完了を報告する
                  </Button>
                </div>
              </div>
              
              {paymentInfo?.message && (
                <div className="p-4 rounded-lg bg-white/5 border border-border/20">
                  <p className="text-sm text-muted-foreground">{paymentInfo.message}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Support */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gold" />
              お困りの場合
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              ご不明な点がございましたら、お気軽にお問い合わせください。
            </p>
            <Link href="/contact">
              <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/10">
                <ExternalLink className="w-4 h-4 mr-2" />
                お問い合わせ
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Activation Code Dialog */}
      <Dialog open={showActivationDialog} onOpenChange={setShowActivationDialog}>
        <DialogContent className="sm:max-w-md bg-background border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-gold" />
              合言葉を入力
            </DialogTitle>
            <DialogDescription>
              プレミアムプランを有効にするための合言葉を入力してください。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="合言葉を入力（例: TRIAL-SIXORACLE-2026）"
                value={activationCodeInput}
                onChange={(e) => setActivationCodeInput(e.target.value)}
                className="bg-white/5 border-white/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isApplyingCode) {
                    handleApplyActivationCode();
                  }
                }}
              />
            </div>
            <div className="p-3 rounded-lg bg-gold/5 border border-gold/20">
              <p className="text-xs text-muted-foreground">
                合言葉は銀行振込確認後にメールでお送りします。
                まだお持ちでない場合は、下記の「銀行振込で申し込む」ボタンからお申し込みください。
              </p>
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowActivationDialog(false)}
              className="border-white/20"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleApplyActivationCode}
              disabled={isApplyingCode || !activationCodeInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isApplyingCode ? (
                <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />確認中...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />プレミアムを有効化</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={(open) => {
        setShowCancelDialog(open);
        if (!open) {
          setCancelStep("confirm");
          setCancelReason("");
          setCancelComment("");
        }
      }}>
        <DialogContent className="sm:max-w-lg bg-background border-white/10">
          {cancelStep === "confirm" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-yellow-400">
                  <AlertCircle className="w-5 h-5" />
                  解約の確認
                </DialogTitle>
                <DialogDescription>
                  本当に解約しますか？
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* 現在の特典を表示 */}
                <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-gold" />
                    現在ご利用中の特典
                  </h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      鑑定無制限（回数制限なし）
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      8人の占い師全員と相談可能
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-400" />
                      鑑定履歴の無期限保存
                    </li>
                  </ul>
                </div>

                {/* 残り期間の表示 */}
                {subscriptionDetails?.currentPeriodEnd && (
                  <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-yellow-400" />
                      <span className="font-medium text-yellow-400">解約後も利用可能</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      解約しても、<span className="text-yellow-400 font-bold">
                        {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>まではサービスをご利用いただけます。
                      {getRemainingDays() !== null && (
                        <span className="block mt-1">
                          （残り<span className="text-yellow-400 font-bold">{getRemainingDays()}日</span>）
                        </span>
                      )}
                    </p>
                  </div>
                )}

                {/* 重要な注意事項 */}
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="font-medium text-red-400">重要な注意事項</span>
                  </div>
                  <p className="text-sm text-red-200">
                    一度解約すると、<span className="font-bold">継続特典（3ヶ月継続報酬等）はリセット</span>され、最初からのカウントとなります。
                  </p>
                  <p className="text-xs text-red-300/70 mt-2">
                    ※当サービスはシステムで全ての利用履歴を管理しており、不正な継続カウントの操作は不可能です。
                  </p>
                </div>

                {/* 親密度喪失警告 */}
                <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="font-medium text-pink-400">占い師との絆が失われます</span>
                  </div>
                  <p className="text-sm text-pink-200">
                    解約すると、<span className="font-bold">占い師との親密度がリセット</span>されます。
                    これまで積み重ねた会話による深い鑑定が受けられなくなります。
                  </p>
                  <p className="text-xs text-pink-300/70 mt-2">
                    ※ 再加入しても親密度はレベル1からのスタートとなります
                  </p>
                </div>

                <p className="text-sm text-muted-foreground">
                  解約理由をお聞かせいただけますか？サービス改善の参考にさせていただきます。
                </p>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCancelDialog(false)}
                  className="border-white/20"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleProceedToReason}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  解約手続きを続ける
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-gold" />
                  解約理由をお聞かせください
                </DialogTitle>
                <DialogDescription>
                  今後のサービス改善のため、解約理由をお聞かせください。
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <RadioGroup 
                  value={cancelReason} 
                  onValueChange={(value) => setCancelReason(value as CancellationReason)}
                  className="space-y-3"
                >
                  {CANCELLATION_REASONS.map((reason) => (
                    <div key={reason.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label 
                        htmlFor={reason.value} 
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <span>{reason.icon}</span>
                        <span>{reason.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {cancelReason === "other" && (
                  <div className="space-y-2">
                    <Label htmlFor="cancel-comment">詳細（任意）</Label>
                    <Textarea
                      id="cancel-comment"
                      placeholder="ご意見・ご要望があればお聞かせください"
                      value={cancelComment}
                      onChange={(e) => setCancelComment(e.target.value)}
                      className="bg-white/5 border-white/20 min-h-[100px]"
                    />
                  </div>
                )}
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCancelStep("confirm")}
                  className="border-white/20"
                >
                  戻る
                </Button>
                <Button
                  onClick={handleConfirmCancel}
                  disabled={!cancelReason || cancelSubscription.isPending}
                  variant="outline"
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {cancelSubscription.isPending ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />処理中...</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-2" />解約を確定する</>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
