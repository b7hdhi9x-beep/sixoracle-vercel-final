import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { useEffect, useState } from "react";
import { 
  Ticket, ArrowLeft, Loader2, Crown, Gift, Sparkles, Check
} from "lucide-react";
import { toast } from "sonner";

export default function Coupon() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const [couponCode, setCouponCode] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<{
    message: string;
    type: string;
  } | null>(null);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  
  const redeemMutation = trpc.coupon.redeem.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setRedeemSuccess({ message: data.message, type: data.type });
      setCouponCode("");
      // Invalidate user data to refresh premium status
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }
  
  // If not authenticated, show loading (redirect will happen)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }
  
  const handleRedeem = () => {
    if (!couponCode.trim()) {
      toast.error("クーポンコードを入力してください");
      return;
    }
    redeemMutation.mutate({ code: couponCode.trim() });
  };
  
  return (
    <div className="min-h-screen bg-background mystical-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Ticket className="w-6 h-6 text-gold" />
            <h1 className="text-xl font-bold text-gold">クーポン入力</h1>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" className="border-gold/30 text-gold hover:bg-gold/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ダッシュボードに戻る
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {redeemSuccess ? (
          // Success State
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                {redeemSuccess.type === "premium_monthly" || redeemSuccess.type === "premium_lifetime" ? (
                  <Crown className="w-10 h-10 text-gold fill-gold" />
                ) : (
                  <Gift className="w-10 h-10 text-green-500" />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gold">クーポン適用完了！</h2>
              <p className="text-lg mb-6">{redeemSuccess.message}</p>
              <div className="flex flex-col gap-3">
                <Link href="/dashboard">
                  <Button className="btn-primary w-full">
                    <Sparkles className="w-4 h-4 mr-2" />
                    占いを始める
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={() => setRedeemSuccess(null)}
                  className="border-gold/30 text-gold hover:bg-gold/20"
                >
                  別のクーポンを入力
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Input State
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gold/20 flex items-center justify-center">
                <Ticket className="w-8 h-8 text-gold" />
              </div>
              <CardTitle className="text-gold text-2xl">クーポンコードを入力</CardTitle>
              <CardDescription>
                お持ちのクーポンコードを入力して特典を受け取りましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Input
                  placeholder="例: WELCOME2024"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-center text-lg font-mono tracking-wider h-14"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRedeem();
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  大文字・小文字は区別されません
                </p>
              </div>
              
              <Button 
                onClick={handleRedeem}
                disabled={redeemMutation.isPending || !couponCode.trim()}
                className="btn-primary w-full h-12 text-lg"
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    確認中...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    クーポンを適用
                  </>
                )}
              </Button>
              
              {/* Info Section */}
              <div className="pt-4 border-t border-border/20">
                <h3 className="text-sm font-medium text-gold mb-3">クーポンで受け取れる特典</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-gold" />
                    <span>プレミアムプランの無料体験</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-green-500" />
                    <span>ボーナス鑑定回数の追加</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
