"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { User, Bot, Loader, AlertTriangle } from "lucide-react";

// データ型定義
interface Message {
  id: string;
  created_at: string;
  content: string;
  role: "user" | "assistant";
}

interface FortuneTeller {
  id: string;
  name: string;
  avatar_url: string;
}

interface SessionData {
  messages: Message[];
  fortune_teller: FortuneTeller;
}

export default function ReadingHistoryContent() {
  const { user, loading: authLoading, token } = useAuth();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !token || !sessionId) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/sessions/messages?session_id=${sessionId}`, {
          headers: { Authorization: "Bearer " + token },
        });

        if (!res.ok) {
          throw new Error("鑑定履歴の取得に失敗しました。");
        }

        const result = await res.json();
        setData(result);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [sessionId, token, authLoading]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <Loader className="animate-spin text-amber-400" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h2 className="text-xl font-serif text-amber-400">エラー</h2>
        <p className="text-gray-300">{error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { messages, fortune_teller } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-gray-300 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-serif text-amber-400 mb-2">鑑定履歴</h1>
          <p className="text-gray-400">セッションの詳細なやり取り</p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {messages.map((message) => (
            <motion.div
              key={message.id}
              variants={itemVariants}
              className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              {message.role === "assistant" && (
                <img src={fortune_teller.avatar_url || "/default-avatar.png"} alt={fortune_teller.name} className="w-10 h-10 rounded-full border-2 border-amber-500/30" />
              )}

              <div className={`max-w-lg w-full ${message.role === "user" ? "text-right" : "text-left"}`}>
                 {message.role === "assistant" && (
                    <p className="text-sm text-amber-400 font-serif mb-1">{fortune_teller.name}</p>
                )}
                <div
                  className={`px-4 py-3 rounded-2xl ${message.role === "user"
                      ? "bg-purple-600/20 text-white"
                      : "bg-white/5 backdrop-blur-lg border border-white/10"
                    }`}>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                 <p className="text-xs text-gray-500 mt-1">{new Date(message.created_at).toLocaleString("ja-JP")}</p>
              </div>

              {message.role === "user" && (
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
