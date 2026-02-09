"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Calendar, CreditCard, LogOut, Star, ExternalLink } from "lucide-react";

interface SubscriptionStatus {
  plan: string;
  nextBillingDate: string | null;
  status: string;
}

export default function SubscriptionContent() {
  const { user, isAuthenticated, loading, isPremiumActive, refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        if (!token) {
          throw new Error("Authentication token not found.");
        }

        const res = await fetch("/api/subscription/status", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch subscription status.");
        }

        const data = await res.json();
        setSubscription({
          plan: data.plan,
          nextBillingDate: data.next_billing_date ? new Date(data.next_billing_date).toLocaleDateString('ja-JP') : 'N/A',
          status: data.status,
        });
      } catch (e: any) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [isAuthenticated]);

  const handleManageSubscription = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        throw new Error("Failed to create Stripe portal session.");
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (e: any) {
      setError(e.message);
    }
  };
  
  const handleCancelSubscription = async () => {
    // This would typically open a modal for confirmation
    // For now, we'll just log it and redirect to the portal
    console.log("Cancellation initiated");
    await handleManageSubscription();
  };


  if (loading || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <div className="text-white font-serif">読み込み中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e]">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-white mb-4">アクセス権がありません</h2>
          <p className="text-gray-300">サブスクリプション情報を表示するにはログインしてください。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-8">
      <div className="absolute inset-0 z-0 opacity-10">
          {/* Starry background effect */}
      </div>
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto relative z-10"
      >
        <h1 className="text-4xl sm:text-5xl font-serif text-center mb-8 text-amber-400">サブスクリプション管理</h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">
            <p>エラー: {error}</p>
          </div>
        )}

        {isPremiumActive && subscription ? (
          <motion.div 
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-amber-500/30">
              <div>
                <h2 className="text-2xl font-serif text-amber-400 flex items-center">
                  <Star className="w-6 h-6 mr-3 text-amber-400" />
                  現在のプラン: {subscription.plan}
                </h2>
                <p className="text-gray-300 mt-1">ステータス: <span className="font-semibold text-green-400">{subscription.status}</span></p>
              </div>
              <button 
                onClick={handleManageSubscription}
                className="mt-4 md:mt-0 bg-white/10 hover:bg-white/20 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-300 border border-white/20"
              >
                Stripeポータルへ <ExternalLink className="w-4 h-4 ml-2" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg">
                <Calendar className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-gray-400">次回更新日</p>
                  <p className="text-xl font-semibold text-gray-200">{subscription.nextBillingDate}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-black/20 rounded-lg">
                <CreditCard className="w-8 h-8 text-amber-400" />
                <div>
                  <p className="text-gray-400">支払い方法</p>
                  <p className="text-xl font-semibold text-gray-200">Stripeで管理</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-400 mb-4">プランの変更や請求情報の更新はStripeポータルで行えます。</p>
              <button 
                onClick={handleCancelSubscription}
                className="bg-red-800/50 hover:bg-red-700/60 text-white font-bold py-3 px-8 rounded-lg flex items-center justify-center mx-auto transition-colors duration-300 group"
              >
                <LogOut className="w-5 h-5 mr-3 transform group-hover:-translate-x-1 transition-transform" />
                <span>解約手続きへ</span>
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="text-center bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-serif text-white mb-4">有効なサブスクリプションがありません</h2>
            <p className="text-gray-300 mb-6">現在、有効なサブスクリプションはありません。全ての機能を利用するには、プランへの登録が必要です。</p>
            <a href="/pricing" className="bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-lg inline-block transition-all duration-300 transform hover:scale-105">
              料金プランを見る
            </a>
          </div>
        )}
      </motion.main>
    </div>
  );
}
