"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, Crown, Gift, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

export default function PurchaseSuccess() {
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const [purchaseType, setPurchaseType] = useState<string>("default");
  const [remainingReadings, setRemainingReadings] = useState<number | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const type = searchParams.get("type") || "default";
    setPurchaseType(type);
  }, [searchParams]);

  // Fetch subscription status
  useEffect(() => {
    if (!user) return;
    fetch("/api/subscription/status")
      .then(res => res.json())
      .then(data => {
        setIsPremium(data.isPremium || false);
        setRemainingReadings(data.remaining || 0);
      })
      .catch(() => {});
  }, [user]);

  // Trigger confetti animation on mount
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }
    const interval: ReturnType<typeof setInterval> = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#9370DB', '#00CED1'],
      });
    }, 250);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background mystical-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
      </div>
    );
  }

  const getPurchaseInfo = () => {
    switch (purchaseType) {
      case "recovery":
        return {
          icon: <Gift className="w-16 h-16 text-pink-400" />,
          title: "回数回復完了！",
          description: "鑑定回数が30回に回復しました",
          color: "pink",
        };
      case "oracle":
        return {
          icon: <Sparkles className="w-16 h-16 text-gold" />,
          title: "占い師を追加しました！",
          description: "新しい占い師との鑑定をお楽しみください",
          color: "gold",
        };
      case "premium":
        return {
          icon: <Crown className="w-16 h-16 text-purple-400" />,
          title: "プレミアム会員になりました！",
          description: "無制限で全占い師に相談できます",
          color: "purple",
        };
      default:
        return {
          icon: <CheckCircle className="w-16 h-16 text-green-400" />,
          title: "購入完了！",
          description: "ご購入ありがとうございます",
          color: "green",
        };
    }
  };

  const info = getPurchaseInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background mystical-bg p-4">
      <Card className="glass-card max-w-md w-full text-center">
        <CardHeader className="pb-2">
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-white/5 animate-pulse">
              {info.icon}
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gold">
            {info.title}
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            {info.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white/5 rounded-lg p-4 space-y-3">
            {isPremium ? (
              <div className="flex items-center justify-center gap-2 text-purple-400">
                <Crown className="w-5 h-5" />
                <span className="font-bold">プレミアム会員</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">現在の残り鑑定回数</p>
                <p className="text-4xl font-bold text-gold">
                  {remainingReadings || 0}
                  <span className="text-lg text-muted-foreground ml-1">回</span>
                </p>
              </>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            <p>ご購入いただきありがとうございます。</p>
            <p>六神ノ間をお楽しみください。</p>
          </div>
          <div className="space-y-3 pt-4">
            <Link href="/dashboard">
              <Button className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-6 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                鑑定を始める
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/subscription">
              <Button variant="outline" className="w-full border-white/20 mt-2">
                <CreditCard className="w-4 h-4 mr-2" />
                プラン・お支払いを確認
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
