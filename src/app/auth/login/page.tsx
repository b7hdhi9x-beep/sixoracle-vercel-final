"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const URL_ERROR_MESSAGES: Record<string, string> = {
  no_code: "認証コードが見つかりませんでした。もう一度お試しください。",
  auth_failed: "認証に失敗しました。もう一度お試しください。",
  no_user: "ユーザー情報を取得できませんでした。もう一度お試しください。",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function localizeError(message: string): string {
  if (message === "Invalid login credentials") {
    return "メールアドレスまたはパスワードが正しくありません";
  }
  if (message.includes("Email not confirmed")) {
    return "メールアドレスが確認されていません";
  }
  return message;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  // URLパラメータからエラー/メッセージを取得
  useEffect(() => {
    const urlError = searchParams.get("error");
    const urlMessage = searchParams.get("message");
    if (urlError && URL_ERROR_MESSAGES[urlError]) {
      setError(URL_ERROR_MESSAGES[urlError]);
    }
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(localizeError(error.message));
      setLoading(false);
      return;
    }

    // DB同期
    try {
      await fetch("/api/auth/sync-user", { method: "POST" });
    } catch {
      // DB同期失敗でもリダイレクトは続行
    }

    router.push(redirectTo);
    router.refresh();
  }

  async function handleGoogleLogin() {
    setError("");
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) {
      setError(localizeError(error.message));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <Link href="/">
            <h1 className="font-[var(--font-cinzel)] text-3xl text-[#d4af37] glow-gold tracking-wider">
              六神ノ間
            </h1>
          </Link>
          <p className="text-[#9ca3af] text-sm">アカウントにログイン</p>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Google ログイン */}
        <Button
          onClick={handleGoogleLogin}
          variant="outline"
          className="w-full border-[rgba(212,175,55,0.3)] text-white hover:bg-[rgba(255,255,255,0.05)] py-6"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Googleでログイン
        </Button>

        {/* 区切り線 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[rgba(212,175,55,0.15)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-[#0a0a1a] text-[#9ca3af]">または</span>
          </div>
        </div>

        {/* メール・パスワードログイン */}
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-[#9ca3af]">メールアドレス</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(212,175,55,0.2)] text-white placeholder:text-[#9ca3af]/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[#9ca3af]">パスワード</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="bg-[rgba(255,255,255,0.05)] border-[rgba(212,175,55,0.2)] text-white placeholder:text-[#9ca3af]/50"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d4af37] hover:bg-[#f4d03f] text-[#0a0a1a] font-bold py-6 disabled:opacity-50"
          >
            {loading ? "ログイン中..." : "ログイン"}
          </Button>
        </form>

        {/* 新規登録リンク */}
        <p className="text-center text-sm text-[#9ca3af]">
          アカウントをお持ちでない方は{" "}
          <Link
            href={`/auth/signup?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-[#d4af37] hover:text-[#f4d03f] underline"
          >
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
