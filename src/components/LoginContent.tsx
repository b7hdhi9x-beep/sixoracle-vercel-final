"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { StarField } from "@/components/StarField";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowLeft, Eye, EyeOff, Loader2, Moon } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const { signIn, signUp, isAuthenticated, loading } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      setIsLoading(false);
      return;
    }

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("パスワードが一致しません");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        setIsLoading(false);
        return;
      }

      const { error: signUpError } = await signUp(email, password);
      if (signUpError) {
        if (signUpError.includes("already registered")) {
          setError("このメールアドレスは既に登録されています");
        } else {
          setError(signUpError);
        }
      } else {
        setSuccess("確認メールを送信しました。メールを確認してアカウントを有効化してください。");
      }
    } else {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        if (signInError.includes("Invalid login")) {
          setError("メールアドレスまたはパスワードが正しくありません");
        } else if (signInError.includes("Email not confirmed")) {
          setError("メールアドレスの確認が完了していません。確認メールをご確認ください。");
        } else {
          setError(signInError);
        }
      } else {
        router.push("/dashboard");
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 mystical-bg relative">
      <StarField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">トップに戻る</span>
        </button>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Moon className="w-8 h-8 text-amber-400" />
            <span className="text-2xl font-serif font-bold gradient-text">六神ノ間</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">
            {mode === "login" ? "ログイン" : "新規登録"}
          </h1>
          <p className="text-gray-400 text-sm">
            {mode === "login"
              ? "メールアドレスとパスワードでログイン"
              : "アカウントを作成して占いを始めましょう"}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">メールアドレス</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-mystic-bg border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">パスワード</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="6文字以上"
                  className="w-full bg-mystic-bg border border-gray-700 rounded-xl py-3 pl-11 pr-12 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-sm text-gray-400 mb-2">パスワード（確認）</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="もう一度入力"
                    className="w-full bg-mystic-bg border border-gray-700 rounded-xl py-3 pl-11 pr-4 text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === "login" ? "ログイン" : "アカウント作成"}
                </>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
                setSuccess("");
              }}
              className="text-sm text-gold hover:text-gold-light transition-colors"
            >
              {mode === "login"
                ? "アカウントをお持ちでない方はこちら →"
                : "← すでにアカウントをお持ちの方はこちら"}
            </button>
          </div>
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
