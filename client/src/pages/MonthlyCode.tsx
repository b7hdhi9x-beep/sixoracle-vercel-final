import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { 
  Calendar, ArrowLeft, Loader2, Crown, Sparkles, AlertCircle, Phone
} from "lucide-react";
import { toast } from "sonner";

export default function MonthlyCode() {
  const [code, setCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [redeemSuccess, setRedeemSuccess] = useState<{
    message: string;
    durationDays: number;
    premiumExpiresAt: string;
    phoneNumber: string;
  } | null>(null);
  
  const redeemMutation = trpc.monthlyCode.redeem.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setRedeemSuccess({
        message: data.message,
        durationDays: data.durationDays,
        premiumExpiresAt: data.premiumExpiresAt,
        phoneNumber: data.phoneNumber,
      });
      setCode("");
      setPhoneNumber("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleRedeem = () => {
    if (!code.trim()) {
      toast.error("合言葉を入力してください");
      return;
    }
    if (!phoneNumber.trim()) {
      toast.error("電話番号を入力してください");
      return;
    }
    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/[\s\-\(\)]/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      toast.error("正しい電話番号を入力してください");
      return;
    }
    redeemMutation.mutate({ code: code.trim(), phoneNumber: cleanPhone });
  };
  
  // Get current month display
  const now = new Date();
  const currentMonthDisplay = `${now.getFullYear()}年${now.getMonth() + 1}月`;
  
  return (
    <div className="min-h-screen bg-background mystical-bg">
      {/* Header */}
      <header className="border-b border-border/20 bg-background/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-purple-400" />
            <h1 className="text-xl font-bold text-purple-400">今月の合言葉</h1>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-purple-400/30 text-purple-400 hover:bg-purple-400/20">
              <ArrowLeft className="w-4 h-4 mr-2" />
              トップに戻る
            </Button>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-lg">
        {redeemSuccess ? (
          // Success State
          <Card className="glass-card">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Crown className="w-10 h-10 text-gold fill-gold" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">プレミアムプランが有効になりました！</h2>
              <p className="text-muted-foreground mb-6">{redeemSuccess.message}</p>
              <div className="bg-white/5 rounded-lg p-4 mb-6 space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">登録電話番号</p>
                  <p className="text-lg font-mono text-purple-400">{redeemSuccess.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">プレミアム有効期限</p>
                  <p className="text-xl font-bold text-gold">
                    {new Date(redeemSuccess.premiumExpiresAt).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                この電話番号でログインすると、プレミアムプランをご利用いただけます。
              </p>
              <Link href="/">
                <Button className="btn-primary">
                  <Sparkles className="w-4 h-4 mr-2" />
                  占いを始める
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          // Input State
          <Card className="glass-card">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-purple-400" />
              </div>
              <CardTitle className="text-2xl text-white">{currentMonthDisplay}の合言葉</CardTitle>
              <CardDescription>
                合言葉と電話番号を入力してプレミアムプランを有効にしましょう
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  電話番号
                </label>
                <Input
                  type="tel"
                  placeholder="090-1234-5678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-lg"
                />
                <p className="text-xs text-muted-foreground">
                  ※ログイン時に使用する電話番号を入力してください
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  合言葉
                </label>
                <Input
                  placeholder="合言葉を入力..."
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="bg-white/5 border-white/10 text-white text-center text-lg font-mono tracking-widest"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRedeem();
                    }
                  }}
                />
              </div>
              
              <Button
                onClick={handleRedeem}
                disabled={redeemMutation.isPending || !code.trim() || !phoneNumber.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {redeemMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    確認中...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    プレミアムを有効にする
                  </>
                )}
              </Button>
              
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-purple-400 mb-1">ご案内</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>合言葉は毎月変更されます</li>
                      <li>使用後はプレミアムプランが30日間有効になります</li>
                      <li>ログイン不要でどなたでも使用できます</li>
                      <li>入力した電話番号でログインしてご利用ください</li>
                    </ul>
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
