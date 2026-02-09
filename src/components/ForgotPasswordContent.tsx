"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

export default function ForgotPasswordContent() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!email) {
      setError("メールアドレスを入力してください。");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(`エラーが発生しました: ${error.message}`);
    } else {
      setMessage("パスワードリセット用のメールを送信しました。メールボックスをご確認ください。");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white flex items-center justify-center p-4 font-serif">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-amber-400">パスワードをお忘れですか？</h1>
          <p className="text-gray-300 mt-2">パスワードをリセットするためのリンクをメールで送信します。</p>
        </div>

        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/10 border border-amber-500/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-400 focus:ring-2 focus:ring-amber-400 focus:outline-none transition-all duration-300"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-t-2 border-b-2 border-white rounded-full"
                />
                <span>送信中...</span>
              </>
            ) : (
              <>
                <Send size={20} />
                <span>リセットメールを送信</span>
              </>
            )}
          </motion.button>
        </form>

        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-green-400 bg-green-500/10 p-3 rounded-lg"
          >
            {message}
          </motion.p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-center text-red-400 bg-red-500/10 p-3 rounded-lg"
          >
            {error}
          </motion.p>
        )}

        <div className="mt-8 text-center">
          <motion.button
            onClick={() => router.push("/login")}
            className="text-gray-300 hover:text-amber-400 transition-colors duration-300"
            whileHover={{ textShadow: "0px 0px 8px rgba(251, 191, 36, 0.5)" }}
          >
            ログインページに戻る
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
