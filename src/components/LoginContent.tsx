"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import { Sparkles, Phone, Lock, ArrowRight, ArrowLeft } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const { login, isAuthenticated, loading } = useAuth();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("電話番号を入力してください");
      return;
    }
    setError("");
    setStep("code");
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(phone, code);
    if (success) {
      router.push("/dashboard");
    } else {
      setError("認証コードが正しくありません（デモ: 1234）");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mystical-bg relative">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center shadow-2xl mb-4">
            <Sparkles className="w-10 h-10 text-mystic-bg" />
          </div>
          <h1 className="text-3xl font-serif gradient-text mb-2">六神ノ間</h1>
          <p className="text-gray-400 text-sm">運命の扉を開くために、まずはログインしてください</p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {step === "phone" ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div>
                <label className="block text-sm text-gray-400 mb-2">電話番号</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="090-1234-5678"
                    className="w-full bg-mystic-bg border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                認証コードを送信
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              <button
                type="button"
                onClick={() => { setStep("phone"); setError(""); }}
                className="text-gray-400 hover:text-gold transition-colors flex items-center gap-1 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                電話番号を変更
              </button>
              <div>
                <label className="block text-sm text-gray-400 mb-2">認証コード</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="4桁のコード"
                    maxLength={4}
                    className="w-full bg-mystic-bg border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors text-center text-2xl tracking-[0.5em]"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  デモ用コード: <span className="text-gold">1234</span>
                </p>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                ログイン
                <Sparkles className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          ログインすることで、
          <a href="/terms" className="text-gold/60 hover:text-gold">利用規約</a>
          と
          <a href="/privacy" className="text-gold/60 hover:text-gold">プライバシーポリシー</a>
          に同意したものとみなされます。
        </p>
      </motion.div>
    </div>
  );
}
