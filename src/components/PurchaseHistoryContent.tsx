"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Loader2, RefreshCw, AlertCircle, History } from "lucide-react";

type Payment = {
  id: string;
  created_at: string;
  amount: number;
  status: "succeeded" | "pending" | "failed";
};

export default function PurchaseHistoryContent() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPayments();
    }
  }, [isAuthenticated]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("認証トークンがありません。");
      }

      const res = await fetch("/api/payments", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "決済履歴の取得に失敗しました。");
      }

      const data = await res.json();
      setPayments(data.payments || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = (status: Payment["status"]) => {
    switch (status) {
      case "succeeded":
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">成功</span>;
      case "pending":
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">保留中</span>;
      case "failed":
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">失敗</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">不明</span>;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <AlertCircle className="w-16 h-16 text-amber-500 mb-4" />
        <h2 className="text-2xl font-serif mb-2">アクセスできません</h2>
        <p className="text-gray-400">購入履歴を表示するにはログインが必要です。</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-8">
      <motion.div
        className="max-w-4xl mx-auto"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-serif text-amber-400 flex items-center">
            <History className="mr-4" />
            購入履歴
          </h1>
          <motion.button
            onClick={fetchPayments}
            disabled={loading}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RefreshCw className={`w-5 h-5 text-gray-300 ${loading ? `animate-spin` : ''}`} />
          </motion.button>
        </div>

        {loading && !payments.length ? (
          <div className="flex justify-center items-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : error ? (
          <motion.div
            className="bg-red-900/50 border border-red-500/30 text-red-300 px-4 py-3 rounded-2xl flex items-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="mr-3" />
            <span>エラー: {error}</span>
          </motion.div>
        ) : payments.length === 0 ? (
          <motion.div
            className="text-center py-16 px-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3 className="text-xl font-serif text-gray-300">購入履歴はありません</h3>
            <p className="text-gray-400 mt-2">まだ何も購入されていないようです。</p>
          </motion.div>
        ) : (
          <motion.div
            className="overflow-x-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <table className="min-w-full divide-y divide-white/10">
              <thead className="bg-white/5">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-serif">日付</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-serif">金額</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-serif">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payments.map((payment) => (
                  <motion.tr key={payment.id} variants={itemVariants} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{new Date(payment.created_at).toLocaleDateString("ja-JP")}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">¥{payment.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusChip(payment.status)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
