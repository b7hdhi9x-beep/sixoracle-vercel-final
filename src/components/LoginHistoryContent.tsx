"use client";

import { useState, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Clock, Smartphone, Wifi } from "lucide-react";

type LoginHistory = {
  id: string;
  created_at: string;
  ip_address: string;
  device_info: string;
};

export default function LoginHistoryContent() {
  const { user, loading } = useAuth();
  const [history, setHistory] = useState<LoginHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      try {
        const supabase = getSupabaseClient();
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const { data, error } = await supabase
          .from("login_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setHistory(data || []);
      } catch (err: any) {
        setError("ログイン履歴の取得に失敗しました: " + err.message);
      }
    };

    if (!loading) {
      fetchHistory();
    }
  }, [user, loading]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-serif text-amber-400 mb-8 text-center"
        >
          ログイン履歴
        </motion.h1>

        {loading && <p className="text-center text-gray-400">読み込み中...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && history.length === 0 && (
          <p className="text-center text-gray-400">ログイン履歴はありません。</p>
        )}

        {!loading && !error && history.length > 0 && (
          <div className="space-y-4">
            {history.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="flex-grow">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-gray-300 font-mono">
                      {new Date(item.created_at).toLocaleString("ja-JP")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Wifi className="w-5 h-5 text-amber-400" />
                    <span className="text-gray-400 font-mono">{item.ip_address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-amber-400" />
                    <span className="text-gray-400 text-sm">{item.device_info}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
