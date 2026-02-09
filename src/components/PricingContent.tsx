"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import {
  Crown, Check, Star, Sparkles, ArrowLeft, Loader2, Moon,
} from "lucide-react";

export default function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile, isAuthenticated, isPremiumActive } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const canceled = searchParams.get("subscription") === "canceled";

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          returnUrl: window.location.origin,
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        alert("決済ページの作成に失敗しました。しばらくしてからお試しください。");
      }
    } catch {
      alert("エラーが発生しました。しばらくしてからお試しください。");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!profile?.stripe_customer_id) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: profile.stripe_customer_id,
          returnUrl: window.location.origin + "/pricing",
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch {
      alert("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen mystical-bg relative">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">戻る</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-serif font-bold gradient-text">六神ノ間</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif gradient-text mb-4">料金プラン</h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            11人のAI占い師による鑑定を、心ゆくまで。
          </p>
        </div>

        {canceled && (
          <div className="mb-8 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-center">
            決済がキャンセルされました。いつでもお申し込みいただけます。
          </div>
        )}

        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-card rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-purple-500 to-pink-500" />

            <div className="p-8 md:p-10">
              {/* Plan Badge */}
              <div className="flex items-center justify-center mb-6">
                <span className="px-4 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  プレミアムプラン
                </span>
              </div>

              {/* Price */}
              <div className="text-center mb-8">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-white">¥2,900</span>
                  <span className="text-xl text-gray-400">/ 月（税込）</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {[
                  "11人のAI占い師全員に相談可能",
                  "鑑定回数 1日100回まで",
                  "24時間いつでも相談可能",
                  "チャット履歴の永久保存",
                  "プロフィール連携で精度UP",
                  "優先サポート対応",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              {isPremiumActive ? (
                <div className="space-y-3">
                  <div className="text-center p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <Star className="w-5 h-5 text-green-400 mx-auto mb-2" />
                    <p className="text-green-400 font-medium">プレミアム会員です</p>
                  </div>
                  {profile?.stripe_customer_id && (
                    <button
                      onClick={handleManageSubscription}
                      disabled={isLoading}
                      className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50"
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "サブスクリプションを管理"}
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      今すぐプレミアムに登録
                    </>
                  )}
                </button>
              )}

              <p className="text-center text-xs text-gray-500 mt-4">
                ※ いつでも解約可能です。Stripeによる安全な決済処理を使用しています。
              </p>
            </div>
          </div>
        </motion.div>

        {/* Free Plan Info */}
        <div className="mt-8 max-w-lg mx-auto">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-lg font-medium text-gray-300 mb-4">無料プラン</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-500" />
                累計5回まで無料で鑑定可能
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-500" />
                11人の占い師から選択可能
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-gray-500" />
                チャット履歴の保存
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
