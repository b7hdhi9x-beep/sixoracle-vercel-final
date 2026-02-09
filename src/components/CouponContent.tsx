
"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Ticket, Star, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabaseClient } from '@/lib/supabase';

interface DiscountInfo {
  code: string;
  description: string;
  discount_value: number;
}

export default function CouponContent() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<DiscountInfo | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('クーポンコードを入力してください。');
      return;
    }
    if (!isAuthenticated) {
      setError('この機能を利用するにはログインが必要です。');
      return;
    }

    setIsLoading(true);
    setError('');
    setDiscountInfo(null);

    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const response = await fetch('/api/coupon/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ code: couponCode }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'クーポンの適用に失敗しました。');
      }

      setDiscountInfo(result.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white font-serif p-4 sm:p-8 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <Star key={i} className="absolute text-amber-400/20 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 5 + 5}s`
            }}
          />
        ))}
      </div>

      <motion.div
        className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 z-10 shadow-2xl shadow-purple-500/10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-serif text-amber-400 mb-2">クーポン</h1>
          <p className="text-gray-300">お手持ちのクーポンコードをご入力ください。</p>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="relative">
            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400/50" />
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="例: PREMIUM2024"
              className="w-full bg-white/5 border border-amber-500/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-300"
              disabled={isLoading || authLoading}
            />
          </div>

          <motion.button
            onClick={handleApplyCoupon}
            disabled={isLoading || authLoading}
            className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2" />
                適用中...
              </>
            ) : (
              'クーポンを適用'
            )}
          </motion.button>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-400/30"
          >
            {error}
          </motion.div>
        )}

        {discountInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 p-6 bg-gradient-to-br from-purple-600/20 to-amber-500/20 border border-amber-500/30 rounded-xl shadow-inner-lg text-center"
          >
            <motion.h2 variants={itemVariants} className="text-2xl font-serif text-amber-300 mb-3">クーポン適用完了</motion.h2>
            <motion.p variants={itemVariants} className="text-gray-200 text-lg mb-1">コード: <span className="font-bold text-white">{discountInfo.code}</span></motion.p>
            <motion.p variants={itemVariants} className="text-gray-200 text-lg mb-3">内容: <span className="font-bold text-white">{discountInfo.description}</span></motion.p>
            <motion.p variants={itemVariants} className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-purple-400">
              {discountInfo.discount_value}% OFF
            </motion.p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
