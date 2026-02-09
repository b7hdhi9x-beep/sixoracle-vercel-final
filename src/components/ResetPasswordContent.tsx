"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Lock, AlertTriangle, CheckCircle } from "lucide-react";

export default function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (password.length < 6) {
      setError("パスワードは6文字以上である必要があります。");
      setLoading(false);
      return;
    }

    const supabase = getSupabaseClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.push("/"), 2000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#0a0a1a] to-[#1a1a2e] text-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: Math.random(), scale: Math.random() * 2 }}
            transition={{ duration: Math.random() * 2 + 1, repeat: Infinity, repeatType: "reverse" }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3}px`,
              height: `${Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif text-amber-400">パスワードリセット</h1>
            <p className="text-gray-400 mt-2">新しいパスワードを設定してください。</p>
          </div>

          <form onSubmit={handlePasswordReset}>
            <div className="relative mb-6">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="新しいパスワード"
                required
                className="w-full bg-white/5 border border-amber-500/30 rounded-lg py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "更新中..." : "パスワードを更新"}
            </motion.button>
          </form>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center text-red-400 bg-red-500/10 p-3 rounded-lg"
            >
              <AlertTriangle className="mr-2" size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center text-green-400 bg-green-500/10 p-3 rounded-lg"
            >
              <CheckCircle className="mr-2" size={20} />
              <span>パスワードが正常に更新されました。</span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
